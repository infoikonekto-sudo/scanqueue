# Guía de Uso para Monitores/TVs

## 📺 Configuración Recomendada por Pantalla

### Monitor de Escritorio (24" - 27")
- **Resolución:** 1920x1080
- **Layout:** 3-4 cards por fila
- **Zoom:** 100%
- **Actualizar Each:** Automático cada 2s

### TV (43" - 55")
- **Resolución:** 1920x1080 o 4K
- **Layout:** 4-6 cards por fila
- **Zoom:** 125% - 150%
- **Distancia:** 1.5 - 2 metros
- **Actualizar:** En tiempo real

### Proyector/Pantalla Grande (> 65")
- **Resolución:** 4K (3840x2160)
- **Layout:** 6+ cards por fila
- **Zoom:** 150% - 200%
- **Distancia:** 2 - 3 metros
- **Actualizar:** En tiempo real

### iPad/Tablet
- **Resolución:** 2048x1536 o inferior
- **Layout:** 2 cards por fila
- **Modo:** Landscape obligatorio
- **Auto-rotate:** Desactivar
- **Zoom:** 100%

## 🎮 Controles

### Navegación Teclado
```
[Tab]              → Navegar entre secciones
[Shift + Tab]      → Navegar hacia atrás
[Enter]            → Activar botón enfocado
[Space]            → Toggle expansión
[Ctrl + K]         → Abrir búsqueda
[F5]               → Refrescar cola
[Cmd/Ctrl] + [+]   → Aumentar zoom
[Cmd/Ctrl] + [-]   → Disminuir zoom
[Cmd/Ctrl] + [0]   → Zoom por defecto
```

### Ratón/Touchpad
- Click en cards para interactuar
- Scroll vertical en cola
- Double-click en estudiante para detalles
- Botón derecho si se implementa contexto

### Touch (Tablets)
- Swipe arriba/abajo: Scroll
- Swipe izquierda: Marcar completado
- Swipe derecha: Marcar transporte
- Tap largo: Ver opciones

## 🏢 Instalación en Piso Escolar

### Setup Recomendado

**Opción 1: TV Mural + Dispositivo**
```
┌─────────────────────────────────┐
│         TV 55" 4K              │
│     (Montaje en pared)          │
│                                 │
│  Conectado a:                   │
│  ├─ Raspberry Pi                │
│  └─ Mini PC (recomendado)       │
└─────────────────────────────────┘
        2 metros de distancia
```

**Opción 2: Monitor + Computadora**
```
┌──────────────┐
│ Monitor 27"  │
│   1920x1080  │
│              │
└──────────────┘
       ↑
    Mini PC
   o Laptop
```

**Opción 3: Proyector**
```
    Proyector
        ↓
     ╔═════╗
     ║     ║ Pantalla
     ║     ║ Blanca
     ╚═════╝
   
   (Desde 2 metros)
```

## ⚙️ Configuración de Hardware

### Raspberry Pi 4 (Económico)
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Ejecutar frontend
cd scanqueue/frontend
npm install
npm run build
npm run preview

# En navegador Chromium
chromium-browser --start-fullscreen --kiosk http://localhost:5000
```

### Mini PC (Recomendado)
- Intel i5 o superior
- 8GB RAM mínimo
- SSD 256GB
- Precio: $200 - $400 USD

### Laptop Dedicada
- Conectar HDMI a próyector/TV
- Mantener conectada a poder
- Activar modo no-dormir

## 🎨 Personalizaciones

### Cambiar Colores (brands)

**En `tailwind.config.js`:**
```javascript
theme: {
  extend: {
    colors: {
      'navy': '#1E3A8A',      // Azul marino
      'primary': '#2563EB',   // Azul
      'accent': '#F59E0B',    // Orange
      'success': '#10B981',   // Verde
      'danger': '#EF4444',    // Rojo
    }
  }
}
```

### Cambiar Logo
Reemplazar en `StatsHeader.jsx`:
```jsx
<div className="text-3xl">📱</div>  // Cambiar emoji
```

### Cambiar Tipografía
**En `globals.css`:**
```css
body {
  font-family: 'Segoe UI', 'Arial', sans-serif;
}
```

## 🔔 Notificaciones

### Sonido de Alerta
```javascript
// En useQueue.js
const playSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};
```

### Notificación Visual
Ya implementada con colores y animaciones.

### Notificación del Navegador
```javascript
if (Notification.permission === 'granted') {
  new Notification('Nuevo Estudiante', {
    body: student.name,
    icon: 'logo.png'
  });
}
```

## 📊 Estadísticas en Vivo

Muestra en tiempo real:
- Estudiantes esperando
- Estudiantes retirados
- Estudiantes en transporte
- Total del día

Se actualiza automáticamente cada segundo.

## 🔄 Auto-Refresh

### Configurar Intervalo
En `QueueView.jsx`:
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    requestQueueRefresh();
  }, 30000); // Cada 30 segundos
  
  return () => clearInterval(interval);
}, []);
```

### Forzar Refresh
- Botón manual en header
- Atajo F5
- Auto cada 30 segundos (opcional)

## 💾 Modo Fullscreen

### Navegadores
```bash
# Chrome
chromium-browser --start-fullscreen http://localhost:3000

# Firefox
firefox --kiosk http://localhost:3000

# Safari
abierto -a Safari http://localhost:3000
```

### Ocultar UI del Navegador
Presionar **F11** en navegador completo.

## 🖥️ Múltiples Monitores

Para usar 2 monitores simultáneamente:

1. **Monitor 1 (Principal):** Cola principal
2. **Monitor 2 (Secundario):** Estadísticas/Transportes

```html
<!-- En index.html -->
<div id="root-main"></div>
<div id="root-secondary"></div>
```

## 🔐 Seguridad

### Bloquear Controles del Navegador
```javascript
// Deshabilitar clic derecho
document.addEventListener('contextmenu', e => e.preventDefault());

// Deshabilitar f12
document.addEventListener('keydown', e => {
  if (e.key === 'F12') e.preventDefault();
});
```

### Ocultar Controles UI
Agregar en `QueueView.jsx`:
```javascript
useEffect(() => {
  document.documentElement.style.overflow = 'hidden';
}, []);
```

## 🌡️ Monitoreo

### CPU/Memoria
Usar DevTools (F12) > Performance para monitorear.

### Logs del Servidor
Terminal del backend mostrará eventos en vivo:
```
📱 Nuevo escaneo: Juan Pérez
✅ Estudiante completado: Juan Pérez
🚌 Estudiante asignado a: Ruta A
```

## 🎯 Tips Adicionales

1. **Mantener actualizado:** npm update regularmente
2. **Caché:** Limpiar cada semana (Ctrl+Shift+Del)
3. **Reinicio:** Server reinicia cada 24h automáticamente
4. **Backup:** Guardar historial diariamente
5. **Ventilación:** Mantener dispositivo en ambiente fresco

---

Impreso: 2026-03-03
Versión: 1.0.0
