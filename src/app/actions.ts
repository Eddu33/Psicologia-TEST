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
