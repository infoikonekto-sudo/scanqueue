# FAQ - Preguntas Frecuentes

## 🚀 Instalación y Configuración

### ¿Cómo instalo ScanQueue?

**Opción 1: Automática (Recomendada)**
```bash
# Windows
install.bat

# Linux/Mac
bash install.sh
```

**Opción 2: Manual**
```bash
cd frontend
npm install
npm run dev

cd ../backend
npm install
npm run dev
```

### ¿Qué versión de Node.js necesito?
Node.js >= 18 y npm >= 9. Descárgalo desde [nodejs.org](https://nodejs.org)

### ¿Puedo usar yarn en lugar de npm?
Sí, pero las instrucciones están optimizadas para npm.

---

## 🔧 Desarrollo

### ¿Cómo cambio los colores?

Edita `tailwind.config.js`:
```javascript
colors: {
  'navy': '#1E3A8A',  // Tu color aquí
}
```

### ¿Cómo añado nuevas rutas de transporte?

En `StudentCard.jsx`:
```javascript
const routes = ['Ruta A', 'Ruta B', 'Ruta C', 'Ruta D', 'Ruta E'];
```

### ¿Cómo cambio el logo/emoji?

En `StatsHeader.jsx`:
```jsx
<div className="text-3xl">📱</div>  // Cambiar por otro emoji
```

### ¿Cómo cambio el intervalo de actualización?

En `useQueue.js` o `QueueView.jsx`:
```javascript
setInterval(() => {
  requestQueueRefresh();
}, 30000); // Cada 30 segundos
```

---

## 🔌 Socket.io

### ¿Cómo emito eventos personalizados?

```javascript
// En frontend
socket.emit('custom:event', { data: 'value' });

// En backend
socket.on('custom:event', (data) => {
  console.log(data);
});
```

### ¿Cómo envío datos al conectar?

```javascript
socket.on('connect', () => {
  socket.emit('initialize', { userId: '123' });
});
```

### ¿Cómo reconecto automáticamente?

Ya está implementado en `useQueue.js` con reintentos exponenciales.

### ¿Cómo veo los logs de Socket.io?

Habilita debug:
```javascript
const socket = io(URL, { debug: true });
```

---

## 🎨 Interfaz

### ¿Cómo cambio el tamaño de las fotos?

En `StudentCard.jsx`:
```jsx
<img className="w-28 h-28 rounded-full" />
// Cambia w-28 h-28 por: w-40 h-40, w-20 h-20, etc.
```

### ¿Cómo cambio el número de cards por fila?

En `QueueView.jsx`:
```jsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
// Cambia los números según necesites
```

### ¿Cómo deshabilito las animaciones?

En `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

### ¿Cómo cambio las fuentes?

En `globals.css`:
```css
body {
  font-family: 'Tu Fuente', sans-serif;
}
```

---

## 📱 Responsive

### ¿El diseño se ve mal en móvil?

Los componentes son responsivos. Sí ves problemas:
1. Abre DevTools (F12)
2. Activa vista responsiva
3. Prueba diferentes tamaños

### ¿Cómo optimizo para TV 4K?

En `tailwind.config.js`:
```javascript
screens: {
  '4k': '3840px'
}

// Luego usar
<div className="4k:text-6xl">Texto grande</div>
```

---

## 🔒 Seguridad

### ¿Cómo añado autenticación?

En `server.js`:
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (validarToken(token)) {
    next();
  } else {
    next(new Error('Auth error'));
  }
});
```

### ¿Cómo protejo contra CORS?

Edita `server.js`:
```javascript
const io = socketIo(server, {
  cors: {
    origin: 'https://midominio.com',
    methods: ['GET', 'POST']
  }
});
```

### ¿Cómo valido datos?

```javascript
socket.on('scan:new', (data) => {
  if (!data.name || !data.grade) {
    socket.emit('error', 'Datos inválidos');
    return;
  }
  // Procesar
});
```

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Cambia los puertos en .env
PORT=3002  # Otro puerto disponible
```

### Socket no conecta
1. Verifica que backend está corriendo
2. Revisa `REACT_APP_SOCKET_URL` en frontend `.env`
3. Abre consola (F12) para ver errores
4. Verifica CORS en backend

### Imágenes no cargan
1. Verifica URLs válidas
2. Habilita CORS en servidor de imágenes
3. Usa placeholder: `https://via.placeholder.com/120`

### Animaciones lentas
1. Cierra otras pestañas
2. Usa navegador actualizado
3. Revisa rendimiento (DevTools > Performance)

---

## 📊 Datos

### ¿Cómo persisto datos en BD?

Crea tabla en PostgreSQL:
```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  grade VARCHAR(10),
  section VARCHAR(10),
  scanned_at TIMESTAMP,
  status VARCHAR(20),
  route VARCHAR(50)
);
```

Luego conéctate en backend usando `pg`.

### ¿Cómo exporto historial?

Implementa en backend:
```javascript
app.get('/api/export', (req, res) => {
  const csv = convertToCSV(completed);
  res.header('Content-Type', 'text/csv');
  res.send(csv);
});
```

### ¿Cómo borro datos antiguos?

Cron job en servidor:
```javascript
schedule.scheduleJob('0 0 * * *', () => {
  deleteOldRecords();
});
```

---

## 🚀 Deploy

### ¿Cómo hago deploy a Vercel?

```bash
# Frontend
npm run build
# Sube carpeta 'dist' a Vercel

# Backend
# Deploy a Heroku o similar
```

### ¿Cómo uso Docker?

```bash
docker-compose up
# Accede en http://localhost:3000
```

### ¿Cómo configuro SSL/HTTPS?

Usa reverse proxy (Nginx):
```nginx
server {
  listen 443 ssl;
  server_name tu-dominio.com;
  
  proxy_pass http://localhost:3000;
}
```

---

## 📈 Performance

### ¿Cómo optimizo la velocidad?

1. **Frontend:**
   - Usar lazy loading en imágenes
   - Code splitting con Vite
   - Caché de recursos

2. **Backend:**
   - Usar Redis para sesiones
   - Índices en BD
   - Compresión GZIP

### ¿Cómo monitoreo performance?

Chrome DevTools:
1. F12 > Performance
2. Graba sesión de uso
3. Analiza tiempos

---

## 🎓 Aprendizaje

### ¿Documetación oficial?

- [React](https://react.dev)
- [Socket.io](https://socket.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

### ¿Dónde reporto bugs?

En Issues del repositorio con:
- Paso a paso para reproducir
- Versión de Node.js
- Navegador utilizado
- Logs de error

### ¿Cómo contribuyo?

1. Fork del proyecto
2. Rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m "Descripción"`
4. Push: `git push origin feature/mi-feature`
5. Pull Request a main

---

## 💬 Soporte

### Comunidad
- **Discord:** [Link del servidor]
- **GitHub Issues:** Reporta bugs
- **Email:** soporte@scanqueue.com
- **Twitter:** @scanqueue

### Comercial
- Hosting: contacto@scanqueue.com
- Consultoría: consultores@scanqueue.com

---

## ❓ Mi pregunta no está aquí

1. Revisa la documentación en `/docs`
2. Busca en GitHub Issues
3. Consulta el código (comments detallados)
4. Contacta al equipo de soporte

---

**Última actualización:** 3 de marzo, 2026  
**Versión:** 1.0.0
