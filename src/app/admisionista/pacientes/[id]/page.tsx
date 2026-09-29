import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PatientHistoryClient } from "../PatientHistoryClient";

export default async function AdmisionistaPatientHistoryPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMISIONISTA") redirect("/login");

  const patient = await db.patient.findUnique({
    where: { id: params.id },
    include: {
      appointments: {
        include: { professional: true },
        orderBy: { date: 'desc' }
      },
      observations: {
        include: { professional: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!patient) redirect("/admisionista/pacientes");

  return (
    <DashboardLayout role="ADMISIONISTA" userName={user.name}>
      <PatientHistoryClient patient={patient} currentUserId={user.id} backUrl="/admisionista/pacientes" />
    </DashboardLayout>
  );
}
