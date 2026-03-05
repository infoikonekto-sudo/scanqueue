# Guía de Integración Frontend-Backend

## Arquitectura

```
┌─────────────────┐         ┌──────────────────┐
│   Frontend      │◄──────►│  Backend Node.js │
│  React + Vite   │ Socket  │   + Express      │
│   Port 3000     │   IO    │   Port 3001      │
└─────────────────┘         └──────────────────┘
         │                           │
         └──────────────────────────┘
              Base de Datos
             (PostgreSQL/MongoDB)
```

## Instalación Completa

### 1. Clonar y configurar proyecto

```bash
cd scanqueue

# Frontend
cd frontend
npm install
cp .env.example .env

# Backend (en otra terminal)
cd ../backend
npm install
cp .env.example .env
```

### 2. Iniciar servidores (dos terminales)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Escucha en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Accede en http://localhost:3000
```

## Flujo de Datos

### 1. Nuevo Escaneo
```
Cliente escanea código QR
    ↓
Envía datos al backend
    ↓
Socket.io: 'scan:new'
    ↓
Broadcast a todos los clientes
    ↓
QueueView actualiza automáticamente
```

### 2. Marcar como Completado
```
Usuario hace clic en botón
    ↓
Socket.io: 'student:completed'
    ↓
Backend actualiza estado
    ↓
Broadcast 'student:completed'
    ↓
Frontend mueve a historial
```

## Integración Socket.io

### Frontend (useQueue.js)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => console.log('Conectado'));
socket.on('scan:new', (student) => console.log('Nuevo:', student));
socket.emit('student:completed', { studentId: '123' });
```

### Backend (server.js)
```javascript
io.on('connection', (socket) => {
  socket.on('scan:new', (studentData) => {
    // Procesar
    io.emit('scan:new', student); // Broadcast
  });
});
```

## Manejo de Errores

### Reconexión Automática
Frontend intenta reconectar hasta 5 veces con delay exponencial.

### Indicador Visual
Verde = Conectado ✅
Rojo = Desconectado ❌

### Caché Local
Si se desconecta, mantiene último estado en memoria.

## Seguridad

### En Desarrollo
- CORS habilitado para localhost
- Sin autenticación

### Para Producción
1. **Autenticación**
   ```javascript
   io.use((socket, next) => {
     const token = socket.handshake.auth.token;
     // Validar token JWT
     next();
   });
   ```

2. **Validación de Datos**
   ```javascript
   socket.on('scan:new', (data) => {
     if (!data.name || !data.grade) {
       socket.emit('error', 'Datos inválidos');
       return;
     }
   });
   ```

3. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use('/api/', limiter);
   ```

## Variables de Entorno

### Frontend (.env)
```env
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ENV=development
```

### Backend (.env)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Persistencia de Datos

### Opción 1: MongoDB
```javascript
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  grade: String,
  section: String,
  scannedAt: Date,
  status: String,
  route: String
});

const Student = mongoose.model('Student', studentSchema);
```

### Opción 2: PostgreSQL
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// INSERT, UPDATE, SELECT...
```

## Testing de Socket.io

### Con curl (GET)
```bash
curl http://localhost:3001/api/health
```

### Con cliente Socket.io de prueba
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  socket.emit('scan:new', {
    name: 'Juan Pérez',
    grade: '10°A',
    section: 'A',
    photo: 'https://example.com/photo.jpg'
  });
});
```

## Monitoreo en Producción

### Con PM2
```bash
# Instalar
npm install -g pm2

# Iniciar
pm2 start server.js --name "scanqueue-backend"

# Monitoreo
pm2 monit
pm2 logs

# Restart automático
pm2 startup
pm2 install pm2-auto-pull
```

## Scaling

### Múltiples instancias
```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const redis = require('redis');

const pubClient = redis.createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## Troubleshooting

### Error: "Cannot find module 'socket.io'"
```bash
cd backend
npm install socket.io
```

### Error: Cannot connect from frontend
1. Verificar que backend está corriendo
2. Revisar PORT en .env
3. Verificar CORS en backend
4. Comprobar REACT_APP_SOCKET_URL en frontend

### Socket se desconecta constantemente
1. Aumentar `reconnectionDelay`
2. Verificar conexión de red
3. Revisar logs del servidor
4. Comprobar firewall

## Próximos Pasos

- [ ] Autenticación con JWT
- [ ] Base de datos persistente
- [ ] Histórico y reportes
- [ ] Admin dashboard
- [ ] Notificaciones por correo
- [ ] Integración con QR scanner
