import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const currentUser = await db.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/login");

  const users = await db.user.findMany({
    include: { appointments: true }
  });

  return (
    <DashboardLayout role="ADMIN" userName={currentUser.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Gestión de Usuarios</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4 border-b border-slate-100">Empleado</th>
              <th className="p-4 border-b border-slate-100">Usuario</th>
              <th className="p-4 border-b border-slate-100">Rol Sistema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                <td className="p-4 text-sm text-slate-600">{u.username}</td>
                <td className="p-4 text-sm text-slate-600">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
