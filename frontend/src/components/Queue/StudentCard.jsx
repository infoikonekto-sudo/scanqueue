import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatTime, getElapsedTime } from '../../utils/dateUtils';

const StudentCard = ({ 
  student, 
  onMarkCompleted, 
  onMarkTransport,
  showActions = true 
}) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [showTransportOptions, setShowTransportOptions] = useState(false);

  useEffect(() => {
    if (student.status !== 'waiting') return;

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(student.scannedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [student.scannedAt, student.status]);

  const getStatusIcon = () => {
    switch (student.status) {
      case 'waiting':
        return '🟦';
      case 'completed':
        return '✅';
      case 'transport':
        return '🚌';
      default:
        return '•';
    }
  };

  const getStatusColor = () => {
    switch (student.status) {
      case 'waiting':
        return 'border-blue-900 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'transport':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getStatusTextColor = () => {
    switch (student.status) {
      case 'waiting':
        return 'text-blue-900';
      case 'completed':
        return 'text-green-600';
      case 'transport':
        return 'text-orange-600';
      default:
        return 'text-gray-700';
    }
  };

  const routes = ['Ruta A', 'Ruta B', 'Ruta C', 'Ruta D'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`w-full rounded-lg border-2 p-4 shadow-md transition-all duration-300 ${getStatusColor()}`}
    >
      {/* Encabezado con número de orden y estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`text-4xl font-bold ${getStatusTextColor()} min-w-16 text-center`}>
            {student.order || '-'}
          </div>
          <div className="text-2xl">{getStatusIcon()}</div>
        </div>
        <span className={`px-3 py-1 bg-white rounded-full text-xs font-semibold ${getStatusTextColor()}`}>
          {student.status === 'waiting' ? 'Esperando' : student.status === 'completed' ? 'Retirado' : 'Transporte'}
        </span>
      </div>

      {/* Foto del estudiante */}
      <div className="flex justify-center mb-3">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={student.photo || 'https://via.placeholder.com/120?text=Sin+Foto'}
          alt={student.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
        />
      </div>

      {/* Información del estudiante */}
      <div className="text-center mb-3">
        <h3 className={`text-lg font-bold ${getStatusTextColor()} truncate mb-1`}>
          {student.name?.substring(0, 25) || 'Estudiante'}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          {student.grade ? `${student.grade}` : 'Grado N/A'}
          {student.section ? ` - ${student.section}` : ''}
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-500">
          <span>⏰ {formatTime(student.scannedAt)}</span>
          <span className={student.status === 'waiting' ? 'text-blue-900 font-semibold' : ''}>
            ⏱ {elapsedTime}
          </span>
        </div>
      </div>

      {/* Acciones */}
      {showActions && student.status === 'waiting' && (
        <div className="space-y-2">
          {/* Botón principal completar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMarkCompleted(student.id)}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-md"
          >
            ✅ Marcar como Retirado
          </motion.button>

          {/* Botón transporte */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTransportOptions(!showTransportOptions)}
              className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              🚌 Asignar Transporte
            </motion.button>

            {/* Dropdown de rutas */}
            {showTransportOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-500 rounded-lg shadow-lg z-10"
              >
                {routes.map((route) => (
                  <button
                    key={route}
                    onClick={() => {
                      onMarkTransport(student.id, route);
                      setShowTransportOptions(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-orange-100 text-center border-b last:border-b-0"
                  >
                    {route}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Estado para completados/transporte */}
      {student.status !== 'waiting' && (
        <div className="text-center text-xs text-gray-500">
          <p>{student.status === 'completed' ? 'Completado' : `Asignado a: ${student.route || 'N/A'}`}</p>
        </div>
      )}
    </motion.div>
  );
};

export default StudentCard;
