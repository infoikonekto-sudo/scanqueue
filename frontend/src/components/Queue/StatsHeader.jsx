import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatTime } from '../../utils/dateUtils';

const StatsHeader = ({ stats, isConnected, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-4 shadow-lg mb-6"
    >
      {/* Fila Superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b border-blue-700">
        {/* Logo y Hora */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">📱</div>
          <div>
            <h1 className="text-2xl font-bold">ScanQueue</h1>
            <p className="text-blue-200 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>

        {/* Hora y Conexión */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-blue-200 text-sm">Hora Actual</p>
            <p className="text-2xl font-bold font-mono">{formatTime(currentTime)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm">{isConnected ? 'En línea' : 'Sin conexión'}</span>
          </div>

          {/* Botón Refresh */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
            title="Refrescar cola"
          >
            🔄
          </motion.button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-blue-700 backdrop-blur-sm rounded-lg p-3 text-center"
        >
          <p className="text-blue-200 text-xs uppercase font-semibold mb-1">Esperando</p>
          <p className="text-3xl font-bold">{stats.waiting || 0}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-green-600 backdrop-blur-sm rounded-lg p-3 text-center"
        >
          <p className="text-green-100 text-xs uppercase font-semibold mb-1">Retirados</p>
          <p className="text-3xl font-bold">{stats.completed || 0}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-orange-600 backdrop-blur-sm rounded-lg p-3 text-center"
        >
          <p className="text-orange-100 text-xs uppercase font-semibold mb-1">En Transporte</p>
          <p className="text-3xl font-bold">{stats.transport || 0}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-purple-600 backdrop-blur-sm rounded-lg p-3 text-center"
        >
          <p className="text-purple-100 text-xs uppercase font-semibold mb-1">Total Hoy</p>
          <p className="text-3xl font-bold">{stats.today || 0}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsHeader;
