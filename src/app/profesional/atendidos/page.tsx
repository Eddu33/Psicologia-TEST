import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AtendidosClient } from "./AtendidosClient";

export default async function ProfesionalAtendidosPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  // Patients who have ATENDIDO appointments or observations from this professional
  const patients = await db.patient.findMany({
    where: {
      OR: [
        { appointments: { some: { professionalId: user.id, status: 'ATENDIDO' } } },
        { observations: { some: { professionalId: user.id } } }
      ]
    },
    include: {
      appointments: { where: { professionalId: user.id }, orderBy: { date: 'desc' } },
      observations: { where: { professionalId: user.id }, orderBy: { createdAt: 'desc' } }
    }
  });

  return (
    <DashboardLayout role="PROFESSIONAL" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Pacientes Atendidos</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
        <p className="text-sm text-slate-500 mb-6">Listado de pacientes con atenciones finalizadas, reagendas e historial clínico de observaciones.</p>
        
        <AtendidosClient patients={patients} />
      </div>
    </DashboardLayout>
  );
}
