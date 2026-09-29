import { db } from "@/lib/db";
import { getPatients, createAppointment, addObservation } from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar, FileText, CheckCircle2, Clock, XCircle, UserX, Plus } from "lucide-react";

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Calendarios y Resumen (2/3 width on LG) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Módulos de Estado de Turnos (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-2 h-full bg-emerald-500"></div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmados</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-2 h-full bg-blue-500"></div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelados</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">2</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-2 h-full bg-slate-400"></div>
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ausentes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">1</p>
              </div>
            </div>
          </div>

          {/* Agenda del Día */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Agenda del Día (Dividida)
              </h2>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></span> Ocupado (Otro Lic.)
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></span> Licencia
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span> Feriado
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Turno Mañana</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <div className="w-16 text-center">
                    <p className="text-sm font-bold text-slate-700">08:00</p>
                    <p className="text-xs text-slate-500">08:45</p>
                  </div>
                  <div className="w-1 bg-emerald-400 h-10 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">Juan Pérez</p>
                    <p className="text-xs text-emerald-700">Consulta Confirmada</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl border border-green-200 bg-green-50">
                  <div className="w-16 text-center">
                    <p className="text-sm font-bold text-slate-700">09:00</p>
                    <p className="text-xs text-slate-500">09:45</p>
                  </div>
                  <div className="w-1 bg-green-400 h-10 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Ocupado por otro Lic.</p>
                    <p className="text-xs text-green-700">Lic. María Gómez - Paciente: Ana Sol</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors cursor-pointer border-dashed">
                  <div className="w-16 text-center">
                    <p className="text-sm font-bold text-slate-400">10:00</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-2">
                    <p className="text-sm font-medium text-slate-400">Horario Libre</p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Turno Tarde</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-xl border border-blue-100 bg-blue-50/30">
                  <div className="w-16 text-center">
                    <p className="text-sm font-bold text-slate-700">14:00</p>
                    <p className="text-xs text-slate-500">14:45</p>
                  </div>
                  <div className="w-1 bg-blue-400 h-10 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">María Rodríguez</p>
                    <p className="text-xs text-blue-700">Cancelado por Lic.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-100">
                  <div className="w-16 text-center">
                    <p className="text-sm font-bold text-slate-700">15:00</p>
                    <p className="text-xs text-slate-500">15:45</p>
                  </div>
                  <div className="w-1 bg-slate-400 h-10 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Carlos Gómez</p>
                    <p className="text-xs text-slate-600">Ausente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Mis Pacientes y Observaciones (1/3 width on LG) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Mis Pacientes y Citas
              </h2>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {myPatients.length > 0 ? myPatients.map(patient => (
                <div key={patient.id} className="border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{patient.lastName}, {patient.firstName}</h3>
                      <p className="text-xs text-slate-500">DNI: {patient.dni}</p>
                    </div>
                    <button className="text-blue-600 p-1 hover:bg-blue-50 rounded">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mt-3 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Nota Admisionista:</p>
                    <p className="text-xs text-amber-700">{patient.adminNotes || 'Sin notas'}</p>
                  </div>

                  {/* Formulario de Observación para Admisionistas */}
                  <form action={addObservation} className="mt-3 flex flex-col gap-2">
                    <input type="hidden" name="patientId" value={patient.id} />
                    <input type="hidden" name="professionalId" value={user.id} />
                    <textarea 
                      name="observation" 
                      required 
                      className="border border-slate-200 p-2 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none resize-none" 
                      rows={2} 
                      placeholder="Observación visible para admisionistas..."
                    ></textarea>
                    <button type="submit" className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors self-end">
                      Guardar Observación
                    </button>
                  </form>

                  {/* Historial Breve */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Últimas Citas:</p>
                    {patient.appointments.slice(0, 2).map(app => (
                      <div key={app.id} className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{app.date} | {app.startTime}-{app.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-500 text-sm mt-10">
                  No tienes pacientes asignados actualmente.
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
