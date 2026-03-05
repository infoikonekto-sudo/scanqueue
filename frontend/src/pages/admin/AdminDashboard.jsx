import React, { useState } from 'react'
import { AdminLayout, LineChart, BarChart, PieChart, ExportActions, QuickActions } from '../../components/admin'
import { PageHeader, Card, StatsCard, Button, LoadingSpinner } from '../../components/shared'
import { MdRefresh, MdPeople, MdCheck, MdSchedule, MdDirectionsBus, MdTrendingUp } from 'react-icons/md'
import { useDashboard } from '../../hooks/admin/useDashboard'

const AdminDashboard = () => {
  const { stats, todayData, loading, refetch } = useDashboard()
  const [exporting, setExporting] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-black text-xl">S</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sincronizando con el servidor...</h2>
        <p className="text-slate-400 text-sm font-medium italic">Esto solo tomará un momento</p>
      </div>
    )
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      console.log('Exportar PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      console.log('Exportar Excel')
    } finally {
      setExporting(false)
    }
  }

  const quickActions = [
    {
      icon: '👥',
      label: 'Estudiantes',
      description: 'Gestión de registros',
      onClick: () => console.log('Ir a estudiantes'),
    },
    {
      icon: '🚌',
      label: 'Rutas',
      description: 'Logística de transporte',
      onClick: () => console.log('Ir a rutas'),
    },
    {
      icon: '📋',
      label: 'Reportes',
      description: 'Auditoría y control',
      onClick: () => console.log('Ir a reportes'),
    },
    {
      icon: '⚙️',
      label: 'Ajustes',
      description: 'Sistema y cuentas',
      onClick: () => console.log('Ir a configuración'),
    },
  ]

  return (
    <>
      {/* Header Premium Unificado */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Panel Administrativo</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema Activo y Sincronizado
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={MdRefresh}
            onClick={refetch}
            className="text-slate-500 hover:text-primary font-black text-xs uppercase tracking-widest"
          >
            Sincronizar ahora
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          label="Estudiantes"
          value={stats?.totalStudents || 0}
          color="blue"
          icon={MdPeople}
          change={{ value: 2.4, positive: true }}
        />
        <StatsCard
          label="Presentes"
          value={stats?.scannedToday || 0}
          color="green"
          icon={MdCheck}
          change={{ value: 12, positive: true }}
        />
        <StatsCard
          label="En Espera"
          value={stats?.waitingInQueue || 0}
          color="orange"
          icon={MdSchedule}
          change={{ value: 1, positive: false }}
        />
        <StatsCard
          label="Tasa Retiro"
          value={`${stats?.attendanceRate || 0}%`}
          color="blue"
          icon={MdTrendingUp}
        />
      </div>

      {/* Estaciones de Entrega (Sección Destacada) */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-1 bg-primary rounded-full"></div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Estaciones de Monitoreo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'preprimaria', name: 'Preprimaria', emoji: '🧸', color: 'bg-indigo-50 text-indigo-700' },
            { id: 'primaria', name: 'Primaria', emoji: '📚', color: 'bg-emerald-50 text-emerald-700' },
            { id: 'secundaria', name: 'Secundaria', emoji: '🎓', color: 'bg-rose-50 text-rose-700' },
            { id: 'global', name: 'Vista Maestro', emoji: '🖥️', color: 'bg-slate-900 text-white' }
          ].map((station) => (
            <Card
              key={station.id}
              className={`group hover:-translate-y-1 transition-all duration-300 border-none shadow-sm hover:shadow-xl ${station.id === 'global' ? 'bg-slate-900' : 'bg-white'}`}
              onClick={() => window.open(station.id === 'global' ? '/queue' : `/queue/${station.id}`, '_blank')}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${station.color}`}>
                  {station.emoji}
                </div>
                <div>
                  <h3 className={`font-black text-lg ${station.id === 'global' ? 'text-white' : 'text-slate-800'}`}>{station.name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${station.id === 'global' ? 'text-blue-300' : 'text-slate-500'}`}>Lanzar monitor</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Distribución Actual - Ahora más prominente */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Flujo de Estudiantes
          </h2>
          <Card className="h-[350px] border-none shadow-sm flex items-center justify-center">
            <PieChart
              labels={['Retiros', 'Transporte', 'Esperando']}
              data={[todayData?.pickedUp || 120, todayData?.inTransport || 45, todayData?.waiting || 15]}
            />
          </Card>
        </div>

        {/* Resumen de Eficiencia u otra métrica clave */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Análisis de Rendimiento
          </h2>
          <Card
            className="h-[350px] border-none shadow-sm flex flex-col justify-center p-8 text-white"
            style={{ backgroundColor: '#002d5b' }}
          >
            <div className="space-y-6">
              <div>
                <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Tiempo Promedio</p>
                <h3 className="text-4xl font-black">4.5 min</h3>
              </div>
              <div className="h-px bg-white/10 w-full"></div>
              <div>
                <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Pico de Actividad</p>
                <h3 className="text-4xl font-black">02:45 PM</h3>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Historial con estilo Moderno */}
      <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
        Actividad Reciente
      </h2>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estudiante / ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Registro</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Categoría</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ruta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-white group-hover:text-primary transition-all">S</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Estudiante Ejemplo #{i}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ID-0098{i}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-600">03 Mar, 2026</span>
                      <span className="text-[10px] font-bold text-slate-400">{`0${i}:${15 + i}:00 PM`}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      Entregado
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="font-bold text-slate-700 text-sm">Ruta #{i}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 text-center">
          <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">Ver historial completo →</button>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
