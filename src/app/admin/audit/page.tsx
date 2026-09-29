import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function AdminAuditPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const currentUser = await db.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/login");

  const appointments = await db.appointment.findMany({
    include: { patient: true, professional: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout role="ADMIN" userName={currentUser.name}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Registro de Auditoría</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 space-y-4">
        {appointments.map(app => (
          <div key={app.id} className="border-b border-slate-100 pb-4">
            <p className="text-sm font-semibold text-slate-800">Turno Agendado</p>
            <p className="text-xs text-slate-500">
              {app.professional?.name || 'Sistema'} asignó turno para {app.patient.firstName} {app.patient.lastName} el {app.date}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
