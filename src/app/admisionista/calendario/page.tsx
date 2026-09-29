import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarClient } from "./CalendarClient";

export default async function AdmisionistaCalendarioPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMISIONISTA") redirect("/login");

  const appointments = await db.appointment.findMany({
    include: { patient: true, professional: true },
    orderBy: { date: 'asc' }
  });

  return (
    <DashboardLayout role="ADMISIONISTA" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Calendario Global y Reagendas</h1>
      <p className="text-sm text-slate-500 mb-6">Visualización de movimientos, reprogramaciones y estados de turnos de todos los profesionales.</p>
      
      <CalendarClient appointments={appointments} />
    </DashboardLayout>
  );
}
