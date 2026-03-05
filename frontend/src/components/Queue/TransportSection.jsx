import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransportSection = ({ students, isExpanded, onToggle }) => {
  // Agrupar por ruta
  const groupedByRoute = useMemo(() => {
    const groups = {};
    students.forEach(student => {
      const route = student.route || 'Sin asignar';
      if (!groups[route]) {
        groups[route] = [];
      }
      groups[route].push(student);
    });
    return groups;
  }, [students]);

  const handlePrint = (route, students) => {
    const content = `
      <html>
        <head>
          <title>Lista de Transporte - ${route}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #1E3A8A; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #1E3A8A; color: white; }
            .timestamp { text-align: right; margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>ScanQueue - Lista de ${route}</h1>
          <h2>Fecha: ${new Date().toLocaleDateString('es-ES')}</h2>
          <h2>Hora: ${new Date().toLocaleTimeString('es-ES')}</h2>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Grado/Sección</th>
                <th>Hora Escaneo</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${s.name}</td>
                  <td>${s.grade || 'N/A'} ${s.section || ''}</td>
                  <td>${new Date(s.transportAt).toLocaleTimeString('es-ES')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="timestamp">
            <p><strong>Total: ${students.length} estudiantes</strong></p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (students.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-blue-900 rounded-lg p-6 text-center shadow-md"
      >
        <p className="text-gray-500 text-lg">📭 Sin estudiantes en transporte</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white border-2 border-blue-900 rounded-lg shadow-md overflow-hidden"
    >
      {/* Encabezado */}
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: '#f3f4f6' }}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold cursor-pointer"
      >
        <span className="flex items-center gap-3 text-lg">
          🚌 Transporte ({students.length})
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {Object.entries(groupedByRoute).map(([route, routeStudents]) => (
                <motion.div
                  key={route}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg p-4"
                >
                  {/* Encabezado de ruta */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-orange-900">
                      {route} ({routeStudents.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePrint(route, routeStudents)}
                      className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                      🖨️ Imprimir
                    </motion.button>
                  </div>

                  {/* Lista de estudiantes en esta ruta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {routeStudents.map((student, idx) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-orange-300 rounded-lg p-3 text-sm"
                      >
                        <p className="font-semibold text-orange-900">{student.name}</p>
                        <p className="text-gray-600 text-xs">
                          {student.grade} {student.section}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          ⏰ {new Date(student.transportAt).toLocaleTimeString('es-ES')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TransportSection;
