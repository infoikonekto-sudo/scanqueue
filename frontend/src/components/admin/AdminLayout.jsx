import React, { Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import {
  MdDashboard,
  MdPeople,
  MdDirectionsBus,
  MdFileDownload,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdAnalytics,
  MdQrCodeScanner,
  MdQueue,
} from 'react-icons/md'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { useAuthStore } from '../../stores'
import { useNavigate } from 'react-router-dom'

export const AdminSidebar = ({ isOpen = true, onToggle, user }) => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const navItems = [
    { icon: MdDashboard, label: 'Dashboard', href: '/admin' },
    { icon: MdQrCodeScanner, label: 'Escanear', href: '/scanner' },
    { icon: MdQueue, label: 'Cola', href: '/queue' },
    { icon: MdPeople, label: 'Estudiantes', href: '/admin/students' },
    { icon: MdDirectionsBus, label: 'Rutas', href: '/admin/routes' },
    { icon: MdFileDownload, label: 'Reportes', href: '/admin/reports' },
    { icon: MdAnalytics, label: 'Analítica', href: '/admin/analytics' },
    { icon: MdSettings, label: 'Configuración', href: '/admin/settings' },
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen bg-[#002d5b] text-white transition-transform duration-300
          w-72 flex flex-col shadow-2xl border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative lg:z-0
        `}
      >
        {/* Header con Logo Estilo Imagen */}
        <div className="px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-900/40">
              S
            </div>
            <h1 className="text-2xl font-black tracking-tighter">ScanQueue</h1>
          </div>
          <button onClick={onToggle} className="lg:hidden text-white/70 hover:text-white">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* User Badge Directo de la Imagen */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xl border border-blue-500/30">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-white text-sm truncate uppercase tracking-tight">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                En línea
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Items Exactos */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-6 text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-6 mt-2">Menú Principal</p>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative"
              >
                <Icon className="w-6 h-6 text-white/60 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm font-bold text-white/80 group-hover:text-white tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 mt-auto">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-all duration-300 text-xs font-bold uppercase tracking-widest"
          >
            <MdLogout className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export const AdminLayout = ({ user = {} }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Botón menú móvil (flotante cuando está cerrado) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
          >
            <MdMenu className="w-8 h-8" />
          </button>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth mt-0">
          <Suspense fallback={
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              <p className="text-slate-400 text-sm mt-4 font-bold uppercase tracking-widest">Sincronizando...</p>
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
