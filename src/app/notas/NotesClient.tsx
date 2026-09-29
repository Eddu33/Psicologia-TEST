"use client";

import { useState } from "react";
import { Plus, X, Share2, Edit2, Trash2, Users } from "lucide-react";
import { createNote, updateNote, deleteNote, shareNote } from "@/app/actions";

const COLORS = [
  { id: 'yellow', bg: 'bg-[#fef3c7]', border: 'border-[#fde68a]', text: 'text-[#92400e]' },
  { id: 'green', bg: 'bg-[#dcfce7]', border: 'border-[#bbf7d0]', text: 'text-[#166534]' },
  { id: 'blue', bg: 'bg-[#dbeafe]', border: 'border-[#bfdbfe]', text: 'text-[#1e40af]' },
  { id: 'pink', bg: 'bg-[#fce7f3]', border: 'border-[#fbcfe8]', text: 'text-[#9d174d]' },
  { id: 'purple', bg: 'bg-[#f3e8ff]', border: 'border-[#e9d5ff]', text: 'text-[#6b21a8]' },
];

export function NotesClient({ initialNotes, allUsers, currentUserId }: { initialNotes: any[], allUsers: any[], currentUserId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [sharingNote, setSharingNote] = useState<any | null>(null);
  
  const [shareSearch, setShareSearch] = useState("");

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(shareSearch.toLowerCase()) || 
    u.username.toLowerCase().includes(shareSearch.toLowerCase())
  );

  const openNewNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const openEditNote = (note: any) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Notas y Posticks</h1>
          <p className="text-slate-500 mt-1">Crea notas rápidas, personaliza sus colores y compártelas con tu equipo.</p>
        </div>
        <button 
          onClick={openNewNote}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nueva Nota
        </button>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-6 space-y-6">
        {initialNotes.map(note => (
          <NoteCard 
            key={note.id} 
            note={note} 
            currentUserId={currentUserId} 
            onEdit={() => openEditNote(note)}
            onShare={() => { setShareSearch(""); setSharingNote(note); }}
          />
        ))}
      </div>
      
      {initialNotes.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center mb-4 transform -rotate-6">
            <div className="w-10 h-10 bg-[#fef3c7] rounded-lg"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes notas aún</h3>
          <p className="text-slate-500">Crea tu primer postick haciendo clic en el botón superior.</p>
        </div>
      )}

      {/* Modal Crear / Editar Nota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              if (editingNote) {
                await updateNote(formData);
              } else {
                await createNote(formData);
              }
              setIsModalOpen(false);
            }} className="p-6">
              {editingNote && <input type="hidden" name="id" value={editingNote.id} />}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                  <input 
                    type="text" 
                    name="title" 
                    defaultValue={editingNote?.title || ""} 
                    required 
                    placeholder="Ej. Recordatorio de reunión..."
                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalle</label>
                  <textarea 
                    name="content" 
                    defaultValue={editingNote?.content || ""} 
                    required 
                    placeholder="Escribe el contenido de tu nota aquí..."
                    rows={5}
                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 resize-y" 
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color del Postick</label>
                  <div className="flex gap-3">
                    {COLORS.map(c => (
                      <label key={c.id} className="cursor-pointer relative">
                        <input type="radio" name="color" value={c.id} defaultChecked={(editingNote?.color || 'yellow') === c.id} className="peer sr-only" />
                        <div className={`w-10 h-10 rounded-full ${c.bg} border-2 ${c.border} peer-checked:ring-4 ring-offset-2 ring-slate-300 transition-all shadow-sm`}></div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
                  {editingNote ? 'Guardar Cambios' : 'Crear Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Compartir */}
      {sharingNote && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Share2 className="w-5 h-5 text-blue-600"/> Compartir Nota</h2>
              <button onClick={() => setSharingNote(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <input 
                type="text" 
                placeholder="Buscar por nombre o usuario..." 
                value={shareSearch}
                onChange={e => setShareSearch(e.target.value)}
                className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm" 
              />
              
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredUsers.map(u => {
                  const isShared = sharingNote.sharedWith?.some((su: any) => su.id === u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{u.name}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                      
                      <form action={shareNote}>
                        <input type="hidden" name="noteId" value={sharingNote.id} />
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="actionType" value={isShared ? "remove" : "add"} />
                        {isShared ? (
                          <button type="submit" className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                            Quitar
                          </button>
                        ) : (
                          <button type="submit" className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            Compartir
                          </button>
                        )}
                      </form>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No se encontraron usuarios.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, currentUserId, onEdit, onShare }: { note: any, currentUserId: string, onEdit: () => void, onShare: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const colorDef = COLORS.find(c => c.id === note.color) || COLORS[0];
  
  const isOwner = note.ownerId === currentUserId;
  
  // Truncar detalle largo
  const MAX_CHARS = 500;
  const isLong = note.content.length > MAX_CHARS;
  const displayContent = (!expanded && isLong) ? note.content.substring(0, MAX_CHARS) + "..." : note.content;

  return (
    <div className={`relative break-inside-avoid mb-6 rounded-2xl shadow-sm border ${colorDef.bg} ${colorDef.border} overflow-hidden transition-all hover:shadow-md group`}>
      {/* Tape effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm shadow-sm transform -rotate-2"></div>
      
      <div className="p-6 pt-8">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className={`text-xl font-bold ${colorDef.text} leading-tight`}>{note.title}</h3>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onShare} className={`p-1.5 rounded-lg hover:bg-white/40 ${colorDef.text} transition-colors`} title="Compartir">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={onEdit} className={`p-1.5 rounded-lg hover:bg-white/40 ${colorDef.text} transition-colors`} title="Editar">
              <Edit2 className="w-4 h-4" />
            </button>
            {isOwner && (
              <form action={deleteNote} className="inline-block">
                <input type="hidden" name="id" value={note.id} />
                <button type="submit" className={`p-1.5 rounded-lg hover:bg-white/40 text-red-600 transition-colors`} title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className={`${colorDef.text} opacity-90 whitespace-pre-wrap text-sm leading-relaxed mb-4 font-medium`}>
          {displayContent}
        </div>
        
        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`text-xs font-black uppercase tracking-wider ${colorDef.text} hover:underline mb-4`}
          >
            {expanded ? "Comprimir..." : "Ver más..."}
          </button>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4 items-center justify-between border-t border-black/5 pt-3">
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full bg-white/50 border border-white/60 flex items-center justify-center shadow-sm text-[10px] font-bold text-slate-600" title={note.owner?.name}>
               {note.owner?.name?.substring(0,2).toUpperCase()}
             </div>
             {note.sharedWith?.map((su: any) => (
               <div key={su.id} className="w-6 h-6 rounded-full bg-blue-100 border border-white/60 flex items-center justify-center shadow-sm text-[10px] font-bold text-blue-700" title={`Compartido con ${su.name}`}>
                 {su.name?.substring(0,2).toUpperCase()}
               </div>
             ))}
          </div>
          
          <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-right">
             {new Date(note.updatedAt).toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
}
