import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '../../hooks/useQueue';
import StudentCard from './StudentCard';
import StatsHeader from './StatsHeader';
import TransportSection from './TransportSection';

const QueueView = () => {
  const {
    queue,
    completed,
    transport,
    stats,
    isConnected,
    connectionError,
    markAsCompleted,
    markAsTransport,
    requestQueueRefresh,
    socket
  } = useQueue();

  const [filter, setFilter] = useState('all'); // all, waiting, completed, transport
  const [view, setView] = useState('queue'); // queue, transport, history
  const [isTransportExpanded, setIsTransportExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const queueContainerRef = useRef(null);

  // Auto-scroll cuando hay nuevos elementos
  useEffect(() => {
    if (autoScroll && queueContainerRef.current) {
      const container = queueContainerRef.current;
      // Scroll suave al top cuando hay nuevos escaneos
      setTimeout(() => {
        if (queue.length > 0) {
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [queue.length, autoScroll]);

  // Solicitar permiso para notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Aquí irá búsqueda
      }
      if (e.key === 'F5') {
        e.preventDefault();
        requestQueueRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [requestQueueRefresh]);

  // Filtrar data según vista y búsqueda
  const getFilteredData = () => {
    let data = [];

    if (view === 'queue') {
      switch (filter) {
        case 'completed':
          data = completed;
          break;
        case 'transport':
          data = transport;
          break;
        case 'waiting':
          data = queue;
          break;
        case 'all':
        default:
          data = [...queue, ...completed, ...transport];
      }
    } else if (view === 'transport') {
      data = transport;
    } else if (view === 'history') {
      data = completed;
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      data = data.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.grade?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  };

  const filteredData = getFilteredData();
  const visibleQueue = view === 'queue' ? filteredData : (view === 'transport' ? transport : completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-4 md:p-6">
      {/* Indicador de error de conexión */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
        >
          <p className="font-semibold">⚠️ Error de conexión</p>
          <p className="text-sm">{connectionError}</p>
        </motion.div>
      )}

      {/* Header con estadísticas */}
      <StatsHeader
        stats={stats}
        isConnected={isConnected}
        onRefresh={requestQueueRefresh}
      />

      {/* Controles */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-4 mb-6 border-2 border-blue-900"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o grado (Ctrl+K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilter('waiting')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'waiting'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              🟦 Esperando ({queue.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              ✅ Retirados ({completed.length})
            </button>
            <button
              onClick={() => setFilter('transport')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'transport'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              🚌 Transporte ({transport.length})
            </button>
          </div>

          {/* Vistas */}
          <div className="flex gap-2">
            <button
              onClick={() => { setView('queue'); setFilter('waiting'); }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'queue'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              📋 Cola
            </button>
            <button
              onClick={() => { setView('transport'); }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'transport'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              🚌 Bus
            </button>
            <button
              onClick={() => { setView('history'); }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                view === 'history'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              📊 Historial
            </button>
          </div>
        </div>

        {/* Toggle auto-scroll */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            id="autoScroll"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="autoScroll" className="text-sm text-gray-700 cursor-pointer">
            📌 Auto-scroll
          </label>
        </div>
      </motion.div>

      {/* Contenido Principal */}
      {view === 'queue' && (
        <motion.div
          ref={queueContainerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Vista de cola principal */}
          {queue.length === 0 && filter !== 'completed' && filter !== 'transport' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border-4 border-dashed border-blue-900 p-12 text-center shadow-md"
            >
              <p className="text-4xl mb-3">✨</p>
              <p className="text-xl text-gray-700 font-semibold">No hay estudiantes en espera</p>
              <p className="text-gray-500 mt-2">La cola está vacía. Esperando escaneos...</p>
            </motion.div>
          ) : (
            <>
              {/* Cards de Cola */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {queue.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onMarkCompleted={markAsCompleted}
                      onMarkTransport={markAsTransport}
                      showActions={true}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Transporte Section */}
              {transport.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">Estudiantes Asignados a Transporte</h2>
                  <TransportSection
                    students={transport}
                    isExpanded={isTransportExpanded}
                    onToggle={() => setIsTransportExpanded(!isTransportExpanded)}
                  />
                </div>
              )}

              {/* Retirados */}
              {completed.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Estudiantes Retirados Hoy</h2>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    layout
                  >
                    <AnimatePresence>
                      {completed.slice(0, 6).map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          showActions={false}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  {completed.length > 6 && (
                    <p className="text-center text-gray-600 mt-4 text-sm">
                      +{completed.length - 6} más en historial...
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Vista de Transporte */}
      {view === 'transport' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <TransportSection
            students={transport}
            isExpanded={true}
            onToggle={() => {}}
          />
        </motion.div>
      )}

      {/* Vista de Historial */}
      {view === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {completed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border-4 border-dashed border-green-600 p-12 text-center shadow-md"
            >
              <p className="text-4xl mb-3">📭</p>
              <p className="text-xl text-gray-700 font-semibold">No hay estudiantes retirados</p>
              <p className="text-gray-500 mt-2">Aún no se han completado retirados hoy</p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Historial de Retirados ({completed.length})
              </h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                layout
              >
                <AnimatePresence>
                  {completed.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      showActions={false}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center text-gray-500 text-sm py-6 border-t border-gray-200"
      >
        <p>ScanQueue © 2026 - Sistema de Cola en Tiempo Real</p>
        <p className="mt-1 text-xs">
          {isConnected ? '✅ Conectado' : '❌ Desconectado'} | 
          Estado: {queue.length + completed.length + transport.length} estudiantes | 
          Presiona F5 para refrescar
        </p>
      </motion.div>
    </div>
  );
};

export default QueueView;
