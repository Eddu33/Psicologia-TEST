import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function ProfesionalCalendarioPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  const appointments = await db.appointment.findMany({
    where: { professionalId: user.id },
    include: { patient: true },
    orderBy: { date: 'desc' }
  });

  return (
    <DashboardLayout role="PROFESSIONAL" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Mi Historial de Calendario</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
        <p className="text-sm text-slate-500 mb-6">Listado histórico de todas las citas asignadas a tu agenda.</p>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4 border-b border-slate-100">Fecha y Hora</th>
              <th className="p-4 border-b border-slate-100">Paciente</th>
              <th className="p-4 border-b border-slate-100">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map(app => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{app.date} | {app.startTime} - {app.endTime}</td>
                <td className="p-4 text-sm text-slate-600">{app.patient.firstName} {app.patient.lastName}</td>
                <td className="p-4 text-sm text-slate-600">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-slate-500">No hay historial de citas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
