# Ejemplo de Servidor Backend con Socket.io

Este archivo proporciona un servidor Node.js de ejemplo que implementa el backend para ScanQueue.

## Instalación

```bash
cd backend
npm init -y
npm install express socket.io cors dotenv
npm install --save-dev nodemon
```

## package.json

```json
{
  "name": "scanqueue-backend",
  "version": "1.0.0",
  "description": "Backend para ScanQueue",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## server.js

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Estado en memoria (para testing)
let queue = [];
let completed = [];
let transport = [];
let orderCounter = 1;

// Routes de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/stats', (req, res) => {
  res.json({
    waiting: queue.length,
    completed: completed.length,
    transport: transport.length,
    total: queue.length + completed.length + transport.length
  });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('👤 Usuario conectado:', socket.id);
  
  // Enviar datos iniciales
  socket.emit('queue:init', {
    queue,
    completed,
    transport
  });

  // Simular nuevo escaneo
  socket.on('scan:new', (studentData) => {
    const student = {
      id: Date.now().toString(),
      order: orderCounter++,
      ...studentData,
      scannedAt: new Date(),
      status: 'waiting'
    };
    
    queue.unshift(student);
    console.log('📱 Nuevo escaneo:', student.name);
    
    // Broadcast a todos los clientes
    io.emit('scan:new', student);
    io.emit('queue:update', queue);
  });

  // Marcar como completado
  socket.on('student:completed', ({ studentId, timestamp }) => {
    const studentIndex = queue.findIndex(s => s.id === studentId);
    
    if (studentIndex !== -1) {
      const student = queue.splice(studentIndex, 1)[0];
      student.completedAt = timestamp;
      student.status = 'completed';
      completed.push(student);
      
      console.log('✅ Estudiante completado:', student.name);
      
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
      student.transportAt = timestamp;
      student.status = 'transport';
      transport.push(student);
      
      console.log('🚌 Estudiante asignado a:', route);
      
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
    console.log('🔄 Solicitud de refresco');
    io.emit('queue:update', queue);
    io.emit('queue:init', {
      queue,
      completed,
      transport
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('👤 Usuario desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     🚀 ScanQueue Backend Running    ║
  ║     http://localhost:${PORT}           ║
  ║     Connected clients: 0              ║
  ╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
```

## .env

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints de prueba

### GET /api/health
Verifica si el servidor está activo.

### GET /api/stats
Retorna estadísticas actuales de la cola.

## Events Socket.io

### Escuchar (Server receive)
- `scan:new`: Nuevo estudiante escaneado
- `student:completed`: Marcar como completado
- `student:transport`: Asignar a transporte
- `queue:refresh`: Refrescar datos

### Emitir (Server send)
- `queue:init`: Datos iniciales al conectar
- `scan:new`: Broadcast de nuevo escaneo
- `queue:update`: Actualización de cola
- `student:completed`: Confirmación de completado
- `student:transport`: Confirmación de transporte
- `stats:update`: Actualización de estadísticas

## Testing con curl

Para simular escaneos, puedes usar eventos Socket.io desde el cliente o crear un script de testing.

## Notas

- Este es un servidor de ejemplo con almacenamiento en memoria
- Para producción, integra una base de datos (MongoDB, PostgreSQL, etc.)
- Añade autenticación y validación de datos
- Implementa persistencia de datos
- Considera usar Redis para sesiones
- Implementa logging robusto
- Añade monitoreo y alertas
