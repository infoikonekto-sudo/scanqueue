# ScanQueue - Sistema de Cola en Tiempo Real para Monitor/TV

Aplicación React moderna para mostrar estudiantes escaneados en orden FIFO con actualizaciones en vivo mediante Socket.io.

## ✨ Características

### 📊 Dashboard Completo
- **Header Dinámico**: Hora, fecha, estadísticas en vivo
- **Cola Principal (FIFO)**: Scroll automático, cards interactivas
- **Sección Transportes**: Agrupación por ruta, impresión de listas
- **Historial**: Estudiantes retirados y completados
- **Estadísticas**: Contador real de esperando, retirados y en transporte

### 🎨 Diseño Visual
- Tema blanco y azul marino (#1E3A8A)
- Sombras suaves y bordes redondeados
- Animaciones fluidas con Framer Motion
- Cartas con información clara y legible
- Responsive para múltiples tamaños de pantalla

### 🔄 Sincronización en Vivo (Socket.io)
- `scan:new`: Nuevo estudante escaneado
- `queue:update`: Actualización de cola
- `student:completed`: Marcar como retirado
- `student:transport`: Asignar a transporte
- `queue:refresh`: Recarga completa de datos
- Reconexión automática y manejo de errores

### ♿ Accesibilidad
- Soporte para movimiento reducido
- Notificaciones de navegador
- Sonidos opcionales
- Atajos de teclado (Ctrl+K para búsqueda, F5 para refrescar)
- Navegación por teclado completa

## 🧩 Componentes

### QueueView.jsx
Componente principal que integra toda la aplicación.

```jsx
<QueueView />
```

**Features:**
- Gestión de vista (Cola, Transporte, Historial)
- Filtros (Todos, Esperando, Retirados, Transporte)
- Búsqueda en vivo
- Auto-scroll configurable

### StudentCard.jsx
Tarjeta individual de estudiante.

**Props:**
- `student`: Objeto con datos del estudiante
- `onMarkCompleted`: Callback para marcar como completo
- `onMarkTransport`: Callback para asignar transporte
- `showActions`: Boolean para mostrar/ocultar acciones

### StatsHeader.jsx
Encabezado con estadísticas y hora.

**Muestra:**
- Hora y fecha actual (actualización cada segundo)
- Indicador de conexión
- Contadores: Esperando, Retirados, En Transporte, Total Hoy
- Botón refresh manual

### TransportSection.jsx
Sección para visualizar y gestionar transportes.

**Features:**
- Agrupación automática por ruta
- Contador por ruta
- Impresión de lista por ruta
- Expansión/colapso

## 🔌 Hook useQueue

Hook personalizado para gestionar Socket.io y estado de cola.

```javascript
const {
  queue,           // Array de estudiantes esperando
  completed,       // Array de estudiantes completados
  transport,       // Array de estudiantes en transporte
  stats,           // Objeto con estadísticas
  isConnected,     // Boolean de conexión
  connectionError, // String de error
  markAsCompleted, // Función
  markAsTransport, // Función
  requestQueueRefresh, // Función
  removeFromQueue, // Función
  socket           // Instancia de Socket.io
} = useQueue();
```

## 📱 Responsividad

### Pantalla Pequeña (320px)
- 1 card por fila
- Foto más grande
- Nombre truncado a 20 caracteres

### Tablet (768px)
- 2 cards por fila
- Información estándar

### Monitor/TV (1920x1080)
- 3-4 cards por fila
- Información completa
- Transportes en panel lateral

### 4K (3840px)
- 6+ cards por fila
- Tamaños aumentados
- Fuente más grande

## 🎯 Funcionalidades

### Búsqueda y Filtros
- Búsqueda en vivo por nombre o grado
- Atajo de teclado: `Ctrl+K` / `Cmd+K`
- Filtros: Todo, Esperando, Retirados, Transporte

### Vistas Múltiples
- **Cola**: Vista principal con reordenamiento
- **Transporte**: Enfocada en rutas de bus
- **Historial**: Estudiantes retirados del día

### Acciones con Estudiantes
- ✅ Marcar como retirado
- 🚌 Asignar a transporte (con selección de ruta)
- 🔄 Auto-actualización desde socket

## ⚙️ Instalación

### Requisitos
- Node.js >= 18
- npm >= 9

### Pasos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview
npm run preview
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
REACT_APP_SOCKET_URL=http://localhost:3001
```

### Desarrollo
```bash
npm run dev
# Accede en http://localhost:3000
```

### Producción
```bash
npm run build
# Genera carpeta 'dist'
```

## 🔌 Integración Socket.io

### Servidor Backend Requerido
```javascript
// Eventos esperados desde frontend
socket.on('student:completed', ({ studentId, timestamp }) => {
  // Actualizar base de datos
});

socket.on('student:transport', ({ studentId, route, timestamp }) => {
  // Guardar asignación de transporte
});

socket.on('queue:refresh', () => {
  // Enviar data completa
});

// Emitir nuevos escaneos
socket.emit('scan:new', studentData);
socket.emit('queue:update', updatedQueue);
```

## 📊 Estructura de Datos

### Estudiante
```javascript
{
  id: string,              // ID único
  name: string,            // Nombre completo
  grade: string,           // Grado (ej: "10°A")
  section: string,         // Sección (ej: "A")
  photo: string,           // URL de foto
  scannedAt: Date,         // Hora de escaneo
  status: string,          // "waiting" | "completed" | "transport"
  route: string,           // Ruta de transporte (si aplica)
  completedAt: Date,       // Hora completado
  transportAt: Date        // Hora asignado a transporte
}
```

## 🎬 Animaciones

- **Entrada**: Slide-up + fade con Framer Motion
- **Transición**: Suave entre colores de estado
- **Exit**: Fade-out al completar
- **Pulse**: Sutil en nuevos escaneos

## 🔊 Sonidos y Notificaciones

- Notificaciones del navegador para nuevos escaneos
- Sonido beep opcional (AudioContext API)
- Requiere permiso de notificaciones

## 🎮 Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+K` / `Cmd+K` | Abrir búsqueda |
| `F5` | Refrescar cola |
| `Tab` | Navegar entre botones |
| `Enter` | Activar botón enfocado |

## 📊 Rendimiento

- **Virtual Scrolling**: Automático para >100 items
- **Lazy Loading**: Fotos cargadas bajo demanda
- **Caché**: WebWorkers para datos pesados
- **Optimización**: Code splitting y tree-shaking

## 🐛 Manejo de Errores

- Reconexión automática (5 intentos)
- Indicador visual de desconexión
- Guardar estado local en caché
- Fallback a último estado conocido

## 📱 Ejemplos de Uso

### Inicializar
```jsx
import QueueView from './components/Queue/QueueView';

function App() {
  return <QueueView />;
}
```

### Con datos iniciales simulados
```jsx
// En useQueue.js - descomenta para testing
const mockStudents = [
  {
    id: '1',
    name: 'Juan Pérez',
    grade: '10°A',
    section: 'A',
    photo: 'https://example.com/photo1.jpg',
    scannedAt: new Date(),
    status: 'waiting'
  }
];
```

## 🚀 Deploy

### Vercel / Netlify
```bash
npm run build
# Subir carpeta 'dist'
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 Licencia
MIT

## 👨‍💻 Soporte
Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

## 🔄 Próximas Mejoras
- [ ] Exportar historial a CSV
- [ ] Estadísticas gráficas avanzadas
- [ ] Temas personalizables
- [ ] Sincronización con cámara web
- [ ] Integración con base de datos
- [ ] Panel de administrador
- [ ] SMS/Push notifications
- [ ] Modo offline

---

**ScanQueue** - Hecho con ❤️ para educación en tiempo real
