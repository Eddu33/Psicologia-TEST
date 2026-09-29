"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, FileText, CheckCircle2, Clock, XCircle, UserX, Plus, CalendarDays, ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import { markAsAttended } from "@/app/actions";

export function ProfessionalDashboardClient({ user, appointments, myPatients }: { user: any, appointments: any[], myPatients: any[] }) {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [actionModal, setActionModal] = useState<'cancel' | 'reschedule' | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  
  const [rescheduleType, setRescheduleType] = useState<'single' | 'series'>('single');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  const [toastMessage, setToastMessage] = useState<{title: string, desc: string, type: 'success' | 'info'} | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAtender = async (appId: string) => {
    const formData = new FormData();
    formData.append("appointmentId", appId);
    await markAsAttended(formData);
    showToast("Turno marcado como ATENDIDO", "Ahora puedes escribir la evolución en 'Mis Pacientes y Citas'", "success");
    setSelectedApp(null);
  };

  const handleCancel = async () => {
    // Aquí iría el server action para cancelar con motivo (ej. markAsCancelled)
    showToast("Turno cancelado", `Motivo registrado: ${cancelReason}`, "info");
    setActionModal(null);
    setSelectedApp(null);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // Funciones básicas de calendario
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Columna Izquierda: Agenda (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atendidos</p>
              <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'ATENDIDO').length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CalendarIcon className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'ASIGNADO' || a.status === 'CONFIRMED').length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><XCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelados</p>
              <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'CANCELADO').length}</p>
            </div>
          </div>
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Agenda: {view === 'daily' ? 'Diaria' : 'Semanal'}
            </h2>
            <div className="flex bg-slate-200 rounded-lg p-1">
              <button 
                onClick={() => setView('daily')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Día
              </button>
              <button 
                onClick={() => setView('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'weekly' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Semana
              </button>
            </div>
          </div>
          
          <div className="p-5">
            {/* Header control días */}
            <div className="flex items-center justify-between mb-6">
              <button className="p-2 hover:bg-slate-100 rounded-full" onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - (view === 'daily' ? 1 : 7));
                setCurrentDate(newDate);
              }}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-slate-800 capitalize">
                {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button className="p-2 hover:bg-slate-100 rounded-full" onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + (view === 'daily' ? 1 : 7));
                setCurrentDate(newDate);
              }}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {view === 'daily' ? (
              <div className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No tienes citas programadas para este día.</p>
                ) : (
                  todayAppointments.map(app => (
                    <div key={app.id} onClick={() => setSelectedApp(app)} className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-colors ${app.status === 'ATENDIDO' ? 'border-emerald-200 bg-emerald-50' : selectedApp?.id === app.id ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <div className="w-16 text-center">
                        <p className="text-sm font-bold text-slate-700">{app.startTime}</p>
                        <p className="text-xs text-slate-500">{app.endTime}</p>
                      </div>
                      <div className={`w-1 h-10 rounded-full ${app.status === 'ATENDIDO' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                      <div className="flex-1">
                        <p className={`font-semibold ${app.status === 'ATENDIDO' ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {app.patient.lastName}, {app.patient.firstName}
                        </p>
                        <p className="text-xs text-slate-500">{app.status}</p>
                      </div>
                      
                      {selectedApp?.id === app.id && app.status !== 'ATENDIDO' && (
                        <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                          <button onClick={(e) => { e.stopPropagation(); handleAtender(app.id); }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                            Atender
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setActionModal('reschedule'); }} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                            Reasignar
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setActionModal('cancel'); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-500 text-center">Resumen de la semana a partir del {currentDate.toLocaleDateString()}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() + i);
                    const dStr = d.toISOString().split('T')[0];
                    const dayApps = appointments.filter(a => a.date === dStr);
                    
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${dayApps.length > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-slate-50'}`}>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        {dayApps.length > 0 ? (
                          <div className="space-y-2">
                            {dayApps.map(a => (
                              <div key={a.id} className="text-xs bg-white p-2 rounded border border-slate-200 shadow-sm flex justify-between">
                                <span className="font-semibold text-slate-700">{a.startTime}</span>
                                <span className="text-slate-600 truncate ml-2">{a.patient.lastName}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 py-2">Sin citas</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Mis Pacientes y Observaciones */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Mis Pacientes y Citas
            </h2>
            <p className="text-xs text-slate-500 mt-1">Evoluciones y reagendas</p>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {myPatients.length > 0 ? myPatients.map(patient => (
              <div key={patient.id} className="border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{patient.lastName}, {patient.firstName}</h3>
                    <p className="text-xs text-slate-500">DNI: {patient.dni}</p>
                  </div>
                </div>
                
                <form className="mt-3 flex flex-col gap-2">
                  <input type="hidden" name="patientId" value={patient.id} />
                  <textarea 
                    name="observation" 
                    required 
                    className="border border-slate-200 p-3 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50" 
                    rows={3} 
                    placeholder="Escribir evolución u observación (privado)..."
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <button type="button" className="text-indigo-600 text-xs font-bold hover:underline" onClick={() => setActionModal('reschedule')}>
                      + Reagendar turno
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                      Guardar Evolución
                    </button>
                  </div>
                </form>
              </div>
            )) : (
              <div className="text-center text-slate-500 text-sm mt-10">
                No tienes pacientes en tratamiento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cancelación */}
      {actionModal === 'cancel' && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                 <XCircle className="w-5 h-5" /> Cancelar Turno
               </h3>
               <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
             </div>
             <p className="text-sm text-slate-600 mb-4">Por favor indica el motivo de la cancelación. Esto quedará registrado en el historial público del paciente.</p>
             <textarea 
               value={cancelReason}
               onChange={e => setCancelReason(e.target.value)}
               className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none mb-4" 
               rows={3} 
               placeholder="Ej: Paciente avisa que está enfermo..."
             ></textarea>
             <div className="flex justify-end gap-3">
               <button onClick={() => setActionModal(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Volver</button>
               <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors shadow-sm">Confirmar Cancelación</button>
             </div>
           </div>
        </div>
      )}

      {/* Modal Reagenda */}
      {actionModal === 'reschedule' && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                 <CalendarDays className="w-5 h-5" /> Reagendar Turno
               </h3>
               <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
             </div>
             <p className="text-sm text-slate-600 mb-6">Configura la nueva agenda para este paciente.</p>
             
             <div className="flex gap-4 mb-6">
               <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                 <input type="radio" name="rescheduleType" checked={rescheduleType === 'single'} onChange={() => setRescheduleType('single')} className="text-indigo-600 focus:ring-indigo-500" />
                 Turno Único
               </label>
               <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                 <input type="radio" name="rescheduleType" checked={rescheduleType === 'series'} onChange={() => setRescheduleType('series')} className="text-indigo-600 focus:ring-indigo-500" />
                 Serie de Turnos
               </label>
             </div>

             <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
               {rescheduleType === 'single' ? (
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Fecha del Turno</label>
                     <input type="date" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Hora</label>
                     <input type="time" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                 </div>
               ) : (
                 <>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Días de la semana</label>
                     <div className="flex gap-2 mt-2">
                       {['L', 'M', 'X', 'J', 'V'].map(d => (
                         <button 
                           key={d} 
                           onClick={() => toggleDay(d)}
                           className={`w-8 h-8 rounded-full border font-bold text-sm transition-colors ${selectedDays.includes(d) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-500 hover:text-indigo-600'}`}
                         >
                           {d}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Cantidad de Semanas (Réplica)</label>
                     <input type="number" min="1" defaultValue="2" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Fecha de inicio</label>
                     <input type="date" className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                 </>
               )}
             </div>

             <div className="flex justify-end gap-3 mt-6">
               <button onClick={() => setActionModal(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
               <button onClick={() => {
                 showToast("Turnos Generados", rescheduleType === 'single' ? "El turno único fue reasignado." : "La serie de turnos fue programada.", "success");
                 setActionModal(null);
               }} className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Generar Turno(s)</button>
             </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`rounded-xl shadow-lg border p-4 flex gap-3 items-start max-w-sm ${toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : <Info className="w-5 h-5 text-blue-600 mt-0.5" />}
            <div>
              <p className={`font-bold text-sm ${toastMessage.type === 'success' ? 'text-emerald-900' : 'text-blue-900'}`}>{toastMessage.title}</p>
              <p className={`text-xs mt-1 ${toastMessage.type === 'success' ? 'text-emerald-700' : 'text-blue-700'}`}>{toastMessage.desc}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 ml-auto"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

    </div>
  );
}
