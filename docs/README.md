# ScanQueue - Documentación Completa

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Componentes](#componentes)
5. [API Socket.io](#api-socketio)
6. [Configuración](#configuración)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

## Descripción General

ScanQueue es un sistema en tiempo real para mostrar estudiantes escaneados en orden FIFO en monitores o TVs. Utiliza React, Socket.io y Tailwind CSS.

### Características Principales
- ✅ Actualización en vivo de cola
- ✅ Gestión de transportes agrupados por ruta
- ✅ Historial de retirados
- ✅ Responsivo para múltiples pantallas
- ✅ Notificaciones auditivas
- ✅ Búsqueda y filtros
- ✅ Estadísticas en tiempo real

## Arquitectura

### Stack Tecnológico
```
Frontend:
├── React 18
├── Vite (bundler)
├── Tailwind CSS
├── Framer Motion (animaciones)
└── Socket.io Client

Backend:
├── Node.js + Express
├── Socket.io Server
├── CORS
└── Dotenv (configuración)
```

### Estructura de Carpetas
```
scanqueue/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Queue/
│   │   │       ├── QueueView.jsx
│   │   │       ├── StudentCard.jsx
│   │   │       ├── StatsHeader.jsx
│   │   │       └── TransportSection.jsx
│   │   ├── hooks/
│   │   │   └── useQueue.js
│   │   ├── utils/
│   │   │   └── dateUtils.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── docs/
    ├── INTEGRACION.md
    └── README.md
```

## Instalación

### Requisitos Previos
- Node.js >= 18
- npm >= 9
- Git

### Paso a Paso

**1. Clonar o descargar proyecto**
```bash
cd scanqueue
```

**2. Instalar Frontend**
```bash
cd frontend
npm install
cp .env.example .env
```

**3. Instalar Backend**
```bash
cd ../backend
npm install
cp .env.example .env
```

**4. Ejecutar en desarrollo**

Terminal 1:
```bash
cd backend
npm run dev
# Escucha en http://localhost:3001
```

Terminal 2:
```bash
cd frontend
npm run dev
# Abre http://localhost:3000
```

## Componentes

### QueueView
Componente principal que orquesta toda la aplicación.

**Props:** Ninguno (usa hook interno)

**Estado:**
- `filter`: Filtro actual (all, waiting, completed, transport)
- `view`: Vista actual (queue, transport, history)
- `searchQuery`: Término de búsqueda
- `autoScroll`: Activar/desactivar auto-scroll

**Características:**
- Múltiples vistas
- Búsqueda en vivo
- Filtros dinámicos
- Auto-scroll inteligente

### StudentCard
Tarjeta individual del estudiante.

**Props:**
```javascript
{
  student: {
    id: string,
    name: string,
    grade: string,
    section: string,
    photo: string,
    order: number,
    status: 'waiting|completed|transport',
    scannedAt: Date,
    route?: string,
    completedAt?: Date,
    transportAt?: Date
  },
  onMarkCompleted: Function,
  onMarkTransport: Function,
  showActions: boolean
}
```

**Acciones:**
- Marcar como retirado (✅)
- Asignar a transporte (🚌)
- Ver detalles

### StatsHeader
Encabezado con estadísticas y hora.

**Props:**
```javascript
{
  stats: {
    waiting: number,
    completed: number,
    transport: number,
    today: number
  },
  isConnected: boolean,
  onRefresh: Function
}
```

**Muestra:**
- Hora y fecha actual (actualización cada segundo)
- Indicador de conexión
- Contadores
- Botón de refresco manual

### TransportSection
Sección para gestionar transportes.

**Props:**
```javascript
{
  students: Array<Student>,
  isExpanded: boolean,
  onToggle: Function
}
```

**Características:**
- Agrupación automática por ruta
- Impresión de listas
- Contador por ruta

## API Socket.io

### Eventos del Frontend (enviados)

#### `scan:new`
Nuevo estudiante escaneado.
```javascript
socket.emit('scan:new', {
  name: 'Juan Pérez',
  grade: '10°A',
  section: 'A',
  photo: 'https://example.com/photo.jpg'
});
```

#### `student:completed`
Marcar estudiante como retirado.
```javascript
socket.emit('student:completed', {
  studentId: '123',
  timestamp: new Date()
});
```

#### `student:transport`
Asignar estudiante a transporte.
```javascript
socket.emit('student:transport', {
  studentId: '123',
  route: 'Ruta A',
  timestamp: new Date()
});
```

#### `queue:refresh`
Solicitar recarga de datos.
```javascript
socket.emit('queue:refresh');
```

### Eventos del Backend (recibidos)

#### `queue:init`
Datos iniciales al conectar.
```javascript
socket.on('queue:init', (data) => {
  const { queue, completed, transport } = data;
});
```

#### `scan:new`
Broadcast de nuevo escaneo.
```javascript
socket.on('scan:new', (student) => {
  // Añadir a cola
});
```

#### `queue:update`
Actualización de toda la cola.
```javascript
socket.on('queue:update', (updatedQueue) => {
  // Reemplazar cola
});
```

#### `student:completed`
Confirmación de estudiante retirado.
```javascript
socket.on('student:completed', ({ studentId, timestamp }) => {
  // Actualizar UI
});
```

#### `student:transport`
Confirmación de asignación a transporte.
```javascript
socket.on('student:transport', ({ studentId, route, timestamp }) => {
  // Mover a transporte
});
```

#### `stats:update`
Actualización de estadísticas.
```javascript
socket.on('stats:update', ({ waiting, completed, transport }) => {
  // Actualizar contadores
});
```

## Configuración

### Variables de Entorno Frontend

**`.env`**
```env
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ENV=development
```

### Variables de Entorno Backend

**`.env`**
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Tailwind Personalización

Editar `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'navy': '#1E3A8A', // Azul marino
      }
    }
  }
}
```

### CSS Global

En `src/styles/globals.css`:
- Estilos base
- Animaciones
- Utilidades personalizadas
- Media queries
- Temas de accesibilidad

## Ejemplos de Uso

### Ejemplo 1: Iniciar aplicación básica

```jsx
import QueueView from './components/Queue/QueueView';

function App() {
  return <QueueView />;
}

export default App;
```

### Ejemplo 2: Simular escaneos en backend

```javascript
// En server.js
setInterval(() => {
  const mockStudent = {
    name: `Estudiante ${Math.floor(Math.random() * 1000)}`,
    grade: `${Math.floor(Math.random() * 6) + 7}°`,
    section: String.fromCharCode(65 + Math.floor(Math.random() * 4)),
    photo: `https://picsum.photos/120?random=${Date.now()}`
  };
  
  io.emit('scan:new', mockStudent);
}, 5000); // Cada 5 segundos
```

### Ejemplo 3: Filtro personalizado

```jsx
// En QueueView.jsx
const filteredStudents = queue.filter(student => 
  student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
  (filter === 'all' || student.status === filter)
);
```

### Ejemplo 4: Notificación sonora

```javascript
// En useQueue.js
const playSound = () => {
  const audioContext = new AudioContext();
  const osc = audioContext.createOscillator();
  osc.frequency.value = 800;
  osc.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.5);
};
```

## Troubleshooting

### Error: Cannot connect to socket server

**Solución:**
1. Verificar que el backend está ejecutándose
2. Comprobar `REACT_APP_SOCKET_URL` en `.env`
3. Verificar CORS en `server.js`
4. Ver logs del navegador (F12)

### Socket desconecta constantemente

**Solución:**
1. Aumentar `reconnectionDelay` en `useQueue.js`
2. Verificar firewall
3. Comprobar logs del servidor
4. Revisar estado de la red

### Las animaciones se ven lentas

**Solución:**
1. Desactivar otras pestañas del navegador
2. Usar Firefox o Chrome actualizado
3. Reducir número de elementos en pantalla
4. Habilitar aceleración de hardware

### Fotos no cargan

**Solución:**
1. Verificar URLs de imágenes válidas
2. Habilitar CORS en servidor de imágenes
3. Usar placeholders: `https://via.placeholder.com/120`
4. Implementar lazy loading

### Build error en producción

**Solución:**
```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Mejoras Futuras

- [ ] Exportar historial a CSV
- [ ] Gráficos estadísticos avanzados
- [ ] Temas personalizables
- [ ] PWA (instalable)
- [ ] Modo offline
- [ ] Base de datos persistente
- [ ] Autenticación
- [ ] Panel de administrador
- [ ] Notificaciones por SMS
- [ ] Integración QR scanner

---

**Última actualización:** 3 de marzo de 2026
**Versión:** 1.0.0
**Licencia:** MIT
