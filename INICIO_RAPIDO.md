# Guía de Inicio Rápido - ScanQueue

## ⚡ En 5 Minutos

### 1️⃣ Instalar Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend (nueva terminal)
cd backend
npm install
```

### 2️⃣ Ejecutar Servidores

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
# Abre http://localhost:3000
```

### 3️⃣ ¡Listo! 🎉
- Abre `http://localhost:3000` en tu navegador
- Verás la pantalla de cola en blanco y azul marino
- Backend lisio para recibir escaneos

---

## 📱 Simular Escaneo

En la consola del backend, ejecuta:

```javascript
// Desde el servidor Node.js
io.emit('scan:new', {
  name: 'Juan Pérez',
  grade: '10°A',
  section: 'A',
  photo: 'https://picsum.photos/120?random=1'
});
```

O desde frontend (consola del navegador):

```javascript
// Para testing (descomenta en useQueue.js)
socket.emit('scan:new', {
  name: 'Test Student',
  grade: '9°',
  section: 'B',
  photo: 'https://via.placeholder.com/120'
});
```

---

## 🎮 Controles Principales

| Acción | Botón |
|--------|-------|
| Marcar Retirado | ✅ Verde |
| Asignar Transporte | 🚌 Naranja |
| Refrescar | 🔄 Header |
| Buscar | 🔍 Campo superior |
| Cambiar Vista | Pestañas |

---

## 🔧 Problemas Comunes

### ❌ "Cannot connect to socket"
```bash
# Reinicia backend
npm run dev

# Y verifica en frontend el .env
echo $REACT_APP_SOCKET_URL
# Debe ser: http://localhost:3001
```

### ❌ "Port already in use"
```bash
# Cambia los puertos en .env
REACT_APP_SOCKET_URL=http://localhost:3002
PORT=3002  # Backend
```

### ❌ "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## 📦 Build para Producción

```bash
# Frontend
cd frontend
npm run build
# Genera carpeta 'dist'

# Backend
cd backend
NODE_ENV=production npm start
```

---

## 🗂️ Archivos Clave

| Archivo | Qué Hace |
|---------|----------|
| `QueueView.jsx` | Componente principal |
| `useQueue.js` | Lógica de Socket.io |
| `StudentCard.jsx` | Tarjeta individual |
| `server.js` | Backend Node.js |

---

## 📚 Documentación

- **`README.md`** - Descripción general
- **`INTEGRACION.md`** - Integración frontend/backend
- **`GUIA_MONITORES.md`** - Setup en monitores/TVs
- **`PATRONES.md`** - Patrones avanzados

---

## ✅ Checklist

- [ ] Node.js >= 18 instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Backend ejecutándose (`npm run dev`)
- [ ] Frontend ejecutándose (`npm run dev`)
- [ ] http://localhost:3000 abierto
- [ ] Socket.io conectado (indicador verde)
- [ ] Escaneos mostrándose en cola

---

## 🚀 Próximas Características

- [ ] Exportar historial
- [ ] Dashboard de admin
- [ ] Notificaciones SMS
- [ ] Integración QR scanner
- [ ] Base de datos persistente

---

**¿Problemas?** Revisa los logs en terminal y navegador (F12)

**¿Preguntas?** Ver documentación en carpeta `docs/`

Versión: 1.0.0 | Año: 2026
