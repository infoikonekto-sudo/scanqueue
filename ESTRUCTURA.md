# 📁 Estructura del Proyecto - Guía Completa

```
scanqueue/
│
├── 📚 DOCUMENTACIÓN
│   ├── README.md                    ✅ Descripción general
│   ├── INICIO_RAPIDO.md             ✅ Guía de 5 minutos
│   ├── FAQ.md                       ✅ Preguntas frecuentes
│   └── docs/
│       ├── README.md                ✅ Docs técnica completa
│       ├── INTEGRACION.md           ✅ Frontend ↔ Backend
│       ├── GUIA_MONITORES.md        ✅ Setup en TV/Monitores
│       └── PATRONES.md              ✅ Patrones Socket.io
│
├── 🎨 FRONTEND (React + Vite)
│   ├── public/                      📱 Assets estáticos
│   ├── src/
│   │   ├── components/
│   │   │   └── Queue/
│   │   │       ├── QueueView.jsx         ⭐ Componente principal
│   │   │       ├── StudentCard.jsx       📇 Tarjeta individual
│   │   │       ├── StatsHeader.jsx       📊 Estadísticas
│   │   │       └── TransportSection.jsx  🚌 Gestión transportes
│   │   │
│   │   ├── hooks/
│   │   │   └── useQueue.js          🔌 Socket.io + Estado
│   │   │
│   │   ├── utils/
│   │   │   └── dateUtils.js         ⏰ Funciones de fecha
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css          🎨 Estilos globales
│   │   │
│   │   ├── App.jsx                  🔧 Componente raíz
│   │   └── index.jsx                🚀 Punto de entrada
│   │
│   ├── index.html                   🌐 HTML principal
│   ├── package.json                 📦 Dependencias
│   ├── vite.config.js               ⚙️ Config Vite
│   ├── tailwind.config.js           🎨 Config Tailwind
│   ├── tsconfig.json                📝 Config TypeScript
│   ├── .eslintrc.json               🔍 Linting
│   ├── .env.example                 🔑 Variables ejemplo
│   └── README.md                    📖 Docs Frontend
│
├── 🔧 BACKEND (Node.js + Express)
│   ├── server.js                    🚀 Servidor principal
│   ├── package.json                 📦 Dependencias
│   ├── .env.example                 🔑 Variables ejemplo
│   ├── demo.js                      🎬 Demo interactiva
│   ├── SERVER_EXAMPLE.md            📖 Ejemplo servidor
│   └── README.md                    📖 Docs Backend
│
├── 🐳 DEPLOYMENT
│   ├── Dockerfile                   🐳 Imagen Docker
│   ├── docker-compose.yml           🎛️ Orquestación
│   ├── build-docker.sh              📦 Build Docker
│   ├── install.sh                   ⚙️ Setup Linux/Mac
│   ├── install.bat                  ⚙️ Setup Windows
│   ├── start-dev.sh                 ▶️ Dev Linux/Mac
│   └── start-dev.bat                ▶️ Dev Windows
│
└── 📝 ARCHIVOS RAÍZ
    ├── .gitignore                   🔒 Git ignore
    ├── LICENSE                      📜 Licencia MIT
    └── ESTRUCTURA.md                📊 Este archivo
```

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR                        │
│  ┌─────────────────────────────────────────────┐   │
│  │             QueueView.jsx                    │   │
│  │  ├─ StatsHeader (Hora, Estadísticas)       │   │
│  │  ├─ Controles (Búsqueda, Filtros)          │   │
│  │  ├─ StudentCard × N (Lista de Alumnos)     │   │
│  │  └─ TransportSection (Rutas)               │   │
│  └─────────────┬───────────────────────────────┘   │
│                │                                    │
│                │ useQueue Hook                     │
│                │ (Socket.io Client)                │
│                │                                    │
└────────────────┼────────────────────────────────────┘
                 │ WebSocket
                 │
           ┌─────┴──────┐
           │   SERVER   │
           │ (port 3001)│
           └──────┬─────┘
                  │
        ┌─────────┼──────────┐
        │         │          │
    MongoDB  PostgreSQL   Memory
      (BD)    (BD)       (Caché)
```

## 🔄 Ciclo de Vida de un Escaneo

```
1. ESCANEO
   Usuario escanea código QR
        ↓
2. EMISIÓN
   Socket.emit('scan:new', studentData)
        ↓
3. PROCESAMIENTO
   Backend recibe y valida datos
        ↓
4. BROADCAST
   io.emit('scan:new', processedStudent)
        ↓
5. RECEPCIÓN
   Frontend recibe en useQueue
        ↓
6. ACTUALIZACIÓN
   setQueue(prev => [...prev, student])
        ↓
7. RENDERIZADO
   StudentCard aparece con animación
        ↓
8. UI UPDATE
   Stats se actualiza automáticamente
```

## 🎨 Estilos y Theming

```
globals.css
├── Reset CSS
├── Animations
│   ├── slideUp
│   ├── fadeIn
│   └── pulse-light
├── Custom Classes
│   ├── .text-navy
│   ├── .bg-navy
│   └── .border-navy
└── Media Queries
    ├── Mobile (320px)
    ├── Tablet (768px)
    ├── Desktop (1920px)
    └── 4K (3840px)

tailwind.config.js
├── Colors
│   ├── navy (#1E3A8A)
│   ├── primary (#2563EB)
│   └── accent (#F59E0B)
├── Spacing
├── Animations
└── Responsive Screens
```

## 🔌 Socket.io Events Map

```
CLIENTE ─────────────────────────────────► SERVIDOR
         
         scan:new
         student:completed
         student:transport
         queue:refresh

CLIENTE ◄───────────────────────────────── SERVIDOR
         
         queue:init
         scan:new (broadcast)
         queue:update
         student:completed
         student:transport
         stats:update
```

## 📦 Dependencias Principales

```
FRONTEND
├── react@18.2.0              ⚛️ Librería UI
├── vite@5.0.10              ⚡ Bundler
├── tailwindcss@3.4.1        🎨 Estilos
├── framer-motion@10          🎬 Animaciones
├── socket.io-client@4.7.2   🔌 Realtime
└── postcss@8.4.32           📝 CSS Processing

BACKEND
├── express@4.18.2           🚀 Framework
├── socket.io@4.7.2          🔌 Realtime
├── cors@2.8.5               🔐 CORS
└── dotenv@16.3.1            🔑 Config
```

## 🚀 Comandos Clave

```bash
# FRONTEND
npm run dev         # Desarrollo
npm run build       # Build producción
npm run preview     # Preview build
npm run lint        # ESLint

# BACKEND
npm run dev         # Desarrollo (nodemon)
npm start           # Producción
npm run demo        # Demo interactiva

# DOCKER
docker build -t scanqueue .
docker-compose up
docker-compose down

# SCRIPTS
bash install.sh          # Linux/Mac
install.bat              # Windows
bash start-dev.sh        # Dev Linux/Mac
start-dev.bat            # Dev Windows
```

## 🎯 Componentes por Función

```
VISUALIZACIÓN
├── QueueView         - Orquestador principal
├── StudentCard       - Datos individuales
├── StatsHeader       - Información en tiempo real
└── TransportSection  - Agrupación de rutas

LÓGICA
├── useQueue          - Estado y Socket.io
└── dateUtils         - Formatos de fecha

ESTILOS
├── globals.css       - Base
└── tailwind.config   - Configuración
```

## 📊 Tamaños de Archivo

```
Componentes:
├── QueueView.jsx      ~8 KB
├── StudentCard.jsx    ~5 KB
├── StatsHeader.jsx    ~4 KB
├── TransportSection   ~6 KB
├── useQueue.js        ~8 KB
└── Total Frontend    ~50 KB

Backend:
└── server.js          ~3 KB

Compilado (minificado):
├── JS                 ~150 KB
├── CSS                ~50 KB
└── Total             ~200 KB
```

## 🔑 Configuración Mínima

```env
REACT_APP_SOCKET_URL=http://localhost:3001
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📱 Breakpoints Responsive

```css
xs  :  320px   (Móvil pequeño)
sm  :  640px   (Móvil)
md  :  768px   (Tablet)
lg  : 1024px   (Laptop)
xl  : 1280px   (Desktop)
2xl : 1536px   (4K)
```

## 🎬 Animaciones Implementadas

```
Entrada:
├── slideUp       ↑ + fade
├── fadeIn        Suave
└── pulse         Sutil

Interacción:
├── Hover         Scale
├── Click         Tap
└── Loading       Spinner

Salida:
├── slideDown     ↓
├── fadeOut       Suave
└── scale         Reducción
```

## 🌐 Rutas de API (REST)

```
GET  /api/health          ← Estado servidor
GET  /api/stats           ← Estadísticas
GET  /api/queue           ← Datos completos
POST /api/export          ← Exportar CSV (futura)
```

## 🔐 Capas de Seguridad

```
Nivel 1: CORS
  └─ Origen validado

Nivel 2: Socket.io Auth (opcional)
  └─ Token JWT

Nivel 3: Validación de datos
  └─ Schema validator

Nivel 4: Rate Limiting
  └─ Throttling por IP

Nivel 5: Data Sanitization
  └─ XSS prevention
```

---

**Diagrama actualizado:** 3 de marzo, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
