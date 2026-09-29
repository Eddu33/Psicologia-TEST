import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserPlus } from "lucide-react";
import { createUser, deleteUser } from "@/app/actions";
import Link from "next/link";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const currentUser = await db.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/login");

  const users = await db.user.findMany({
    include: { appointments: true },
    orderBy: { name: 'asc' }
  });

  return (
    <DashboardLayout role="ADMIN" userName={currentUser.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Gestión de Usuarios y Roles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla - 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Listado Activo</h2>
            <p className="text-sm text-slate-500">Usuarios del sistema</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4 border-b border-slate-100">Empleado</th>
                  <th className="p-4 border-b border-slate-100">Usuario</th>
                  <th className="p-4 border-b border-slate-100">Rol</th>
                  <th className="p-4 border-b border-slate-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="p-4 text-sm text-slate-600">{u.username}</td>
                    <td className="p-4 text-sm font-medium">
                      <span className={`px-2 py-1 rounded-md ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : u.role === 'ADMISIONISTA' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2 items-center">
                      <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2">Editar</Link>
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="text-red-600 hover:text-red-800 text-sm font-medium px-2">Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crear Usuario - 1/3 */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Nuevo Usuario
            </h2>
          </div>
          <div className="p-6">
            <form action={createUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nombre Completo</label>
                <input type="text" name="name" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Florencia Toranzo" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nombre de Usuario (Login)</label>
                <input type="text" name="username" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. ftoranzo" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Contraseña Temporal</label>
                <input type="text" name="password" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contraseña..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Rol de Sistema</label>
                <select name="role" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="PROFESSIONAL">Profesional</option>
                  <option value="ADMISIONISTA">Admisionista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <button type="submit" className="mt-2 bg-indigo-600 text-white p-3 rounded-xl font-medium hover:bg-indigo-700 w-full">
                Crear Usuario
              </button>
            </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
