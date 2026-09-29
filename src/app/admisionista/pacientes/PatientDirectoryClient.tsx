"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash2, X, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { updatePatient, deletePatient } from "@/app/actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function PatientDirectoryClient({ patients, currentUserId, basePath }: { patients: any[], currentUserId: string, basePath: string }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<any | null>(null);

  const filteredPatients = patients.filter(p => {
    const term = search.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(term) || p.dni.includes(term) || p.phone.includes(term);
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por Paciente, DNI o Teléfono..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4 border-b border-slate-100">Paciente</th>
              <th className="p-4 border-b border-slate-100">DNI</th>
              <th className="p-4 border-b border-slate-100">Teléfono</th>
              <th className="p-4 border-b border-slate-100">Observaciones</th>
              <th className="p-4 border-b border-slate-100 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{p.lastName}, {p.firstName}</td>
                <td className="p-4 text-sm text-slate-600">{p.dni}</td>
                <td className="p-4 text-sm text-slate-600">{p.phone}</td>
                <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={p.adminNotes}>{p.adminNotes || '-'}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Link href={`${basePath}/${p.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block" title="Ver Historial Clínico">
                    <ClipboardList className="w-4 h-4" />
                  </Link>
                  <button onClick={() => setEditingPatient(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPatientToDelete(p)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No se encontraron pacientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingPatient && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Editar Paciente</h2>
              <button onClick={() => setEditingPatient(null)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={async (formData) => {
              await updatePatient(formData);
              setEditingPatient(null);
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingPatient.id} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                  <input type="text" name="firstName" defaultValue={editingPatient.firstName} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
                  <input type="text" name="lastName" defaultValue={editingPatient.lastName} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">DNI</label>
                  <input type="text" name="dni" defaultValue={editingPatient.dni} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Edad</label>
                  <input type="number" name="age" defaultValue={editingPatient.age} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                <input type="text" name="phone" defaultValue={editingPatient.phone} required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
                <textarea name="adminNotes" defaultValue={editingPatient.adminNotes} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" rows={3}></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {patientToDelete && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
             <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
               <Trash2 className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 mb-2">¿Estás seguro?</h2>
             <p className="text-slate-600 mb-6">¿Estás seguro de eliminar este paciente y todos sus turnos? Esta acción no se puede deshacer.</p>
             <div className="flex justify-center gap-4">
               <button onClick={() => setPatientToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
               <form action={deletePatient} onSubmit={() => setPatientToDelete(null)}>
                 <input type="hidden" name="id" value={patientToDelete.id} />
                 <button type="submit" className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors">Sí, eliminar</button>
               </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
