import { createPatient, getPatients, markAsArrived } from "@/app/actions";
import { DashboardLayout } from "@/components/DashboardLayout";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, UserPlus, FileText, CheckCircle2, CheckCircle } from "lucide-react";

export default async function AdmisionistaPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMISIONISTA") redirect("/login");

  const patients = await getPatients();

  const now = new Date();
  const dateInArg = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Cordoba" }));
  const todayStr = `${dateInArg.getFullYear()}-${String(dateInArg.getMonth() + 1).padStart(2, '0')}-${String(dateInArg.getDate()).padStart(2, '0')}`;

  const patientsToday = patients.filter(patient => 
    patient.appointments.some(app => app.date === todayStr)
  );

  return (
    <DashboardLayout role="ADMISIONISTA" userName={user.name}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Control - Admisión</h1>
        <p className="text-slate-500 mt-1">Gestiona pacientes y asignación de turnos a profesionales.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pacientes</p>
            <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Turnos Agendados</p>
            <p className="text-2xl font-bold text-slate-900">
              {patients.reduce((acc, p) => acc + p.appointments.length, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Atención Hoy</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Pacientes - Ocupa 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Directorio de Pacientes</h2>
              <p className="text-sm text-slate-500">Pacientes con turno agendado para el día de hoy ({todayStr})</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4 border-b border-slate-100">Paciente</th>
                  <th className="p-4 border-b border-slate-100">Contacto</th>
                  <th className="p-4 border-b border-slate-100">Próximo Turno</th>
                  <th className="p-4 border-b border-slate-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsToday.map(patient => {
                  const todayAppointments = patient.appointments.filter(a => a.date === todayStr);
                  const latestAppointment = todayAppointments.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
                  
                  return (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{patient.lastName}, {patient.firstName}</p>
                          <p className="text-xs text-slate-500">DNI: {patient.dni} • {patient.age} años</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {patient.phone}
                    </td>
                    <td className="p-4">
                      {latestAppointment ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-800">
                            Hoy, {latestAppointment.startTime}
                          </span>
                          <span className="text-xs text-blue-600 font-medium">
                            con {latestAppointment.professional?.name || '...'}
                          </span>
                          {latestAppointment.status !== 'ATENDIDO' && latestAppointment.status !== 'LLEGADA_CONFIRMADA' && (
                            <form action={markAsArrived}>
                              <input type="hidden" name="appointmentId" value={latestAppointment.id} />
                              <button type="submit" className="flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wide font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-md transition-colors w-fit">
                                <CheckCircle className="w-3 h-3" /> Confirmar Llegada
                              </button>
                            </form>
                          )}
                          {latestAppointment.status === 'LLEGADA_CONFIRMADA' && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wide font-bold text-amber-600">
                              <CheckCircle className="w-3 h-3" /> En espera
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Sin turnos hoy
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admisionista/pacientes?search=${patient.dni}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver Ficha</Link>
                    </td>
                  </tr>
                )})}
                {patientsToday.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No hay pacientes agendados para el día de hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cargar Paciente - Ocupa 1/3 */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Nuevo Paciente
            </h2>
            <p className="text-sm text-slate-500 mt-1">Registra un paciente en la base de datos</p>
          </div>
          <div className="p-6">
            <form action={createPatient} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nombre</label>
                  <input type="text" name="firstName" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ej. Juan" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Apellido</label>
                  <input type="text" name="lastName" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ej. Pérez" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">DNI</label>
                  <input type="text" name="dni" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Sin puntos" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Edad</label>
                  <input type="number" name="age" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Años" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Teléfono</label>
                <input type="text" name="phone" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ej. 11 1234-5678" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Fecha (Opcional)</label>
                  <input type="date" name="date" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Hora (Opcional)</label>
                  <input type="time" name="time" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Observaciones</label>
                <textarea name="adminNotes" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none" rows={3} placeholder="Motivo de consulta, derivación, etc..."></textarea>
              </div>
              
              <button type="submit" className="mt-2 bg-blue-600 text-white p-3 rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 w-full">
                <UserPlus className="w-4 h-4" />
                Guardar Paciente
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
