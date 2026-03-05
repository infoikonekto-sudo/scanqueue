import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueueStore, useUIStore, useAuthStore } from '../stores/index.js'
import { queueService } from '../services/api.js'
import { useSocket } from '../hooks/index.js'
import { QueueList, StatsBoard, TransportSection } from '../components/Queue/QueueComponents.jsx'
import { PublicQueueView } from '../components/Queue/PublicQueueView.jsx'
import { Card, Button, Toast } from '../components/common/index.jsx'
import { motion } from 'framer-motion'

/**
 * Página de Cola
 */
export const QueuePage = () => {
  const navigate = useNavigate()
  const { level: urlLevel } = useParams()
  const { user } = useAuthStore()
  const { queue } = useQueueStore()
  const { showNotification, notification, isLoading, setIsLoading } = useUIStore()

  const [stats, setStats] = React.useState({})
  const [filter, setFilter] = React.useState('all') // all, waiting, processing, completed

  // Conectar WebSocket
  useSocket()

  // Verificar autenticación
  React.useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Cargar estadísticas
  React.useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      try {
        const response = await queueService.getStats()
        setStats(response.data)
      } catch (err) {
        console.error('Error cargando estadísticas:', err)
        showNotification('error', 'Error cargando estadísticas')
      } finally {
        setIsLoading(false)
      }
    }

    const interval = setInterval(loadStats, 10000) // Cada 10 segundos
    loadStats()

    return () => clearInterval(interval)
  }, [setIsLoading, showNotification])

  // Filtrar cola
  const filteredQueue = React.useMemo(() => {
    if (filter === 'all') return queue
    return queue.filter((s) => s.status === filter)
  }, [queue, filter])

  // Agrupar por nivel académico
  // Agrupar por nivel académico real del estudiante
  const byLevel = React.useMemo(() => {
    const levels = {
      'preprimaria': [],
      'primaria': [],
      'secundaria': []
    }

    filteredQueue.forEach((student) => {
      const level = (student.level || 'primaria').toLowerCase()
      if (levels[level]) {
        levels[level].push(student)
      } else {
        levels['primaria'].push(student)
      }
    })
    return levels
  }, [filteredQueue])

  const handleClearQueue = async () => {
    if (!window.confirm('¿Despejar toda la cola?')) return
    setIsLoading(true)
    try {
      await queueService.clearQueue()
      showNotification('success', 'Cola despejada')
    } catch (err) {
      showNotification('error', 'No se pudo despejar la cola')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessTransport = async (level) => {
    try {
      setIsLoading(true)
      await queueService.processTransport(level)
      showNotification('success', `Grupo ${level.toUpperCase()} despachado con éxito`)
    } catch (err) {
      console.error('Error despachando transporte:', err)
      showNotification('error', 'No se pudo despachar el grupo')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="w-full min-h-screen bg-[#001c3d] text-white">
      {/* Header Estético "Departures Board" */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#002d5b] border-b border-white/10 px-8 py-8 md:py-12"
      >
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-xs mb-2">Monitor de Entrega Segura</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              Control de Salidas
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/10">
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">En Espera</p>
              <p className="text-4xl font-black leading-none">{queue.length}</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Completados</p>
              <p className="text-4xl font-black leading-none text-emerald-400">{stats.completed_today || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accesos Rápidos a Monitores (Modo TV) */}
      <div className="max-w-[1800px] mx-auto px-6 mt-8 flex flex-wrap gap-4 justify-center">
        {['Preprimaria', 'Primaria', 'Secundaria'].map(lvl => (
          <button
            key={lvl}
            onClick={() => navigate(`/monitor/${lvl.toLowerCase()}`)}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 transition-all active:scale-95 group shadow-lg"
          >
            <span className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-black border border-blue-400/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 transition-all">
              📺
            </span>
            <div className="text-left">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Ver Pantalla</p>
              <p className="text-sm font-black uppercase tracking-tighter">{lvl}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Contenido Principal - Tres Columnas Estilo Aeropuerto */}
      <div className="max-w-[1800px] mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {Object.entries(byLevel).map(([level, students]) => (
            <div key={level} className="flex flex-col bg-white/5 rounded-[40px] border border-white/10 overflow-hidden backdrop-blur-md shadow-2xl">
              <div className="bg-white/5 px-8 py-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{level}</h2>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{students.length} Pendientes</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                  {level === 'preprimaria' ? '🧸' : level === 'primaria' ? '📚' : '🎓'}
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                <QueueList queue={students} isLoading={isLoading} isPublic={true} />
              </div>

              {/* Botón de Despacho Discreto al pie de cada columna */}
              <div className="p-6 bg-white/5 border-t border-white/10">
                <button
                  onClick={() => handleProcessTransport(level)}
                  disabled={students.length === 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  🚚 Despachar Grupo {level}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones de Footer Discretas */}
        <div className="mt-16 flex flex-wrap gap-6 justify-center items-center opacity-40 hover:opacity-100 transition-opacity">
          <button
            onClick={() => navigate('/scanner')}
            className="text-white/60 hover:text-white font-black uppercase text-[10px] tracking-widest border-b-2 border-transparent hover:border-white transition-all pb-1"
          >
            Regresar al Escáner
          </button>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <button
            onClick={handleClearQueue}
            className="text-rose-400/60 hover:text-rose-400 font-black uppercase text-[10px] tracking-widest border-b-2 border-transparent hover:border-rose-400 transition-all pb-1"
          >
            Limpiar Toda la Cola
          </button>
        </div>
      </div>

      {/* Toast */}
      {notification && (
        <Toast notification={notification} onClose={() => { }} />
      )}
    </div>
  )
}

export default QueuePage
