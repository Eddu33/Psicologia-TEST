import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PatientDirectoryClient } from "./PatientDirectoryClient";

export default async function AdmisionistaPacientesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMISIONISTA") redirect("/login");

  const patients = await db.patient.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout role="ADMISIONISTA" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Directorio Completo de Pacientes</h1>
      <PatientDirectoryClient patients={patients} />
    </DashboardLayout>
  );
}
