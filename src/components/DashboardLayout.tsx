"use client";

import { useState } from "react";
import { 
  Calendar, Users, Activity, Settings, UserPlus, FileText, 
  LogOut, Menu, X, Bell, Search, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth-actions";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  userName: string;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getLinks = () => {
    switch(role.toUpperCase()) {
      case "ADMIN":
        return [
          { name: "Dashboard General", href: "/admin", icon: LayoutDashboard },
          { name: "Calendario Global", href: "/admin/calendario", icon: Calendar },
          { name: "Directorio de Pacientes", href: "/admin/pacientes", icon: Users },
          { name: "Usuarios y Roles", href: "/admin/users", icon: Users },
          { name: "Auditoría Global", href: "/admin/audit", icon: Activity },
        ];
      case "ADMISIONISTA":
        return [
          { name: "Dashboard", href: "/admisionista", icon: LayoutDashboard },
          { name: "Calendario Global", href: "/admisionista/calendario", icon: Calendar },
          { name: "Directorio de Pacientes", href: "/admisionista/pacientes", icon: Users },
        ];
      case "PROFESSIONAL":
        return [
          { name: "Mi Agenda", href: "/profesional", icon: LayoutDashboard },
          { name: "Calendario Global", href: "/profesional/calendario", icon: Calendar },
          { name: "Directorio de Pacientes", href: "/profesional/pacientes", icon: Users },
          { name: "Pacientes Atendidos", href: "/profesional/atendidos", icon: Activity },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:flex md:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">PsicoApp</span>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-700 p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Menú Principal</p>
            <nav className="space-y-1.5">
              {links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl bg-white shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200 shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs font-medium text-slate-500 capitalize">{role.toLowerCase()}</p>
            </div>
          </div>
          <form action={logout}>
             <button type="submit" className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group">
               <LogOut className="w-4 h-4 group-hover:text-red-500" />
               Cerrar Sesión
             </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100/50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, DNI..." 
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-64 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button className="relative p-2.5 bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-slate-200">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
