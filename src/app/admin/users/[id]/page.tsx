import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { updateUser } from "@/app/actions";
import Link from "next/link";

export default async function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const currentUser = await db.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/login");

  const resolvedParams = await params;
  const editUser = await db.user.findUnique({ where: { id: resolvedParams.id } });
  
  if (!editUser) redirect("/admin/users");

  return (
    <DashboardLayout role="ADMIN" userName={currentUser.name}>
      <div className="mb-6">
        <Link href="/admin/users" className="text-indigo-600 text-sm font-medium hover:underline">← Volver al Listado</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Editar Usuario: {editUser.name}</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-xl">
        <form action={updateUser} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={editUser.id} />
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nombre Completo</label>
            <input type="text" name="name" defaultValue={editUser.name} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nombre de Usuario (Login)</label>
            <input type="text" name="username" defaultValue={editUser.username} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nueva Contraseña (Dejar vacío para mantener actual)</label>
            <input type="text" name="password" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Escribe para cambiar..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Rol de Sistema</label>
            <select name="role" defaultValue={editUser.role} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="PROFESSIONAL">Profesional</option>
              <option value="ADMISIONISTA">Admisionista</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          
          <button type="submit" className="mt-4 bg-indigo-600 text-white p-3 rounded-xl font-medium hover:bg-indigo-700 w-full">
            Guardar Cambios
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
