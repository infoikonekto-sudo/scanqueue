# ScanQueue - Sistema de Cola en Tiempo Real

## 🎯 Visión General

ScanQueue es una aplicación web moderna para mostrar estudiantes escaneados en orden FIFO en monitores o TVs, con sincronización en tiempo real mediante WebSockets.

### Características Principales
- ✅ **Actualización en vivo** - Sincronización automática
- ✅ **Interfaz limpia** - Diseño blanco y azul marino
- ✅ **Gestión de transportes** - Agrupación por rutas
- ✅ **Historial** - Registro de retirados
- ✅ **Estadísticas** - Contadores en tiempo real
- ✅ **Responsive** - Funciona en cualquier pantalla
- ✅ **Animaciones** - Transiciones suaves
- ✅ **Notificaciones** - Alertas visuales y auditivas

## 📦 Contenido del Proyecto

```
scanqueue/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/Queue/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   ├── package.json
│   └── README.md
├── backend/               # Servidor Node.js
│   ├── server.js
│   ├── package.json
│   └── README.md
├── docs/                  # Documentación
│   ├── README.md
│   ├── INTEGRACION.md
│   ├── GUIA_MONITORES.md
│   └── PATRONES.md
└── INICIO_RAPIDO.md      # Este archivo
```

## 🚀 Inicio Rápido

### Requisitos
- **Node.js** >= 18
- **npm** >= 9
- **Git** (opcional)

### Instalación

```bash
# 1. Ir a carpeta del proyecto
cd scanqueue

# 2. Frontend
cd frontend
npm install
npm run dev
# Abre http://localhost:3000

# 3. Backend (otra terminal)
cd ../backend
npm install
npm run dev
# Escucha en http://localhost:3001
```

### Verificar Funcionamiento
1. Abre `http://localhost:3000` en navegador
2. Verifica indicador de conexión (debe estar ✅ verde)
3. El backend debe mostrar "Clientes conectados: 1"

## 🎨 Demostración Rápida

### Simular Nuevo Escaneo

En consola del navegador (F12):
```javascript
// Nota: Requiere tener el socket de useQueue.js expuesto
// O usar el backend para emitir:
socket.emit('scan:new', {
  name: 'María González',
  grade: '10°A',
  section: 'A',
  photo: 'https://picsum.photos/120?random=123'
});
```

### Probado Con
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 📊 Estructura de Componentes

```
QueueView (Principal)
├── StatsHeader (Estadísticas)
├── Controles (Búsqueda/Filtros)
├── StudentCard × N (Tarjetas)
└── TransportSection (Transportes)
```

## 🔌 Integración Socket.io

### Eventos Principales
- `scan:new` - Nuevo escaneo
- `student:completed` - Marcar como retirado
- `student:transport` - Asignar transporte
- `queue:refresh` - Refrescar datos

Ver `docs/INTEGRACION.md` para detalles completos.

## 🎯 Funcionalidades Principales

### 1. Cola en Tiempo Real
- Nuevos escaneos aparecen automáticamente
- Scroll automático al agregar
- Animaciones suaves

### 2. Gestión de Acciones
- ✅ Marcar como retirado
- 🚌 Asignar a transporte (con selección de ruta)
- 🔄 Actualizar estado

### 3. Búsqueda y Filtros
- Búsqueda por nombre
- Filtros: Todos/Esperando/Retirados/Transporte
- Múltiples vistas: Cola/Transporte/Historial

### 4. Estadísticas
- Contadores actualizados cada segundo
- Hora/Fecha automática
- Indicador de conexión

## 💻 Desarrollo

### Comando de Desarrollo
```bash
npm run dev
```

### Build para Producción
```bash
npm run build
npm run preview
```

### ESLint
```bash
npm run lint
```

## 🔧 Configuración

### Variables de Entorno Frontend

Crear `.env` en carpeta frontend:
```env
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ENV=development
```

### Variables de Entorno Backend

Crear `.env` en carpeta backend:
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 📚 Documentación Adicional

- **[INICIO_RAPIDO.md](../INICIO_RAPIDO.md)** - Guía de 5 minutos
- **[docs/README.md](docs/README.md)** - Documentación técnica completa
- **[docs/INTEGRACION.md](docs/INTEGRACION.md)** - Integración Frontend/Backend
- **[docs/GUIA_MONITORES.md](docs/GUIA_MONITORES.md)** - Setup en monitores/TVs
- **[docs/PATRONES.md](docs/PATRONES.md)** - Patrones avanzados de Socket.io

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm ci  # Clean install
```

### Puerto ocupado
```bash
# Cambiar puerto en vite.config.js
server: {
  port: 3100  // Nuevo puerto
}
```

### Socket no conecta
- Verificar que backend está ejecutándose
- Revisar REACT_APP_SOCKET_URL
- Comprobar console (F12) para errores
- Ver logs del backend

## 🌟 Características Destacadas

### Animaciones Suaves
Usa Framer Motion para transiciones profesionales.

### Notificaciones
- Visuales (cambio de color)
- Auditivas (beep opcional)
- Navegador (si permite)

### Responsive
- 📱 Móvil (320px)
- 📱 Tablet (768px)
- 💻 Desktop (1920x1080)
- 📺 4K (3840x2160)

### Rendimiento
- Virtual scrolling para listas grandes
- Lazy loading de imágenes
- Caché local
- Código optimizado

## 🔒 Seguridad

En producción, implementar:
- Autenticación JWT
- CORS configurado
- Validación de datos
- Rate limiting
- HTTPS obligatorio

Ver `docs/INTEGRACION.md` para más detalles.

## 📊 Estadísticas Técnicas

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Tiempo Real:** Socket.io
- **Estilo:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Build:** Vite optimizado

## 🎓 Casos de Uso

### Educación
- Monitoreo de asistencia
- Control de entrada/salida
- Gestor de turnos

### Transporte
- Control de embarque
- Asignación de rutas
- Seguimiento de flota

### Eventos
- Registro de asistentes
- Gestión de colas
- Filas virtuales

## 🔄 Roadmap

- [ ] Panel de administrador
- [ ] Base de datos persistente
- [ ] Reportes y exportación
- [ ] App móvil nativa
- [ ] Notificaciones SMS/Email
- [ ] Machine learning para predicción
- [ ] Integración IoT
- [ ] Modo offline

## 🤝 Contribuir

Para contribuir:
1. Fork del proyecto
2. Crear rama feature
3. Commit cambios
4. Push a rama
5. Abrir Pull Request

## 📝 Licencia

MIT License - Ver LICENSE.txt

## 📞 Soporte

- **Documentación:** `/docs`
- **Issues:** GitHub Issues
- **Email:** soporte@scanqueue.com

## 🎉 ¡Listo para Empezar!

```bash
# Copiar y pegar para empezar
cd scanqueue/frontend
npm install && npm run dev
```

En otra terminal:
```bash
cd scanqueue/backend
npm install && npm run dev
```

Visita: http://localhost:3000

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo, 2026  
**Mantenedor:** Equipo de Desarrollo  

¡Gracias por usar ScanQueue! 🙏
