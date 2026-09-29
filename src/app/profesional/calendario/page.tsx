import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarClient } from "@/app/admisionista/calendario/CalendarClient";

export default async function ProfesionalCalendarioPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  // El profesional ve todos los turnos globales para evitar solapamientos visuales (Calendario Global)
  const appointments = await db.appointment.findMany({
    include: { 
      patient: {
        include: { observations: true }
      }, 
      professional: true 
    },
    orderBy: { date: 'asc' }
  });

  return (
    <DashboardLayout role="PROFESSIONAL" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Calendario Global</h1>
      <p className="text-sm text-slate-500 mb-6">Visualización de movimientos y estados de turnos en el calendario general.</p>
      
      <CalendarClient appointments={appointments} currentUserId={user.id} userRole="PROFESSIONAL" />
    </DashboardLayout>
  );
}
