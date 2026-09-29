"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createPatient(data: FormData) {
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const dni = data.get("dni") as string;
  const age = parseInt(data.get("age") as string);
  const phone = data.get("phone") as string;
  const adminNotes = data.get("adminNotes") as string;

  const dateStr = data.get("date") as string;
  const timeStr = data.get("time") as string;

  const now = new Date();
  const dateInArg = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Cordoba" }));
  
  const defaultDate = `${dateInArg.getFullYear()}-${String(dateInArg.getMonth() + 1).padStart(2, '0')}-${String(dateInArg.getDate()).padStart(2, '0')}`;
  const defaultTime = `${String(dateInArg.getHours()).padStart(2, '0')}:${String(dateInArg.getMinutes()).padStart(2, '0')}`;
  
  const finalDate = dateStr || defaultDate;
  const finalTime = timeStr || defaultTime;
  
  let endHour = (parseInt(finalTime.split(':')[0]) + 1) % 24;
  const finalEndTime = `${String(endHour).padStart(2, '0')}:${finalTime.split(':')[1]}`;

  await db.patient.create({
    data: {
      firstName,
      lastName,
      dni,
      age,
      phone,
      adminNotes,
      appointments: {
        create: {
          date: finalDate,
          startTime: finalTime,
          endTime: finalEndTime,
          status: "CONFIRMED",
        }
      }
    },
  });

  revalidatePath("/admisionista");
  revalidatePath("/profesional");
  revalidatePath("/admisionista/calendario");
  revalidatePath("/profesional/calendario");
}

export async function getPatients() {
  return await db.patient.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      appointments: {
        include: { professional: true }
      },
      observations: {
        include: { professional: true }
      }
    }
  });
}

export async function createAppointment(data: FormData) {
  const patientId = data.get("patientId") as string;
  const professionalId = data.get("professionalId") as string;
  const date = data.get("date") as string;
  const startTime = data.get("startTime") as string;
  const endTime = data.get("endTime") as string;

  await db.appointment.create({
    data: {
      patientId,
      professionalId,
      date,
      startTime,
      endTime,
      status: "CONFIRMED",
    },
  });

  revalidatePath("/admisionista");
  revalidatePath("/profesional");
}

export async function addObservation(data: FormData) {
  const patientId = data.get("patientId") as string;
  const professionalId = data.get("professionalId") as string;
  const observation = data.get("observation") as string;

  await db.professionalObservation.create({
    data: {
      patientId,
      professionalId,
      observation,
    }
  });

  revalidatePath("/admisionista");
  revalidatePath("/profesional");
}

export async function saveEvolutionAndReschedule(data: FormData) {
  const patientId = data.get("patientId") as string;
  const professionalId = data.get("professionalId") as string;
  const appointmentId = data.get("appointmentId") as string;
  const observation = data.get("observation") as string;
  const rescheduleDataStr = data.get("rescheduleData") as string;

  let observationText = observation;

  if (rescheduleDataStr) {
    const rescheduleData = JSON.parse(rescheduleDataStr);
    
    if (rescheduleData.type === 'single') {
      let endHour = (parseInt(rescheduleData.time.split(':')[0]) + 1) % 24;
      const finalEndTime = `${String(endHour).padStart(2, '0')}:${rescheduleData.time.split(':')[1]}`;

      await db.appointment.create({
        data: {
          patientId,
          professionalId,
          date: rescheduleData.date,
          startTime: rescheduleData.time,
          endTime: finalEndTime,
          status: "PENDIENTE",
        }
      });
      observationText += `\n[Sistema: Turno reasignado para el ${rescheduleData.date} a las ${rescheduleData.time}]`;
    } else if (rescheduleData.type === 'series') {
      // Create multiple appointments for series
      const startDate = new Date(rescheduleData.startDate);
      const weeks = parseInt(rescheduleData.weeks);
      const days = rescheduleData.days; // array of strings 'L', 'M', 'X', 'J', 'V'
      
      const dayMap: Record<string, number> = { 'L': 1, 'M': 2, 'X': 3, 'J': 4, 'V': 5, 'S': 6, 'D': 0 };
      
      for (let w = 0; w < weeks; w++) {
        for (const dayChar of days) {
          const targetDay = dayMap[dayChar];
          const appDate = new Date(startDate);
          // Advance to the target day of the week
          const currentDay = appDate.getDay();
          const distance = (targetDay + 7 - currentDay) % 7;
          appDate.setDate(appDate.getDate() + distance + (w * 7));
          
          const appDateStr = appDate.toISOString().split('T')[0];
          
          await db.appointment.create({
            data: {
              patientId,
              professionalId,
              date: appDateStr,
              startTime: "10:00", // Defaulting to 10:00 since the mock didn't capture time for series
              endTime: "11:00",
              status: "PENDIENTE",
            }
          });
        }
      }
      observationText += `\n[Sistema: Serie de turnos reasignada por ${weeks} semanas los días ${days.join(', ')} desde el ${rescheduleData.startDate}]`;
    }
  }

  const newObservation = await db.professionalObservation.create({
    data: {
      patientId,
      professionalId,
      appointmentId: appointmentId || undefined,
      observation: observationText,
    }
  });

  if (appointmentId) {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "FINALIZADO" }
    });
  }

  revalidatePath("/profesional");
  revalidatePath("/profesional/atendidos");
  revalidatePath("/admisionista/calendario");
}

export async function getProfessionals() {
  return await db.user.findMany({
    where: { role: "PROFESSIONAL" }
  });
}

export async function deleteUser(data: FormData) {
  const id = data.get("id") as string;
  await db.user.delete({ where: { id } });
  
  await db.auditLog.create({
    data: {
      action: "DELETE_USER",
      entityType: "USER",
      entityId: id,
      details: "Se eliminó el usuario",
    }
  });
  
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function createUser(data: FormData) {
  const name = data.get("name") as string;
  const username = data.get("username") as string;
  const password = data.get("password") as string;
  const role = data.get("role") as string;

  const newUser = await db.user.create({
    data: { name, username, password, role }
  });
  
  await db.auditLog.create({
    data: {
      action: "CREATE_USER",
      entityType: "USER",
      entityId: newUser.id,
      details: `Se creó el usuario ${username} con rol ${role}`,
    }
  });

  revalidatePath("/admin/users");
}

export async function updateUser(data: FormData) {
  const id = data.get("id") as string;
  const name = data.get("name") as string;
  const username = data.get("username") as string;
  const password = data.get("password") as string;
  const role = data.get("role") as string;

  const updateData: any = { name, username, role };
  if (password && password.trim() !== "") {
    updateData.password = password;
  }

  await db.user.update({
    where: { id },
    data: updateData
  });
  
  await db.auditLog.create({
    data: {
      action: "UPDATE_USER",
      entityType: "USER",
      entityId: id,
      details: `Se modificó el perfil de ${username}`,
    }
  });

  revalidatePath("/admin/users");
}

export async function updateMyProfile(data: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;
  if (!userId) return { success: false, error: "No autorizado" };

  const name = data.get("name") as string;
  const password = data.get("password") as string;

  const updateData: any = { name };
  if (password && password.trim() !== "") {
    updateData.password = password;
  }

  await db.user.update({
    where: { id: userId },
    data: updateData
  });
  
  await db.auditLog.create({
    data: {
      action: "UPDATE_MY_PROFILE",
      entityType: "USER",
      entityId: userId,
      details: `El usuario actualizó su perfil (nombre y/o contraseña)`,
    }
  });

  // En una app real podríamos actualizar la cookie o revalidar path global, pero por ahora revalidamos los layouts
  revalidatePath("/", "layout");
  return { success: true };
}

export async function assignAppointmentToMe(data: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;
  if (!userId) return;

  const appointmentId = data.get("appointmentId") as string;
  await db.appointment.update({
    where: { id: appointmentId },
    data: { professionalId: userId, status: "ASIGNADO" }
  });

  revalidatePath("/profesional/calendario");
  revalidatePath("/profesional");
  revalidatePath("/profesional/pacientes");
  revalidatePath("/admisionista/calendario");
  revalidatePath("/admin/calendario");
}

export async function markAsAttended(data: FormData) {
  const appointmentId = data.get("appointmentId") as string;
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "ATENDIDO" }
  });

  revalidatePath("/profesional");
  revalidatePath("/profesional/atendidos");
  revalidatePath("/profesional/calendario");
}

export async function markAsArrived(data: FormData) {
  const appointmentId = data.get("appointmentId") as string;
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "LLEGADA_CONFIRMADA" }
  });

  revalidatePath("/admisionista");
  revalidatePath("/admisionista/calendario");
  revalidatePath("/admisionista/pacientes");
  revalidatePath("/profesional/calendario");
  revalidatePath("/admin/calendario");
}

export async function updatePatient(data: FormData) {
  const id = data.get("id") as string;
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const dni = data.get("dni") as string;
  const age = parseInt(data.get("age") as string);
  const phone = data.get("phone") as string;
  const adminNotes = data.get("adminNotes") as string;

  await db.patient.update({
    where: { id },
    data: { firstName, lastName, dni, age, phone, adminNotes },
  });

  revalidatePath("/admisionista/pacientes");
  revalidatePath("/admisionista");
}

export async function deletePatient(data: FormData) {
  const id = data.get("id") as string;

  // We should also delete related appointments and observations to maintain referential integrity if they have cascade on, or do it manually.
  await db.appointment.deleteMany({ where: { patientId: id } });
  await db.professionalObservation.deleteMany({ where: { patientId: id } });

  await db.patient.delete({ where: { id } });

  revalidatePath("/admisionista/pacientes");
  revalidatePath("/admisionista");
}

// ----------------------------------------------------
// NOTES MODULE (POSTICKS)
// ----------------------------------------------------

export async function createNote(data: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;
  if (!userId) return;

  const title = data.get("title") as string;
  const content = data.get("content") as string;
  let color = data.get("color") as string;

  if (!color) {
    const COLORS = ['yellow', 'green', 'blue', 'pink', 'purple'];
    color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  await db.note.create({
    data: {
      title,
      content,
      color,
      ownerId: userId,
    }
  });

  revalidatePath("/notas");
}

export async function updateNote(data: FormData) {
  const id = data.get("id") as string;
  const title = data.get("title") as string;
  const content = data.get("content") as string;
  const color = data.get("color") as string;

  await db.note.update({
    where: { id },
    data: { title, content, color }
  });

  revalidatePath("/notas");
}

export async function deleteNote(data: FormData) {
  const id = data.get("id") as string;

  await db.note.delete({ where: { id } });

  revalidatePath("/notas");
}

export async function shareNote(data: FormData) {
  const noteId = data.get("noteId") as string;
  const targetUserId = data.get("userId") as string;
  const actionType = data.get("actionType") as string;

  if (actionType === "add") {
    await db.note.update({
      where: { id: noteId },
      data: {
        sharedWith: { connect: { id: targetUserId } }
      }
    });
  } else {
    await db.note.update({
      where: { id: noteId },
      data: {
        sharedWith: { disconnect: { id: targetUserId } }
      }
    });
  }

  revalidatePath("/notas");
}
