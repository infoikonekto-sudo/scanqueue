import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge } from '../common/index.jsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Componente de lista de cola
 */
/**
 * Componente de lista de cola
 */
export const QueueList = ({ queue, isLoading, isPublic = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!queue || queue.length === 0) {
    return (
      <div className={`${isPublic ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} text-center py-20 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center`}>
        <div className="text-6xl mb-4">🏫</div>
        <p className={`text-2xl font-black ${isPublic ? 'text-white/30' : 'text-gray-600'} uppercase tracking-widest`}>Esperando Estudiantes</p>
        <p className={`${isPublic ? 'text-white/20' : 'text-gray-500'} mt-2 font-bold`}>Los llamados aparecerán aquí en tiempo real</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className={`grid grid-cols-1 ${isPublic ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        {queue.map((student, index) => (
          <StudentCard
            key={student.id}
            student={student}
            position={index + 1}
            isPublic={isPublic}
          />
        ))}
      </div>
    </AnimatePresence>
  )
}

/**
 * Tarjeta de estudiante individual
 */
export const StudentCard = ({ student, position, onRemove, isProcessing, isPublic = false }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5, x: -20 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div
        className={`
          relative overflow-hidden rounded-[28px] border transition-all duration-500
          ${isPublic
            ? 'bg-white/10 border-white/10 hover:bg-white/15 p-5'
            : 'bg-white border-gray-100 hover:border-primary p-6 shadow-sm'}
        `}
      >
        <div className="flex items-center gap-5">
          <div className={`
            shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl
            ${isPublic ? 'bg-blue-600 text-white' : 'bg-[#002d5b] text-white'}
          `}>
            {position}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isPublic ? 'text-blue-400' : 'text-primary'}`}>
              Llamando ahora
            </p>
            <h3 className={`text-xl md:text-2xl font-black leading-tight truncate ${isPublic ? 'text-white' : 'text-gray-900'}`}>
              {student.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isPublic ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                {student.grade}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary/10 text-secondary'}`}>
                SEC {student.section || 'A'}
              </span>
            </div>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(student.id)}
            disabled={isProcessing}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Sección por transporte
 */
export const TransportSection = ({ transport, students, onProcessAll }) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const getTransportIcon = (transport) => {
    const icons = {
      bus: '🚌',
      carro: '🚗',
      caminando: '🚶',
      otro: '📍',
    }
    const lower = transport.toLowerCase()
    if (lower.includes('bus')) return icons.bus
    if (lower.includes('car')) return icons.carro
    return icons.otro
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-4xl">{getTransportIcon(transport)}</span>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">{transport}</h2>
            <p className="text-sm font-bold text-gray-500">{students.length} Estudiantes en espera</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="success"
            size="sm"
            className="px-6 font-bold shadow-sm"
            onClick={() => onProcessAll(transport)}
          >
            ✅ DESPACHAR GRUPO
          </Button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-black text-gray-400 hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {students.map((student, idx) => (
            <StudentCard
              key={student.id}
              student={student}
              position={idx + 1}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

/**
 * Panel de estadísticas
 */
export const StatsBoard = ({ stats = {} }) => {
  const {
    totalScanned = 0,
    byTransport = {},
    successRate = 0,
    averageTime = 0,
  } = stats

  const statItems = [
    { label: 'Total Escaneado', value: totalScanned, color: 'bg-blue-50' },
    { label: 'Tasa de Éxito', value: `${successRate}%`, color: 'bg-green-50' },
    { label: 'Tiempo Promedio', value: `${averageTime}s`, color: 'bg-purple-50' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      {statItems.map((item, idx) => (
        <Card key={idx} className={item.color}>
          <div className="p-4 text-center">
            <p className="text-gray-700 text-sm font-medium mb-2">
              {item.label}
            </p>
            <p className="text-3xl font-bold text-primary">{item.value}</p>
          </div>
        </Card>
      ))}
    </motion.div>
  )
}

export default QueueList
