import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, UserCog, Calendar, Activity, Search, ShieldCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const currentUser = await db.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/login");

  const [users, patients, appointments] = await Promise.all([
    db.user.findMany({
      include: {
        appointments: true,
      }
    }),
    db.patient.count(),
    db.appointment.findMany({
      include: {
        patient: true,
        professional: true,
      },
      orderBy: { date: 'desc' },
      take: 10
    })
  ]);

  const professionals = users.filter(u => u.role === "PROFESSIONAL");
  const admisionistas = users.filter(u => u.role === "ADMISIONISTA");

  return (
    <DashboardLayout role="ADMIN" userName={currentUser.name}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Administrativo General</h1>
          <p className="text-slate-500 mt-1">Visión global del sistema, usuarios y auditorías.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Gestionar Usuarios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            <p className="text-sm font-medium text-slate-500">Usuarios Totales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <UserCog className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{professionals.length}</p>
            <p className="text-sm font-medium text-slate-500">Profesionales Activos</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{patients}</p>
            <p className="text-sm font-medium text-slate-500">Pacientes Registrados</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
            <p className="text-sm font-medium text-slate-500">Turnos Históricos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Tabla de Empleados y Roles */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Listado de Personal</h2>
              <p className="text-sm text-slate-500">Control de acceso y asignación de roles</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input type="text" placeholder="Buscar empleado..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4 border-b border-slate-100">Empleado</th>
                  <th className="p-4 border-b border-slate-100">Usuario</th>
                  <th className="p-4 border-b border-slate-100">Rol Sistema</th>
                  <th className="p-4 border-b border-slate-100">Actividad (Turnos)</th>
                  <th className="p-4 border-b border-slate-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{u.username}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {u.role === 'PROFESSIONAL' ? `${u.appointments.length} turnos asignados` : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Editar</button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registro de Auditoría */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Auditoría Reciente
            </h2>
            <p className="text-sm text-slate-500 mt-1">Movimientos recientes en el sistema</p>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {appointments.map(app => (
              <div key={app.id} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Turno Agendado
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Profesional <span className="font-medium text-slate-700">{app.professional?.name || 'Sistema'}</span> 
                  {' '}para paciente <span className="font-medium text-slate-700">{app.patient.firstName} {app.patient.lastName}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(app.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-4">No hay actividad reciente.</p>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
