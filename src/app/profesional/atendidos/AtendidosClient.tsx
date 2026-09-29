"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AtendidosClient({ patients }: { patients: any[] }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {patients.map(p => (
        <PatientCard key={p.id} p={p} router={router} />
      ))}
      {patients.length === 0 && (
        <p className="text-center text-slate-500 p-8">No has atendido ni dejado observaciones a ningún paciente aún.</p>
      )}
    </div>
  );
}

function PatientCard({ p, router }: { p: any, router: any }) {
  const [expanded, setExpanded] = useState(false);
  const maxInitial = 2;
  const maxExpanded = 10;
  
  const displayedAppointments = expanded 
    ? p.appointments.slice(0, maxExpanded) 
    : p.appointments.slice(0, maxInitial);

  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{p.lastName}, {p.firstName}</h3>
          <p className="text-xs text-slate-500">DNI: {p.dni} | Edad: {p.age}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Últimas Observaciones</h4>
          <ul className="space-y-2">
            {p.observations.slice(0, 3).map((obs: any) => (
              <li key={obs.id} className="text-sm text-slate-600 bg-slate-50 p-2 rounded-md">
                {obs.observation.substring(0, 100)}{obs.observation.length > 100 ? '...' : ''}
              </li>
            ))}
            {p.observations.length === 0 && <li className="text-sm text-slate-400">Sin observaciones previas.</li>}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Historial de Turnos</h4>
          <ul className="space-y-1">
            {displayedAppointments.map((app: any) => (
              <li key={app.id} className="text-xs text-slate-600 flex justify-between border-b border-slate-50 pb-1">
                <span>{app.date}</span>
                <span className="font-medium">{app.status}</span>
              </li>
            ))}
            {p.appointments.length === 0 && <li className="text-sm text-slate-400">Sin turnos registrados.</li>}
          </ul>
          
          {p.appointments.length > maxInitial && !expanded && (
            <button 
              onClick={() => setExpanded(true)}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              Ver más turnos ({p.appointments.length - maxInitial})
            </button>
          )}
          
          {expanded && p.appointments.length > maxExpanded && (
            <button 
              onClick={() => router.push('/profesional/calendario')}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              Ver agenda completa en calendario
            </button>
          )}
          
          {expanded && (
            <button 
              onClick={() => setExpanded(false)}
              className="mt-2 ml-3 text-xs font-bold text-slate-500 hover:underline"
            >
              Ocultar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
