# Notas de Desarrollo - ScanQueue Backend

## Arquitectura

### Patrón MVC + Services
- **Modelos** (`src/models/`) - Interacción con BD usando SQL directo
- **Controladores** (`src/controllers/`) - Lógica de endpoints
- **Servicios** (`src/services/`) - Lógica de negocio reutilizable
- **Middleware** - Autenticación, validación, manejo de errores
- **Rutas** - Definición de endpoints

### Por qué esta arquitectura
- Separación de responsabilidades clara
- Servicios reutilizables entre controladores
- Fácil testing y mantenimiento
- Escalabilidad

## Convenciones de Código

### Nombres de Archivos
- Controladores: `PascalCase` (ej: `StudentController.js`)
- Modelos: `PascalCase` (ej: `Student.js`)
- Servicios: `PascalCase` (ej: `QRService.js`)
- Rutas: `lowercase` (ej: `students.js`)
- Middleware: `descriptivo.js` (ej: `auth.js`)

### Comentarios
- Usar `/**` para comentarios de función (JSDoc)
- Usar `//` para líneas individuales
- Ser específico y conciso

### Variables
- Usar `camelCase` para variables
- Usar `snake_case` para nombres de columnas BD
- Usar `UPPER_CASE` para constantes

## Funciones Clave

### Authentication
En `src/middleware/auth.js`:
- `authenticateToken()` - Valida JWT
- `authorizeAdmin()` - Solo admin
- `authorizeOperator()` - Admin u operador

### Validación
En `src/middleware/validation.js`:
- Usar esquemas Joi
- Crear middleware con `validateRequest(schema)`

### Escaneos
En `src/services/ScanService.js`:
- `validateAndProcessScan()` - Validar e insertar escaneo
- Detecta duplicados automáticamente
- Valida que estudiante existe

### Códigos QR
En `src/services/QRService.js`:
- `generateQRForStudent()` - Generar QR individual
- `generateBatchQRCodes()` - Generar múltiples
- Usa librería `qrcode`

## Extensiones Futuras

### Mejoras Planeadas
1. **Autenticación Social** - Google, Microsoft
2. **Reports Avanzados** - Excel, PDF descargables
3. **Webhook Events** - Notificaciones a sistemas externos
4. **Rate Limiting** - Implementar con redis
5. **Caching** - Redis para estadísticas
6. **Tests Unitarios** - Jest
7. **Swagger/OpenAPI** - Documentación automática
8. **Docker** - Containerización

### Optimizaciones Posibles
- Agregar índices adicionales en BD
- Implementar paging más eficiente
- Usar prepared statements universalmente

## Testing Manual

### Curl Examples
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@scanqueue.local","password":"admin123"}'

# Registrar escaneo
curl -X POST http://localhost:5000/api/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id": 1}'
```

### WebSocket Testing
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Conectado');
  socket.emit('scan:new', { studentId: 1 });
});

socket.on('queue:update', (data) => {
  console.log('Queue actualizada:', data);
});
```

## Problemas Conocidos y Soluciones

### Pool de conexiones agotada
- Aumentar `max` en configuración de pool
- Verificar que se liberan conexiones correctamente

### JWT expirado
- Regenerar token con nuevo login
- Aumentar `JWT_EXPIRATION` si es necesario

### QR no generado
- Ejecutar `npm run db:seed`
- O hacer POST a `/api/qr/generate`

## Logs y Debugging

### Niveles de Log
- `INFO` - Información general
- `WARN` - Advertencias
- `ERROR` - Errores

### Habilitar debugging
```bash
DEBUG=scanqueue:* npm run dev
```

## Dependencias Críticas

- `express` - Framework web
- `pg` - Driver PostgreSQL
- `jsonwebtoken` - JWT
- `bcryptjs` - Hash de contraseñas
- `qrcode` - Generación de QR
- `joi` - Validación
- `socket.io` - WebSocket en tiempo real

## Performance

### Queries Optimizadas
- Se usan índices en campos frecuentes
- Usar LIMIT/OFFSET para paginación
- Usar JOINs eficientes

### Caché Recomendado (Redis)
- Estadísticas diarias
- Lista de estudiantes (invalidar al crear/editar)
- Códigos QR validados recientemente

## Seguridad

### Verificaciones Actuales
- ✓ CORS configurado
- ✓ Contraseñas hasheadas
- ✓ JWT expiración
- ✓ Sanitización básica

### Mejoras de Seguridad
- [ ] Implementar rate limiting con Redis
- [ ] Usar HTTPS en producción
- [ ] Headers de seguridad (helmet)
- [ ] CSRF protection
- [ ] Input sanitization adicional

## Deploy

### Variables de Producción
```
NODE_ENV=production
JWT_SECRET=(generar con: openssl rand -base64 32)
DB_PASSWORD=(usar contraseña fuerte)
CORS_ORIGIN=(dominio frontend real)
```

### Checklist Pre-Deploy
- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Tested todos los endpoints
- [ ] Logs configurados
- [ ] Backups de BD
- [ ] SSL/HTTPS habilitado
- [ ] Rate limiting activo

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026
