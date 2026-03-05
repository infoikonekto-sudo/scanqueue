# 🏗️ ARQUITECTURA DE SCANQUEUE BACKEND

## Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Frontend)                       │
│              (React, Vue, Angular, etc.)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  HTTP/WebSocket  │
                    │    (Port 5000)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
   ┌─────────┐                              ┌──────────┐
   │  REST   │                              │ Socket.io│
   │   API   │                              │ (Real-   │
   │(HTTP)   │                              │  time)   │
   └────┬────┘                              └────┬─────┘
        │                                        │
        └────────────────────┬───────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │       Express Server                    │
        │    (src/server.js)                      │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │         Router Layer                    │
        │  (src/routes/*.js)                      │
        │  ├─ auth.js                             │
        │  ├─ students.js                         │
        │  ├─ scans.js ⭐                          │
        │  ├─ routes.js                           │
        │  ├─ qr.js                               │
        │  └─ dashboard.js                        │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │      Middleware Layer                   │
        │  (src/middleware/*.js)                  │
        │  ├─ auth.js (JWT validation)            │
        │  ├─ validation.js (Input validation)    │
        │  └─ errorHandler.js (Error handling)    │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │     Controller Layer                    │
        │  (src/controllers/*.js)                 │
        │  ├─ AuthController                      │
        │  ├─ StudentController                   │
        │  ├─ ScanController ⭐                    │
        │  ├─ RouteController                     │
        │  ├─ QRController                        │
        │  └─ DashboardController                 │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │      Service Layer (Business Logic)     │
        │  (src/services/*.js)                    │
        │  ├─ QRService                           │
        │  ├─ ScanService ⭐                       │
        │  └─ ReportService                       │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │       Model Layer (Data Layer)          │
        │  (src/models/*.js)                      │
        │  ├─ User.js                             │
        │  ├─ Student.js                          │
        │  ├─ Scan.js ⭐                           │
        │  ├─ Route.js                            │
        │  └─ QRCode.js                           │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │    Database Connection Pool             │
        │   (src/config/database.js)              │
        │  PostgreSQL Native Driver (pg)          │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │      PostgreSQL Database                │
        │  (database/schema.sql)                  │
        │  ├─ users table                         │
        │  ├─ students table                      │
        │  ├─ scans table ⭐                       │
        │  ├─ transport_routes table              │
        │  └─ qr_codes table                      │
        └─────────────────────────────────────────┘
```

---

## Flujo de una Solicitud HTTP

```
Cliente                           ScanQueue API                    Base de Datos
  │                                  │                                 │
  │ 1. POST /api/scan               │                                │
  │     (con barcode)               │                                │
  ├--────────────────────────────→  │                                │
  │                                  │ 2. Procesar Request           │
  │                                  ├─┐                             │
  │                                  │ │ Validar Token (JWT)         │
  │                                  │ │ Validar Entrada (Joi)       │
  │                                  │ │ Autorizar (Role check)      │
  │                                  │ │ Procesar lógica             │
  │                                  │ │ Generar respuesta           │
  │                                  │ │ 3. Query a BD               │
  │                                  │─┘ ──────────────────────────→ │
  │                                  │                               │
  │                                  │ 4. Resultado BD ←─────────────┤
  │                                  │                               │
  │                                  │ 5. Transformar datos          │
  │                                  │ 6. Emitir WebSocket event     │
  │                                  │    (broadcast a clientes)     │
  │                                  │                               │
  │ 7. Respuesta JSON               │                               │
  │ (201 Created) ←──────────────────┤                               │
  │                                  │                               │
  │ 8. Actualizar UI                │ 9. Evento WebSocket           │
  ├─────────────────→                │ "queue:update" ←──────────────┤
  │                                  │ (otros clientes)              │
```

---

## Flujo de Escaneo (Caso de Uso Crítico)

```
┌──────────────────────────────────────────────────────────┐
│         PROCESO DE ESCANEO COMPLETO ⭐                   │
└──────────────────────────────────────────────────────────┘

1. ENTRADA
   ├─ Barcode/QR Code (string)
   └─ Operador ID (JWT)
                          │
                          ▼
2. VALIDACIÓN (ScanService)
   ├─ Validar formato barcode
   ├─ Buscar código QR en BD
   ├─ Obtener datos estudiante
   └─ Verificar que estudiante existe
                          │
                          ▼
3. DETECCIÓN DE DUPLICADOS ⭐
   ├─ Buscar escaneos recientes (últimos 30 sec)
   ├─ Si encontrado → RECHAZAR
   │   ("Escaneo duplicado")
   │
   └─ Si no encontrado → CONTINUAR
                          │
                          ▼
4. CREAR ESCANEO
   ├─ INSERT en tabla scans
   ├─ Asignar timestamp
   ├─ Asignar operator_id
   └─ Estado = 'pending'
                          │
                          ▼
5. RESPUESTA
   └─ 201 Created + datos estudiante
                          │
                          ▼
6. EVENTOS WebSocket
   ├─ Emitir: scan:new
   ├─ Emitir: queue:update
   └─ Notificar clientes conectados
```

---

## Estructura de Carpetas Detallada

```
src/
│
├── config/
│   ├── index.js          (Lee variables .env)
│   └── database.js       (Pool conexiones)
│
├── routes/               (Mapeo URLs → Controllers)
│   ├── auth.js
│   ├── students.js
│   ├── scans.js
│   ├── routes.js
│   ├── qr.js
│   └── dashboard.js
│
├── controllers/          (Procesa requests)
│   ├── AuthController.js
│   ├── StudentController.js
│   ├── ScanController.js  ⭐
│   ├── RouteController.js
│   ├── QRController.js
│   └── DashboardController.js
│
├── services/             (Lógica de negocio)
│   ├── QRService.js
│   ├── ScanService.js    ⭐
│   └── ReportService.js
│
├── models/               (Queries SQL)
│   ├── User.js
│   ├── Student.js
│   ├── Scan.js          ⭐
│   ├── Route.js
│   └── QRCode.js
│
├── middleware/           (Procesa requests)
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
│
├── utils/                (Helpers reutilizables)
│   ├── helpers.js
│   └── index.js
│
└── server.js             (Entrada principal)
```

---

## Ciclo de Vida de una Solicitud

```
REQUEST
  │
  └─→ Express Server (server.js)
       │
       └─→ CORS Middleware
            │
            └─→ Body Parser (JSON)
                 │
                 └─→ Router Matching
                      │
                      └─→ Route Handler (ex: POST /api/scan)
                           │
                           └─→ Middleware Stack
                                ├─ authenticateToken
                                ├─ authorizeOperator
                                ├─ validateRequest
                                └─ Request Handler
                                     │
                                     └─→ Controller
                                          │
                                          └─→ Service Layer
                                               │
                                               └─→ Model (Database)
                                                    │
                                                    ▼
                                                PostgreSQL
                                                    │
                                    ◄───────────────┘
                                     │
                                    Response Data
                                     │
                                     ├─→ Transform (Controller)
                                     ├─→ Format (JSON)
                                     └─→ Send Response
                                          │
                                          ▼
                                       CLIENT
                                    (200, 201, 4xx, 5xx)
```

---

## Flujo de Autenticación

```
┌────────────────────────────────────────────────┐
│     AUTENTICACIÓN CON JWT                      │
└────────────────────────────────────────────────┘

1. LOGIN
   Cliente: POST /api/auth/login
            {email, password}
                    │
                    ▼
   Controller: Validar email existe
              Comparar password (bcrypt)
                    │
                    ▼
   Generar JWT con payload:
   {id, email, role, exp: ahora + 24h}
                    │
                    ▼
   Response: {token, user}

2. REQUESTS POSTERIORES
   Cliente: GET /api/students
            Header: Authorization: Bearer {token}
                    │
                    ▼
   Middleware (authenticateToken):
   Extraer token del header
   Verificar firma JWT
   Decodificar payload
   Guardar en req.user
                    │
                    ▼
   Middleware (authorizeOperator):
   Verificar req.user.role
   Si role válido: continuar
   Si no: 403 Forbidden
                    │
                    ▼
   Controller: Procesar request
   (req.user.id ya disponible)
```

---

## Flujo de Generación de Códigos QR

```
┌────────────────────────────────────────────────────┐
│     GENERACIÓN DE CÓDIGO QR                        │
└────────────────────────────────────────────────────┘

Cliente: POST /api/students
         {name, grade, ...}
                    │
                    ▼
Controller: Crear estudiante
            Generar unique_code
            Guardar en BD
                    │
                    ▼
(Background) QRService.generateQRForStudent:
             ├─ Crear JSON con datos
             │  {id, name, grade, unique_code}
             │
             ├─ Generar imagen QR (qrcode lib)
             │  └─ Convertir a base64 (dataUrl)
             │
             ├─ Generar barcode único
             │  └─ unique_code + random hash
             │
             └─ Guardar en qr_codes table
                {studentId, qr_data, barcode, dataUrl}
                    │
                    ▼
Cuando se escanea:
Cliente escanea barcode → Lee código → Envia al endpoint
QRCodeModel.getQRCodeByBarcode(barcode)
└─ Encuentra estudiante por barcode
```

---

## Patrones de Diseño Utilizados

```
┌────────────────────────────────────────────────────┐
│       PATRONES DE ARQUITECTURA                     │
└────────────────────────────────────────────────────┘

1. MVC (Model-View-Controller)
   Model  → Database Access (models/)
   View   → JSON Response (controllers/)
   Control→ Request Processing (routes/)

2. Service Layer Pattern
   Controllers → Services → Models
   (Separa lógica de negocio)

3. Middleware Pattern
   Request → Auth → Validation → Error Handling → Response

4. Repository Pattern
   Database queries centralizadas en models/

5. Observer Pattern
   WebSocket events notifican a múltiples clientes

6. Dependency Injection
   Inyectar pool de conexiones, no crear en función
```

---

## Niveles de Seguridad en Capas

```
┌────────────────────────────────────────────────────┐
│          NIVELES DE SEGURIDAD                      │
└────────────────────────────────────────────────────┘

1. ENTRADA (Frontend)
   ├─ CORS validation
   └─ Request origin check

2. AUTENTICACIÓN
   ├─ JWT token validation
   └─ Token expiration check

3. AUTORIZACIÓN
   ├─ Role checking (admin/operator)
   └─ Permission validation

4. VALIDACIÓN
   ├─ Input validation (Joi schemas)
   ├─ Type checking
   └─ Format checking

5. SALIDA (Database)
   ├─ Parameterized queries (no SQL injection)
   ├─ Hash de contraseñas (bcrypt)
   └─ Foreign key constraints

6. NETWORKING
   ├─ CORS headers
   ├─ Security headers (si nginx)
   └─ HTTPS en producción

7. ERROR HANDLING
   ├─ No expone stack traces
   ├─ Logging de errores
   └─ Generic messages al cliente
```

---

## Escalabilidad Futura

```
┌────────────────────────────────────────────────────┐
│        ARQUITECTURA ESCALABLE FUTURA               │
└────────────────────────────────────────────────────┘

ACTUAL (Monolítica):
  [Express Server]
       ↓
  [Database]

FUTURA (Escalada):
  
  [Load Balancer]
         ↓
    ┌────┴────┐
    ▼         ▼
  [API 1]   [API 2]   [API N]
    │         │         │
    └────┬────┴────┬────┘
         ▼         ▼
    [Redis Cache] [PostgreSQL]
         ▼
    [Message Queue] (para background jobs)
         ▼
    [Workers]

O con Microservicios:
  [API Gateway]
       ↓
    ┌──┬──┬──┐
    ▼  ▼  ▼
   [Auth] [Students] [Scans]
    │      │         │
    └──┬───┴─────┬───┘
       ▼         ▼
   [Cache]   [Database]
```

---

## Tabla de Relaciones (ER Diagram)

```
┌──────────────┐
│   USERS      │◄─────────────┐
├──────────────┤              │
│ id (PK)      │              │ 1:N
│ email        │              │
│ password     │              │
│ role         │              │
│ active       │              │
└──────────────┘              │
                              │
                         ┌────┴──────────┐
                         │                │
                    ┌────▼────────────┐  │
                    │    SCANS        │◄─┘
                    ├─────────────────┤
                    │ id (PK)         │
                    │ student_id (FK) │◄─────────────┐
                    │ operator_id(FK) │              │
                    │ timestamp       │        1:N   │
                    │ status          │              │
                    └─────────────────┘              │
                                         ┌───────────┴─────────────┐
                                         │                         │
                                    ┌────▼──────────┐      ┌──────▼───────────┐
                                    │  STUDENTS     │      │  TRANSPORT_ROUTES │
                                    ├───────────────┤      ├──────────────────┤
                                    │ id (PK)       │      │ id (PK)          │
                                    │ name          │      │ name             │
                                    │ grade         │1:N   │ capacity         │
                                    │ photo_url     │◄─────┤ description      │
                                    │ route_id (FK) │      │ active           │
                                    │ unique_code   │      └──────────────────┘
                                    └────┬──────────┘
                                         │
                                         │ 1:1
                                         │
                                    ┌────▼──────────┐
                                    │  QR_CODES     │
                                    ├───────────────┤
                                    │ id (PK)       │
                                    │ student_id(FK)│
                                    │ qr_data(JSON) │
                                    │ barcode       │
                                    │ data_url      │
                                    └───────────────┘
```

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026
