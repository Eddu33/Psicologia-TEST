"use client";

import { useState } from "react";
import { Search, Edit, Trash2, X } from "lucide-react";
import { updatePatient, deletePatient } from "@/app/actions";

export function PatientDirectoryClient({ patients }: { patients: any[] }) {
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState<any | null>(null);

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
                  <button onClick={() => setEditingPatient(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <form action={deletePatient} onSubmit={(e) => {
                    if (!confirm("¿Estás seguro de eliminar este paciente y todos sus turnos?")) {
                      e.preventDefault();
                    }
                  }}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
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
    </div>
  );
}
