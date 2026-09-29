import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PatientDirectoryClient } from "@/app/admisionista/pacientes/PatientDirectoryClient";
import { getPatients } from "@/app/actions";

export default async function ProfesionalPacientesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  const patients = await getPatients();

  return (
    <DashboardLayout role="PROFESSIONAL" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Directorio de Pacientes</h1>
      <PatientDirectoryClient patients={patients} currentUserId={user.id} basePath="/profesional/pacientes" />
    </DashboardLayout>
  );
}
