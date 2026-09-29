import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function ProfesionalPacientesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");

  const patients = await db.patient.findMany({
    where: {
      OR: [
        { appointments: { some: { professionalId: user.id } } },
        { observations: { some: { professionalId: user.id } } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout role="PROFESSIONAL" userName={user.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Mis Pacientes Asignados</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4 border-b border-slate-100">Paciente</th>
              <th className="p-4 border-b border-slate-100">DNI</th>
              <th className="p-4 border-b border-slate-100">Edad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{p.lastName}, {p.firstName}</td>
                <td className="p-4 text-sm text-slate-600">{p.dni}</td>
                <td className="p-4 text-sm text-slate-600">{p.age} años</td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-slate-500">No tienes pacientes asignados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
