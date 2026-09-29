"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarClient({ appointments }: { appointments: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
                  <div key={app.id} className="p-1.5 bg-blue-50 border border-blue-100 rounded text-[10px] leading-tight hover:bg-blue-100 transition-colors cursor-default shadow-sm">
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
    </div>
  );
}
