import { db } from "@/lib/db";
import { getPatients, createAppointment, addObservation } from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfessionalDashboardClient } from "./ProfessionalDashboardClient";

export default async function ProfesionalPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  const patients = await getPatients();
  
  // Filter only patients that have an appointment with this professional
  const myPatients = patients.filter(p => 
    p.appointments.some(a => a.professionalId === user.id) || 
    p.observations.some(o => o.professionalId === user.id)
  );

  const appointments = await db.appointment.findMany({
    where: { professionalId: user.id },
    include: { patient: true },
    orderBy: { date: 'asc' }
  });

  return (
    <DashboardLayout role="PROFESSIONAL" userName={user.name}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi Panel de Actividades</h1>
          <p className="text-slate-500 mt-1">Bienvenido, Lic. {user.name}. Aquí está el resumen de tu agenda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">
            Abrir Bloqueo de Agenda
          </button>
        </div>
      </div>

      <ProfessionalDashboardClient user={user} appointments={appointments} myPatients={myPatients} />
    </DashboardLayout>
  );
}
