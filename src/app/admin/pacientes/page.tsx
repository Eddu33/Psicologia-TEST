import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PatientDirectoryClient } from "@/app/admisionista/pacientes/PatientDirectoryClient";

export default async function AdminPacientesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/login");

  const patients = await db.patient.findMany({
    orderBy: { createdAt: "desc" },
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

  return (
    <DashboardLayout role="ADMIN" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Directorio Completo de Pacientes</h1>
      <PatientDirectoryClient patients={patients} currentUserId={user.id} />
    </DashboardLayout>
  );
}
