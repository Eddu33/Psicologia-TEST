import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function AdmisionistaPacientesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMISIONISTA") redirect("/login");

  const patients = await db.patient.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout role="ADMISIONISTA" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Directorio Completo de Pacientes</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4 border-b border-slate-100">Paciente</th>
              <th className="p-4 border-b border-slate-100">DNI</th>
              <th className="p-4 border-b border-slate-100">Teléfono</th>
              <th className="p-4 border-b border-slate-100">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{p.lastName}, {p.firstName}</td>
                <td className="p-4 text-sm text-slate-600">{p.dni}</td>
                <td className="p-4 text-sm text-slate-600">{p.phone}</td>
                <td className="p-4 text-sm text-slate-600">{p.adminNotes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
