import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PatientHistoryClient } from "@/app/admisionista/pacientes/PatientHistoryClient";

export default async function AdminPatientHistoryPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/login");

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

  if (!patient) redirect("/admin/pacientes");

  return (
    <DashboardLayout role="ADMIN" userName={user.name}>
      <PatientHistoryClient patient={patient} currentUserId={user.id} backUrl="/admin/pacientes" />
    </DashboardLayout>
  );
}
