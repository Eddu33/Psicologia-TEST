"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPatient(data: FormData) {
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const dni = data.get("dni") as string;
  const age = parseInt(data.get("age") as string);
  const phone = data.get("phone") as string;
  const adminNotes = data.get("adminNotes") as string;

  await db.patient.create({
    data: {
      firstName,
      lastName,
      dni,
      age,
      phone,
      adminNotes,
    },
  });

  revalidatePath("/admisionista");
  revalidatePath("/profesional");
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
  revalidatePath("/admin");
}
