"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, Calendar as CalendarIcon, Clock, User, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export function PatientHistoryClient({ patient, currentUserId, backUrl }: { patient: any, currentUserId: string, backUrl: string }) {
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  if (!patient) return null;

  return (
    <div className="w-full pb-12">
      <Link href={backUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Volver al Directorio
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Historial Clínico</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4" />
              {patient.lastName}, {patient.firstName}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">DNI</p>
              <p className="font-medium text-slate-800">{patient.dni}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Teléfono</p>
              <p className="font-medium text-slate-800">{patient.phone}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-4">
          {patient.appointments?.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Este paciente no tiene turnos registrados en su historial.</p>
            </div>
          ) : (
            patient.appointments?.map((app: any) => {
              const isExpanded = expandedAppointment === app.id;
              
              const observation = patient.observations?.find((obs: any) => obs.professionalId === app.professionalId);
              const isObservationVisible = app.professionalId === currentUserId || !observation;
              
              return (
                <div key={app.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md bg-white">
                  <div 
                    className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}`}
                    onClick={() => setExpandedAppointment(isExpanded ? null : app.id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-lg font-bold leading-none">{app.date.split('-')[2]}</span>
                        <span className="text-xs uppercase font-semibold">{new Date(app.date).toLocaleString('es-ES', { month: 'short' })}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            {app.startTime} - {app.endTime}
                          </p>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5" />
                          Lic. {app.professional?.name || 'No asignado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-400 bg-white p-2 rounded-full border border-slate-100 shadow-sm">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profesional Tratante</p>
                            <p className="font-semibold text-slate-800">{app.professional?.name || 'No asignado'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Cita</p>
                            <p className="font-semibold text-slate-800">{app.status}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Detalles / Observaciones del Profesional
                        </p>
                        {observation ? (
                          <div className={`p-4 rounded-xl border text-sm ${!isObservationVisible ? 'border-red-100 bg-red-50 text-red-800 font-medium text-center py-6' : 'border-indigo-100 bg-indigo-50/30'}`}>
                            {!isObservationVisible ? (
                              <p>Información confidencial solamente para el Lic. {app.professional?.name || 'que lo atendió'}</p>
                            ) : (
                              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{observation.observation}</p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm">
                            <p className="text-slate-500 italic">No hay notas clínicas registradas para esta consulta.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
