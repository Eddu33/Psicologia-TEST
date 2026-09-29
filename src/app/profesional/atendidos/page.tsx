import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function ProfesionalAtendidosPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  // Patients who have COMPLETED appointments or observations from this professional
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
        
        <div className="space-y-6">
          {patients.map(p => (
            <div key={p.id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{p.lastName}, {p.firstName}</h3>
                  <p className="text-xs text-slate-500">DNI: {p.dni} | Edad: {p.age}</p>
                </div>
                <button className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Reagendar Turno
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Últimas Observaciones</h4>
                  <ul className="space-y-2">
                    {p.observations.slice(0, 3).map(obs => (
                      <li key={obs.id} className="text-sm text-slate-600 bg-slate-50 p-2 rounded-md">
                        {obs.observation}
                      </li>
                    ))}
                    {p.observations.length === 0 && <li className="text-sm text-slate-400">Sin observaciones previas.</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Historial de Turnos</h4>
                  <ul className="space-y-1">
                    {p.appointments.slice(0, 3).map(app => (
                      <li key={app.id} className="text-xs text-slate-600 flex justify-between border-b border-slate-50 pb-1">
                        <span>{app.date}</span>
                        <span className="font-medium">{app.status}</span>
                      </li>
                    ))}
                    {p.appointments.length === 0 && <li className="text-sm text-slate-400">Sin turnos registrados.</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          {patients.length === 0 && (
            <p className="text-center text-slate-500 p-8">No has atendido ni dejado observaciones a ningún paciente aún.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
