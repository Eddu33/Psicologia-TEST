import { createPatient, getPatients } from "@/app/actions";

export default async function AdmisionistaPage() {
  const patients = await getPatients();

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Panel de Admisionistas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cargar Paciente</h2>
          <form action={createPatient} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" name="firstName" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input type="text" name="lastName" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">DNI</label>
              <input type="text" name="dni" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Edad</label>
              <input type="number" name="age" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input type="text" name="phone" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observación del Admisionista</label>
              <textarea name="adminNotes" className="w-full border p-2 rounded" rows={3}></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700">
              Guardar Paciente
            </button>
          </form>
        </div>

        <div className="col-span-2 bg-white p-6 rounded-lg shadow overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Lista de Pacientes y Turnos</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Paciente</th>
                <th className="p-2">DNI</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Obs. Admisionista</th>
                <th className="p-2">Turnos (Profesional)</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{patient.lastName}, {patient.firstName} (Edad: {patient.age})</td>
                  <td className="p-2">{patient.dni}</td>
                  <td className="p-2">{patient.phone}</td>
                  <td className="p-2 text-sm">{patient.adminNotes}</td>
                  <td className="p-2 text-sm">
                    {patient.appointments.length > 0 ? (
                      <ul className="list-disc ml-4">
                        {patient.appointments.map(app => (
                          <li key={app.id}>
                            {app.date} {app.startTime}-{app.endTime} con {app.professional?.name || 'Profesional Eliminado'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">Sin turnos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
