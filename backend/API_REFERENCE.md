# Referencia Rápida de API - ScanQueue

## Base URL
```
http://localhost:5000/api
https://tu-dominio.com/api (Producción)
```

## Autenticación
Todos los endpoints requieren header:
```
Authorization: Bearer {token}
```

Obtener token:
```
POST /auth/login
```

## Estudiantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/students` | Listar estudiantes |
| POST | `/students` | Crear estudiante |
| GET | `/students/:id` | Obtener estudiante |
| PUT | `/students/:id` | Actualizar estudiante |
| DELETE | `/students/:id` | Eliminar estudiante |
| GET | `/students/grade/:grade` | Estudiantes por grado |
| GET | `/students/search/:query` | Buscar estudiantes |

## Escaneos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/scan` | Registrar escaneo |
| GET | `/scan/queue` | Cola de escaneos |
| GET | `/scan/history` | Historial |
| POST | `/scan/validate` | Validar código |
| PUT | `/scan/:id/status` | Actualizar estado |
| PUT | `/scan/:id/mark-transport` | Marcar como transporte |
| DELETE | `/scan/:id` | Eliminar escaneo |

## Rutas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/routes` | Listar rutas |
| POST | `/routes` | Crear ruta |
| GET | `/routes/:id` | Obtener ruta |
| PUT | `/routes/:id` | Actualizar ruta |
| DELETE | `/routes/:id` | Eliminar ruta |
| GET | `/routes/:id/students` | Estudiantes de ruta |
| GET | `/routes/:id/scans` | Escaneos de ruta |

## Códigos QR

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/qr/generate` | Generar QR individual |
| POST | `/qr/batch` | Generar múltiples QR |
| GET | `/qr/:studentId` | Obtener QR |

## Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Estadísticas |
| GET | `/dashboard/today` | Resumen del día |
| GET | `/dashboard/attendance` | Reporte asistencia |

## Ejemplos de Request

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "operator@scanqueue.local",
  "password": "admin123"
}
```

### Crear Estudiante
```http
POST /api/students
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Juan Pérez",
  "grade": "1° Básico",
  "parent_email": "parent@email.com",
  "transport_route_id": 1
}
```

### Registrar Escaneo
```http
POST /api/scan
Authorization: Bearer {token}
Content-Type: application/json

{
  "student_id": 1
}
```

O con código QR:
```json
{
  "barcode": "STU001-a1b2c3d4"
}
```

### Generar Códigos QR
```http
POST /api/qr/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentIds": [1, 2, 3, 4, 5]
}
```

## Estructura de Respuesta

### Exitosa
```json
{
  "success": true,
  "message": "Operación completada",
  "data": { /* datos */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": ["Error 1", "Error 2"]
}
```

## Status HTTP

- `200` - OK
- `201` - Creado
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## Limits

- Máximo 10 escaneos por segundo
- Detecta duplicados en 30 segundos
- Máximo 10MB por request
- Máximo 100 registros por página

## WebSocket Eventos

### Cliente escucha
```javascript
socket.on('queue:update', (data) => { });
socket.on('stats:update', (data) => { });
```

### Cliente emite
```javascript
socket.emit('scan:new', { studentId: 1 });
socket.emit('student:marked', { scanId: 1 });
```

---

**Guía Rápida v1.0.0** | 3 de marzo de 2026
