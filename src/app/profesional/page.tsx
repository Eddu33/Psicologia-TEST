import { db } from "@/lib/db";
import { getPatients, createAppointment, addObservation } from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth-actions";

export default async function ProfesionalPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PROFESSIONAL") {
    redirect("/login");
  }

  const patients = await getPatients();

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel Profesional - {user.name}</h1>
        <form action={logout}>
          <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Cerrar Sesión</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Pacientes Registrados</h2>
          <div className="flex flex-col gap-4">
            {patients.map(patient => (
              <div key={patient.id} className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-lg">{patient.lastName}, {patient.firstName}</h3>
                <p className="text-sm text-gray-700">DNI: {patient.dni} | Edad: {patient.age} | Tel: {patient.phone}</p>
                <p className="text-sm mt-2"><span className="font-semibold">Obs. Admisionista:</span> {patient.adminNotes}</p>
                
                {/* Agendar Turno */}
                <div className="mt-4 p-4 border rounded bg-white">
                  <h4 className="font-semibold mb-2">Dar Turno</h4>
                  <form action={createAppointment} className="flex flex-wrap gap-2 items-end">
                    <input type="hidden" name="patientId" value={patient.id} />
                    <input type="hidden" name="professionalId" value={user.id} />
                    <div className="flex flex-col">
                      <label className="text-xs">Fecha</label>
                      <input type="date" name="date" required className="border p-1 rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs">Hora Inicio</label>
                      <input type="time" name="startTime" required className="border p-1 rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs">Hora Fin</label>
                      <input type="time" name="endTime" required className="border p-1 rounded" />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm h-8 hover:bg-green-700">
                      Agendar
                    </button>
                  </form>
                </div>

                {/* Agregar Observación */}
                <div className="mt-4 p-4 border rounded bg-white">
                  <h4 className="font-semibold mb-2">Agregar Observación Profesional</h4>
                  <form action={addObservation} className="flex flex-col gap-2">
                    <input type="hidden" name="patientId" value={patient.id} />
                    <input type="hidden" name="professionalId" value={user.id} />
                    <textarea name="observation" required className="border p-2 rounded text-sm w-full" rows={2} placeholder="Observación del profesional..."></textarea>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm self-start hover:bg-blue-700">
                      Guardar Observación
                    </button>
                  </form>
                </div>

                {/* Historial de Turnos */}
                <div className="mt-4">
                  <h4 className="font-semibold text-sm border-b pb-1">Historial de Turnos</h4>
                  <ul className="text-sm mt-2">
                    {patient.appointments.map(app => (
                      <li key={app.id}>
                        - {app.date} {app.startTime}-{app.endTime} con {app.professional?.name || 'Profesional'}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Historial de Observaciones */}
                <div className="mt-4">
                  <h4 className="font-semibold text-sm border-b pb-1">Observaciones Profesionales</h4>
                  <ul className="text-sm mt-2">
                    {patient.observations.map(obs => (
                      <li key={obs.id} className="mt-1">
                        <span className="font-semibold">{obs.professional?.name}:</span> {obs.observation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
