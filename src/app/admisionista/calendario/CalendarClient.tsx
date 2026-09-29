"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { assignAppointmentToMe } from "@/app/actions";

export function CalendarClient({ appointments, currentUserId, userRole }: { appointments: any[], currentUserId: string, userRole?: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  // Array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i); // Adjust if Monday is first

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <input 
            type="month"
            value={`${year}-${String(month + 1).padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
              }
            }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 cursor-pointer"
          />
          <button onClick={nextMonth} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-slate-100">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {blanks.map(b => (
          <div key={`blank-${b}`} className="border-b border-r border-slate-100 bg-slate-50/30"></div>
        ))}
        
        {days.map(day => {
          // Format date to match "YYYY-MM-DD"
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayAppointments = appointments.filter(a => a.date === dateStr);
          
          const currentDayObj = new Date(year, month, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // reset time to start of day for comparison
          
          let dayClass = "border-b border-r border-slate-100 p-2 overflow-y-auto hover:bg-slate-50 transition-colors";
          let dayNumberClass = "text-right text-sm font-semibold mb-1";
          
          if (currentDayObj < today) {
            dayClass += " bg-slate-100/50 opacity-75"; // passed days grayed out
            dayNumberClass += " text-slate-400";
          } else if (currentDayObj.getTime() === today.getTime()) {
            dayClass += " bg-blue-50/60 ring-inset ring-1 ring-blue-200"; // current day azul celeste
            dayNumberClass += " text-blue-600";
          } else {
            dayClass += " bg-white"; // future days white
            dayNumberClass += " text-slate-600";
          }

          return (
            <div key={day} className={dayClass}>
              <div className={dayNumberClass}>{day}</div>
              <div className="space-y-1">
                {dayAppointments.map(app => (
                  <div 
                    key={app.id} 
                    className="p-1.5 bg-blue-50 border border-blue-100 rounded text-[10px] leading-tight hover:bg-blue-100 transition-colors cursor-pointer shadow-sm"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="font-bold text-blue-800">{app.startTime}</div>
                    <div className="text-blue-600 truncate font-medium">{app.patient?.firstName} {app.patient?.lastName}</div>
                    <div className="text-slate-500 truncate">{app.professional?.name || 'Sin Lic.'}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-[500px] w-full p-8 relative">
            <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Detalles de la Cita</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Paciente</p>
                <p className="text-lg font-medium text-slate-800">{selectedApp.patient?.lastName}, {selectedApp.patient?.firstName}</p>
                <p className="text-sm text-slate-500 mt-0.5">DNI: {selectedApp.patient?.dni} • Tel: {selectedApp.patient?.phone}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Fecha y Hora</p>
                  <p className="text-[15px] font-medium text-slate-800 mb-0.5">{selectedApp.date}</p>
                  <p className="text-sm text-slate-500">{selectedApp.startTime} - {selectedApp.endTime}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Profesional Tratante</p>
                  <p className="text-[15px] font-medium text-slate-800 mb-0.5">{selectedApp.professional?.name || 'No asignado'}</p>
                  
                  {userRole === 'PROFESSIONAL' && !selectedApp.professionalId ? (
                    <form action={async (formData) => {
                      await assignAppointmentToMe(formData);
                      setSelectedApp({ ...selectedApp, professionalId: currentUserId, professional: { name: "Tú" }, status: "ASIGNADO" });
                    }}>
                      <input type="hidden" name="appointmentId" value={selectedApp.id} />
                      <button type="submit" className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1 rounded-lg transition-colors mt-1">
                        Auto-asignarme
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-blue-600 font-medium">{selectedApp.status}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Observaciones / Detalles Clínicos</p>
                 {(() => {
                    const obs = selectedApp.patient?.observations?.find((o: any) => o.professionalId === selectedApp.professionalId);
                    const isVisible = selectedApp.professionalId === currentUserId || !obs;
                    
                    return obs ? (
                      <div className={`text-[15px] leading-relaxed ${!isVisible ? 'select-none' : ''}`}>
                        <p className={!isVisible ? 'blur-[4px] text-slate-400' : 'text-slate-700'}>
                          {!isVisible ? "Contenido privado. Solo el profesional tratante puede visualizar estas notas clínicas." : obs.observation}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[15px] text-slate-500 italic">No hay notas clínicas registrados para esta consulta.</p>
                    );
                 })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
