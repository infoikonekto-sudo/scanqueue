import fs from 'fs';
import path from 'path';

/**
 * Middleware para manejo de errores global
 */
export function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${err.message}\nStack: ${err.stack}\nPath: ${req.path}\n\n`;

  try {
    fs.appendFileSync('error_log.txt', logMessage);
  } catch (fsErr) {
    console.error('No se pudo escribir en el log:', fsErr);
  }

  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
}

export default {
  errorHandler,
  notFoundHandler,
};
