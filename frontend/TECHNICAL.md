# 📖 Guía Técnica - Frontend ScanQueue

## 🏗️ Arquitectura

### Estructura de Capas

```
UI Layer (componentes)
    ↓
State Management (Zustand)
    ↓
Services (API, WebSocket, QR)
    ↓
Backend API
```

### Data Flow

1. **Usuario interactúa** → Evento en componente
2. **Componente llama** → Hook personalizado o servicio
3. **Servicio procesa** → API o WebSocket
4. **Respuesta actualiza** → Store de Zustand
5. **Store notifica** → Componente se re-renderiza

## 🔄 Flujo de Escaneo

```
┌─────────────────────────────────────┐
│ Usuario abre ScannerPage            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Verificar permiso de cámara         │
└──────────────┬──────────────────────┘
               ↓ (Sí) / (No)
               ├─→ Activar cámara
               └─→ Entrada manual
               ↓
┌─────────────────────────────────────┐
│ Disponible código (QR/Barcode)      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Validar formato                     │
│ Validar duplicado (últimos 30s)    │
│ Validar con servidor                │
└──────────────┬──────────────────────┘
               ↓
           ┌───┴───┐
           ↓       ↓
        ✓ OK   ✗ Error
           ↓       ↓
       Éxito   Feedback error
           ↓       ↓
         Sonido    Notificación
         Vibración
           ↓
    Agregar a store
    Emitir WebSocket
```

## 📲 Hook Personalizado Workflow

### Uso de useSocket

```javascript
// 1. Conectar automáticamente
const socket = useSocket()

// 2. Escuchar eventos
socket.on('queue:updated', (queue) => {
  // Actualizar store
})

// 3. Emitir eventos
socket.emitScan(code, type)
```

### Uso de useCameraPermission

```javascript
const { hasPermission, isChecking, requestPermission } = useCameraPermission()

// Solicitar permiso dinámicamente
const allowed = await requestPermission()
```

## 🗄️ Store de Zustand

### Estructura típica

```javascript
const store = create((set, get) => ({
  // Estado
  state: initialValue,

  // Acciones
  setState: (value) => set({ state: value }),

  // Selectores
  getState: () => get().state,
}))
```

### Subscripción sin componente

```javascript
const unsubscribe = store.subscribe((state) => {
  console.log('Estado cambió:', state)
})

// Cleanup
unsubscribe()
```

## 🌐 API Rest

### Patrón de solicitud

```javascript
try {
  const response = await scanService.validateCode(code, type)
  const { data } = response // axios desenvuelve automáticamente
  
  // Procesar data
} catch (error) {
  const message = error.response?.data?.message
  // Manejar error
}
```

### Interceptors automáticos

- **Request**: Agrega token JWT
- **Response**: Maneja errores 401

## 🔐 Seguridad

### Token JWT
- Enviado en header `Authorization: Bearer {token}`
- Almacenado en localStorage (considerar alternatives)
- Refresh automático aconsejable

### CORS
- Backend debe permitir origen frontend
- Credenciales incluidas si es necesario

### Validación
- **Cliente**: Validación inmediata para UX
- **Servidor**: Validación obligatoria por seguridad

## ⚡ Optimizaciones

### Performance

1. **Code Splitting**
   - React Router lazy loading
   - Dynamic imports

2. **Memoization**
   - React.memo para componentes puros
   - useMemo para cálculos costosos
   - useCallback para funciones

3. **Renderizado**
   - Usar key correcto en listas
   - Evitar re-renderizados innecesarios

### Bundle Size

Con Vite:
- Minificación automática
- Tree-shaking
- Dynamic imports

## 🧪 Testing (Implementar après)

### Estructura sugerida

```
__tests__/
├── unit/
│   └── utils.test.js
├── integration/
│   └── scanner.test.js
└── e2e/
    └── scanner.e2e.js
```

### Stack recomendado

- Vitest (alternativa a Jest)
- React Testing Library
- Playwright (e2e)

## 📊 Debugging

### Herramientas

1. **DevTools**
   - React DevTools extension
   - Redux DevTools (Zustand)
   - Network tab

2. **Logs**
   ```javascript
   // Development
   if (process.env.DEV) {
     console.log('Debug:', value)
   }
   ```

3. **Source Maps**
   - Habilitados en desarrollo
   - Deshabilitados en producción

## 🚀 Deployment

### Producción

```bash
npm run build
# dist/ está listo para servir

# Servir con servidor estático
npx serve dist
```

### Configuración recomendada

```javascript
// vite.config.js
build: {
  outDir: 'dist',
  sourcemap: false,
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true }
  }
}
```

## 📱 Responsive Design Checklist

- [ ] Probado en 320px (móvil pequeño)
- [ ] Probado en 768px (tablet)
- [ ] Probado en 1024px (desktop)
- [ ] Probado en orientación horizontal
- [ ] Touch targets > 44px²
- [ ] Fuentes legibles
- [ ] Safe area insets (notches)

## ♿ Accesibilidad WCAG AAA

- [ ] Contraste de colores (7:1)
- [ ] Labels en inputs
- [ ] ARIA labels donde necesario
- [ ] Navegación por teclado
- [ ] Focus visible
- [ ] Alt text en imágenes
- [ ] Estructura semántica HTML

## 🐛 Errores Comunes

### WebSocket no conecta
- Verificar URL en .env
- Verificar CORS en backend
- Verificar firewall

### Cámara sin permisos
- Requiere HTTPS en producción
- No compartir tab con otros permisos
- User debe aprobar de nuevo

### Store no se actualiza
- Usar setter correcto
- Verificar que componente esté subscrito
- No mutar estado directamente

## 📚 Recursos

- [React Docs](https://react.dev)
- [Zustand](https://github.com/pmndrs/zustand)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)
