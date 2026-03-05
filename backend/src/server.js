import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import scanRoutes from './routes/scans.js';
import routeRoutes from './routes/routes.js';
import qrRoutes from './routes/qr.js';
import dashboardRoutes from './routes/dashboard.js';
import queueRoutes from './routes/queue.js';

// Inicializar aplicación
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
// Middleware de CORS dinámico para soportar localhost y 127.0.0.1
const allowedOrigins = [
  config.cors.origin,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging & Socket.io injection
app.use((req, res, next) => {
  req.io = io;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/queue', queueRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ScanQueue API está activo',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a ScanQueue API',
    version: '1.0.0',
    documentation: '/docs',
  });
});

// WebSocket eventos
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Evento: nuevo escaneo
  // Evento: nuevo escaneo (Sincronización en tiempo real)
  socket.on('scan:new', async (data) => {
    try {
      const { code } = data;
      // Buscar el estudiante para enviar info completa a los displays
      let student = await StudentModel.getStudentById(code);

      // Si no es un ID directo, buscar por unique_code
      if (!student) {
        const searchResults = await StudentModel.searchStudents(code);
        if (searchResults && searchResults.length > 0) {
          student = searchResults[0];
        }
      }

      if (student) {
        // Enviar info completa a todos los clientes (Monitor y Scanner)
        io.emit('scan:new', student);
      } else {
        // Si no encontramos estudiante, avisamos del intento desconocido
        io.emit('scan:error', {
          message: 'Estudiante no encontrado',
          code,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error procesando socket scan:new:', err);
    }
  });

  // Evento: estudiante marcado
  socket.on('student:marked', (data) => {
    io.emit('stats:update', {
      event: 'student_marked',
      data,
      timestamp: new Date().toISOString(),
    });
  });

  // Evento: actualizar cola
  socket.on('queue:get', (callback) => {
    callback({
      success: true,
      message: 'Cola obtenida',
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  // Manejo de errores
  socket.on('error', (error) => {
    console.error('Error en socket:', error);
  });
});

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo de errores global
app.use(errorHandler);

// Iniciar servidor
const PORT = config.server.port;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   ScanQueue API - Sistema de Llamado Escolar          ║
║   Servidor iniciado correctamente                     ║
║   Puerto: ${PORT}                                           ║
║   Entorno: ${config.server.nodeEnv}                       ║
║   Hora: ${new Date().toISOString()}                   ║
╚════════════════════════════════════════════════════════╝
  `);

  console.log('Endpoints disponibles:');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/auth/register');
  console.log('  GET    /api/students');
  console.log('  POST   /api/students');
  console.log('  POST   /api/scan');
  console.log('  GET    /api/scan/queue');
  console.log('  GET    /api/routes');
  console.log('  POST   /api/qr/generate');
  console.log('  GET    /api/dashboard/stats');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  process.exit(1);
});

export default { app, server, io };
