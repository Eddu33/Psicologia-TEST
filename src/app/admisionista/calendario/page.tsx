import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
        <p className="text-sm text-slate-500 mb-6">Visualización de movimientos, reprogramaciones y estados de turnos de todos los profesionales.</p>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4 border-b border-slate-100">Fecha y Hora</th>
              <th className="p-4 border-b border-slate-100">Paciente</th>
              <th className="p-4 border-b border-slate-100">Profesional</th>
              <th className="p-4 border-b border-slate-100">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map(app => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{app.date} | {app.startTime} - {app.endTime}</td>
                <td className="p-4 text-sm text-slate-600">{app.patient.firstName} {app.patient.lastName}</td>
                <td className="p-4 text-sm text-slate-600">{app.professional?.name || 'No asignado'}</td>
                <td className="p-4 text-sm text-slate-600">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium bg-slate-100`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">No hay turnos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
