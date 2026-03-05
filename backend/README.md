# ScanQueue Backend API

**Sistema inteligente de llamado escolar con escaneo de código QR**

## 📋 Descripción

Backend completo en Node.js + Express + PostgreSQL para gestionar estudiantes, escaneos de códigos QR, rutas de transporte y reportes de asistencia en tiempo real.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Generación de códigos QR
- ✅ Validación inteligente de escaneos (detecta duplicados)
- ✅ Cola de escaneos en tiempo real con WebSocket
- ✅ Gestión de rutas de transporte
- ✅ Panel de estadísticas vivas
- ✅ Reportes de asistencia
- ✅ API RESTful completa
- ✅ Manejo de errores robusto
- ✅ CORS configurado

## 📦 Requisitos

- Node.js >= 16.0.0
- PostgreSQL >= 12
- npm o yarn

## 🔧 Instalación

### 1. Clonar repositorio
```bash
git clone <repo-url>
cd scanqueue/backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scanqueue_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

PORT=5000
JWT_SECRET=tu_clave_secreta_cambiar_en_produccion
```

### 4. Crear base de datos PostgreSQL
```bash
createdb scanqueue_db
```

### 5. Inicializar esquema de base de datos
```bash
npm run db:init
```

### 6. Cargar datos de ejemplo
```bash
npm run db:seed
```

## 🏃 Ejecución

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor iniciará en `http://localhost:5000`

## 📚 Documentación de Endpoints

### Autenticación

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "operator@scanqueue.local",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "operator@scanqueue.local",
    "name": "Operador Principal",
    "role": "operator"
  }
}
```

#### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "nuevo.operador@scanqueue.local",
  "password": "contraseña123",
  "name": "Nuevo Operador"
}
```

### Estudiantes

#### Obtener todos los estudiantes
```http
GET /api/students?limit=50&offset=0
Authorization: Bearer {token}
```

#### Crear estudiante
```http
POST /api/students
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Juan Pérez",
  "grade": "1° Básico",
  "parent_email": "juan.parent@email.com",
  "parent_phone": "+56912345678",
  "transport_route_id": 1
}
```

#### Obtener estudiante
```http
GET /api/students/:id
Authorization: Bearer {token}
```

#### Actualizar estudiante
```http
PUT /api/students/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Juan Pérez García",
  "grade": "2° Básico"
}
```

#### Eliminar estudiante
```http
DELETE /api/students/:id
Authorization: Bearer {token}
```

#### Buscar estudiantes
```http
GET /api/students/search/:query
Authorization: Bearer {token}
```

### Escaneos

#### Registrar escaneo (CRÍTICO)
```http
POST /api/scan
Content-Type: application/json
Authorization: Bearer {token}

{
  "barcode": "STU001-a1b2c3d4"
}
```

O con ID directo:
```json
{
  "student_id": 1
}
```

#### Obtener cola de escaneos
```http
GET /api/scan/queue
Authorization: Bearer {token}
```

#### Obtener historial de escaneos
```http
GET /api/scan/history?startDate=2026-03-01&endDate=2026-03-03
Authorization: Bearer {token}
```

#### Validar código QR
```http
POST /api/scan/validate
Content-Type: application/json
Authorization: Bearer {token}

{
  "barcode": "STU001-a1b2c3d4"
}
```

#### Actualizar estado de escaneo
```http
PUT /api/scan/:id/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "completed",
  "notes": "Estudiante presente"
}
```

#### Marcar como transporte
```http
PUT /api/scan/:id/mark-transport
Authorization: Bearer {token}
```

### Rutas de Transporte

#### Obtener todas las rutas
```http
GET /api/routes
Authorization: Bearer {token}
```

#### Crear ruta
```http
POST /api/routes
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Ruta A - Zona Norte",
  "capacity": 45,
  "description": "Transporte zona norte"
}
```

#### Obtener estudiantes de ruta
```http
GET /api/routes/:id/students
Authorization: Bearer {token}
```

#### Obtener escaneos de ruta
```http
GET /api/routes/:id/scans
Authorization: Bearer {token}
```

### Códigos QR

#### Generar QR
```http
POST /api/qr/generate
Content-Type: application/json
Authorization: Bearer {token}

{
  "studentId": 1
}
```

#### Generar QRs en lote
```http
POST /api/qr/batch
Content-Type: application/json
Authorization: Bearer {token}

{
  "studentIds": [1, 2, 3, 4, 5]
}
```

#### Obtener QR de estudiante
```http
GET /api/qr/:studentId
Authorization: Bearer {token}
```

### Panel de Control

#### Obtener estadísticas
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalScans": 45,
    "pendingScans": 5,
    "completedScans": 40,
    "transportScans": 30,
    "attendanceRate": "95.50",
    "totalStudents": 47
  }
}
```

#### Obtener resumen del día
```http
GET /api/dashboard/today
Authorization: Bearer {token}
```

#### Obtener reporte de asistencia
```http
GET /api/dashboard/attendance
Authorization: Bearer {token}
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT con expiración configurable
- CORS habilitado
- Validación de inputs con Joi
- Rate limiting en escaneos (máx 10/segundo)
- Detección automática de escaneos duplicados (30 segundos)
- Sanitización de inputs
- Variables sensibles en `.env`

## 🗄️ Modelo de Datos

### Users
- `id` (Serial PK)
- `email` (Varchar, Unique)
- `password` (Hash bcrypt)
- `name` (Varchar)
- `role` (admin, operator)
- `active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Students
- `id` (Serial PK)
- `name` (Varchar)
- `grade` (Varchar)
- `photo_url` (Varchar)
- `transport_route_id` (FK)
- `parent_email`, `parent_phone` (Varchar)
- `unique_code` (Varchar, Unique)
- `active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Scans
- `id` (Serial PK)
- `student_id` (FK)
- `operator_id` (FK)
- `status` (pending, completed, transport)
- `transport_marked` (Boolean)
- `timestamp` (Timestamp)
- `notes` (Text)

### Transport Routes
- `id` (Serial PK)
- `name` (Varchar)
- `capacity` (Integer)
- `description` (Text)
- `active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### QR Codes
- `id` (Serial PK)
- `student_id` (FK, Unique)
- `qr_data` (JSONB)
- `barcode` (Varchar, Unique)
- `data_url` (Text)
- `created_at`, `updated_at` (Timestamps)

## 🧪 WebSocket Eventos

### Servidor escucha:
- `scan:new` - Nuevo escaneo
- `student:marked` - Estudiante marcado
- `queue:get` - Obtener cola

### Servidor emite:
- `queue:update` - Actualización de cola
- `stats:update` - Actualización de estadísticas
- `student:marked` - Respuesta de marcado

## 💻 Estructura de Carpetas

```
backend/
├── src/
│   ├── config/           # Configuración y BD
│   ├── controllers/      # Lógica de endpoints
│   ├── middleware/       # Auth, validación, errores
│   ├── models/           # Queries a BD
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Helpers
│   └── server.js         # Entrada principal
├── database/
│   ├── schema.sql        # Esquema de BD
│   ├── seeds.sql         # Datos de ejemplo
│   ├── init.js           # Script inicialización
│   └── seed.js           # Script seeds
├── package.json
├── .env.example
└── README.md
```

## 🔍 Logs y Debugging

Los logs se imprimen en consola con timestamp:
```
[2026-03-03T10:30:45.123Z] POST /api/scan
[2026-03-03T10:30:45.456Z] INFO Escaneo procesado
```

## 🐛 Solución de Problemas

### "Error: connect ECONNREFUSED"
- Verificar que PostgreSQL está ejecutándose
- Verificar credenciales en `.env`

### "Error: JWT secret not defined"
- Configurar `JWT_SECRET` en `.env`

### "Error: Código QR no encontrado"
- Generar códigos QR con `POST /api/qr/generate`
- O ejecutar `npm run db:seed` para generar en lote

## 📞 Contacto y Soporte

Para reportar problemas o sugerencias, crear un issue en el repositorio.

## 📄 Licencia

MIT

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026
