import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Estado en memoria (para testing)
let queue = [];
let completed = [];
let transport = [];
let orderCounter = 1;

// Usuario de prueba (admin)
const adminUser = {
  id: '1',
  email: 'admin@colegio.edu',
  password: 'admin123', // En producción usar hash
  name: 'Administrador',
  role: 'admin'
};

// Routes de prueba
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    connectedClients: io.engine.clientsCount
  });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === adminUser.email && password === adminUser.password) {
    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(`${adminUser.id}:${adminUser.email}`).toString('base64');

    res.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      token
    });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [id, email] = decoded.split(':');

      if (id === adminUser.id) {
        return res.json({
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        });
      }
    } catch (e) {
      // Token inválido
    }
  }

  res.status(401).json({ message: 'No autorizado' });
});

app.get('/api/stats', (req, res) => {
  res.json({
    waiting: queue.length,
    completed: completed.length,
    transport: transport.length,
    total: queue.length + completed.length + transport.length,
    timestamp: new Date()
  });
});

app.get('/api/queue', (req, res) => {
  res.json({
    queue,
    completed,
    transport,
    stats: {
      waiting: queue.length,
      completed: completed.length,
      transport: transport.length
    }
  });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log(`👤 Usuario conectado: ${socket.id}`);
  console.log(`📊 Clientes conectados: ${io.engine.clientsCount}`);

  // Enviar datos iniciales
  socket.emit('queue:init', {
    queue,
    completed,
    transport
  });

  // Nuevo escaneo
  socket.on('scan:new', (studentData) => {
    const student = {
      id: Date.now().toString(),
      order: queue.length + 1,
      ...studentData,
      scannedAt: new Date(),
      status: 'waiting'
    };

    queue.push(student);
    console.log(`📱 Nuevo escaneo: ${student.name}`);

    // Broadcast a todos los clientes
    io.emit('scan:new', student);
    io.emit('queue:update', queue);
  });

  // Marcar como completado
  socket.on('student:completed', ({ studentId, timestamp }) => {
    const studentIndex = queue.findIndex(s => s.id === studentId);

    if (studentIndex !== -1) {
      const student = queue.splice(studentIndex, 1)[0];
      student.completedAt = timestamp || new Date();
      student.status = 'completed';
      completed.push(student);

      console.log(`✅ Estudiante completado: ${student.name}`);

      io.emit('student:completed', { studentId, timestamp });
      io.emit('queue:update', queue);
      io.emit('stats:update', {
        waiting: queue.length,
        completed: completed.length,
        transport: transport.length
      });
    }
  });

  // Asignar a transporte
  socket.on('student:transport', ({ studentId, route, timestamp }) => {
    const studentIndex = queue.findIndex(s => s.id === studentId);

    if (studentIndex !== -1) {
      const student = queue.splice(studentIndex, 1)[0];
      student.route = route;
      student.transportAt = timestamp || new Date();
      student.status = 'transport';
      transport.push(student);

      console.log(`🚌 Estudiante '${student.name}' asignado a: ${route}`);

      io.emit('student:transport', { studentId, route, timestamp });
      io.emit('queue:update', queue);
      io.emit('stats:update', {
        waiting: queue.length,
        completed: completed.length,
        transport: transport.length
      });
    }
  });

  // Refrescar cola
  socket.on('queue:refresh', () => {
    console.log('🔄 Solicitud de refresco de cola');
    socket.emit('queue:refresh', {
      queue,
      completed,
      transport
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`👤 Usuario desconectado: ${socket.id}`);
    console.log(`📊 Clientes conectados: ${io.engine.clientsCount}`);
  });

  // Manejo de errores
  socket.on('error', (error) => {
    console.error(`❌ Error en socket ${socket.id}:`, error);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║     🚀 ScanQueue Backend - En Ejecución   ║
  ║     http://localhost:${PORT}                  ║
  ║     Ambiente: ${process.env.NODE_ENV || 'development'}          ║
  ║     Clientes conectados: 0                 ║
  ╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export { app, server, io };

