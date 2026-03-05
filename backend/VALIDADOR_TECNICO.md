# DOCUMENTACIÓN TÉCNICA: AGENTE VALIDADOR DE CÓDIGOS QR/BARRAS

## 📋 ÍNDICE
1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Componentes](#componentes)
4. [Flujo de Validación](#flujo-de-validación)
5. [API Endpoints](#api-endpoints)
6. [Manejo de Errores](#manejo-de-errores)
7. [Rendimiento](#rendimiento)
8. [Tests](#tests)
9. [FAQ](#faq)

---

## 📝 Descripción General

El **Agente Validador** es un sistema inteligente de validación de códigos QR/barras diseñado para:
- ✅ Validar 200+ escaneos simultáneos
- ✅ Procesar en < 500ms por código
- ✅ Detectar y corregir errores automáticamente
- ✅ Identificar duplicados en tiempo real
- ✅ Registrar auditoría completa
- ✅ Generar códigos de alta resolución

---

## 🏗️ ARQUITECTURA

```
CLIENTE (Backend)
       ↓
   POST /api/scan
       ↓
ScanController.recordScan()
       ↓
ValidationService.validateCodeWithTimeout(500ms)
       ├─ detectCodeType()
       ├─ validateFormat()
       ├─ decodeCodeData()
       ├─ findStudent() [BD Query]
       ├─ checkDuplicates() [RAM Cache]
       └─ applyErrorCorrection()
       ↓
DuplicateCache [RAM]
Auditoría [Memoria + Archivo + BD]
       ↓
RESPUESTA HTTP
```

**Componentes Clave:**
- `ValidationService.js` - Lógica principal de validación
- `DuplicateCache.js` - Caché en RAM para últimos 100 escaneos
- `AuditLogger.js` - Registro de auditoría (memoria, archivo, BD)
- `CodeGeneratorService.js` - Generación de QR y barras
- `ScanController.js` - Endpoints HTTP

---

## 🔧 COMPONENTES

### 1. ValidationService.js

#### Función Principal: `validateCode(rawCode, type, context)`

**Parámetros:**
```javascript
{
  rawCode: String,           // Código escaneado crudo
  type: 'qr' | 'barcode' | 'auto',  // Tipo de código
  context: {
    operatorId: String,      // ID del operador
    ipAddress: String,       // IP de la solicitud
    userAgent: String        // User-Agent del cliente
  }
}
```

**Retorna: Promise<ValidationResult>**
```javascript
{
  status: 'success' | 'warning' | 'error',
  studentId: Number,
  name: String,
  grade: String,
  confidence: Number (0-100),
  duplicateFlag: Boolean,
  timestamp: Date,
  message: String,
  suggestion: String,
  processingTime: Number (ms),
  error: String (si aplica)
}
```

#### Sub-funciones

**`detectCodeType(rawCode)`**
- Detecta automáticamente si es QR o barcode
- Retorna: 'qr' | 'barcode' | 'auto' | null

**`validateFormat(rawCode, type)`**
- Valida que el formato sea correcto
- QR: JSON válido con campos requeridos
- Barcode: formato numérico/alfanumérico válido
- Retorna: `{valid: Boolean, errors: [], warnings: []}`

**`decodeCodeData(rawCode, type)`**
- Extrae datos del código
- QR: parsea JSON y extrae studentId, name, grade
- Barcode: extrae ID numérico
- Retorna: `{studentId, name, grade, confidence}`

**`findStudent(studentId)`**
- Busca en BD por ID
- Si no encuentra, intenta búsqueda por unique_code
- Si aún no encuentra, intenta Levenshtein distance
- Validar que estudiante esté activo
- Retorna: `student` o lanza error

**`checkDuplicates(studentId)`**
- Consulta DuplicateCache
- Si está en últimos 30s: Retorna `{isDuplicate: true}`
- Si está entre 30-60s: Retorna `{needsReview: true}`
- Retorna: `{isDuplicate: Boolean, ...}`

**`applyErrorCorrection(decodedData, validationResult)`**
- Ajusta confidence basado en warnings
- Si hay warnings menores: confidence -= 5
- Retorna: decodedData con confidence actualizado

---

### 2. DuplicateCache.js

**Clase: `DuplicateCache(maxSize, retentionMs)`**

```javascript
const cache = new DuplicateCache(100, 60000);
```

**Métodos:**
- `add(studentId)` - Agregar escaneo al caché
- `check(studentId)` - Verificar si está duplicado
- `size()` - Tamaño actual del caché
- `cleanup()` - Eliminar escaneos expirados
- `clear()` - Limpiar todo el caché
- `getStats()` - Obtener estadísticas

**Características:**
- ✅ Almacena últimos 100 escaneos en RAM
- ✅ Auto-limpieza cada 10 segundos
- ✅ Retención de 60 segundos por defecto
- ✅ O(1) para add/check gracias al mapa Hash

---

### 3. AuditLogger.js

**Clase: `AuditLogger()`**

**Métodos:**
- `logValidation(validationResult, context)` - Registrar validación
- `getRecentValidations(limit)` - Obtener logs recientes
- `getDuplicateLogs(startDate, endDate)` - Filtrar por duplicados
- `getErrorLogs(startDate, endDate)` - Filtrar por errores
- `getLogsByOperator(operatorId, startDate, endDate)` - Por operador
- `exportToCSV(startDate, endDate)` - Exportar a CSV
- `getStats(hoursBack)` - Estadísticas resumidas
- `getQuickSummary()` - Resumen rápido (último minuto/hora)

**Almacenamiento Triple:**
1. **RAM (Buffer)**: Últimos 1000 logs en memoria
2. **Archivo**: JSON diario en `/logs/validation-YYYY-MM-DD.json`
3. **Base de Datos**: Tabla `validation_logs` (opcional)

---

### 4. CodeGeneratorService.js

**Funciones:**

#### `generateQRCode(student, options)`
- Genera QR con datos JSON
- Formato: PNG + SVG
- Resolución: 300 DPI (configurable)
- Error Correction: Nivel H (30% capacidad)

```javascript
const result = await generateQRCode(
  { id: 1, name: 'Juan', grade: '1A' },
  { size: 300, errorCorrection: 'H' }
);
// {qrData, pngUrl, svgUrl}
```

#### `generateBarcode(studentId, options)`
- Genera Code128, UPC o EAN13
- Incluye checksum automático
- Formato: PNG con datos base64

```javascript
const result = await generateBarcode('001', { type: 'code128' });
// {barcodeValue, type, pngUrl, studentId, checksum}
```

#### `generateCodeBatch(students, options)`
- Genera múltiples códigos en lote
- Agrupa por grado (opcional)
- Retorna resultado estructurado

```javascript
const batch = await generateCodeBatch(students, {
  includeQR: true,
  includeBarcode: true,
  groupByGrade: true
});
```

---

## 📊 FLUJO DE VALIDACIÓN

### Paso a Paso

```
┌─────────────────────────────────────────────────────────┐
│ 1. ENTRADA: Código QR/barcode crudo                    │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 2. DETECTAR TIPO                                        │
│    ├─ ¿JSON? → QR                                       │
│    ├─ ¿Numérico? → Barcode                             │
│    └─ ¿Otro? → Auto/Error                              │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 3. VALIDAR FORMATO                                      │
│    ├─ QR: JSON válido + campos requeridos              │
│    └─ Barcode: Alfanumérico válido                     │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 4. DESCODIFICAR DATOS                                   │
│    ├─ Extraer studentId, name, grade                   │
│    └─ Calcular confidence (90-100%)                    │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 5. BUSCAR EN BD (CRÍTICO)                               │
│    ├─ SELECT * FROM students WHERE id = ?              │
│    ├─ ¿Encontrado? → Continuar                         │
│    └─ ¿No? → Error + Sugerencia                        │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 6. VERIFICAR DUPLICADOS (RAM Cache)                     │
│    ├─ < 30s → RECHAZAR + aviso                         │
│    ├─ 30-60s → PERMITIR + review manual                │
│    └─ > 60s → PERMITIR                                 │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 7. CORRECCIONES AUTOMÁTICAS                             │
│    ├─ Confidence > 80% → Aceptar                        │
│    ├─ 50-80% → Sugerir confirmación                    │
│    └─ < 50% → Rechazar                                 │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 8. REGISTRAR AUDITORÍA                                  │
│    ├─ Log en memoria (buffer)                          │
│    ├─ Log en archivo JSON                              │
│    └─ Log en BD (si hay error/duplicado)      │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 9. RETORNO: ValidationResult                            │
│    ├─ ✅ SUCCESS: {status, studentId, name, grade}    │
│    ├─ ⚠️ WARNING: {error: DUPLICATE, suggestion}      │
│    └─ ❌ ERROR: {error: INVALID, message}             │
└──────────────────────────────────────────────────────────┘
```

---

## 🔌 API ENDPOINTS

### 1. Registrar Escaneo (Crear)

**POST /api/scan**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```javascript
{
  "code": "STU001",                    // Código QR/barcode
  "type": "auto",                      // 'qr' | 'barcode' | 'auto'
  "operatorId": "OP001"                // Opcional
}
```

**Response (Exitoso - 201):**
```javascript
{
  "success": true,
  "studentId": 1,
  "name": "Juan Pérez",
  "grade": "1A",
  "scanned": "2026-03-03T14:25:30Z",
  "isDuplicate": false,
  "confidence": 100,
  "message": "✅ Juan Pérez del 1A"
}
```

**Response (Duplicado - 400):**
```javascript
{
  "success": false,
  "error": "DUPLICATE_SCAN",
  "message": "Código escaneado hace 15 segundos",
  "lastScan": "2026-03-03T14:25:15Z",
  "suggestion": "¿Deseas proceder de todas formas?",
  "studentId": 1,
  "name": "Juan",
  "needsConfirmation": true
}
```

**Response (Error - 400):**
```javascript
{
  "success": false,
  "error": "INVALID_CODE",
  "message": "QR no reconocido en la base de datos",
  "suggestion": "Intenta nuevamente o usa entrada manual"
}
```

---

### 2. Validar Código (Sin Crear)

**POST /api/scan/validate**

Similar a anterior pero **NO crea escaneo en BD**. Útil para preview.

---

### 3. Obtener Estadísticas

**GET /api/scan/stats/validation**

**Response:**
```javascript
{
  "success": true,
  "data": {
    "validation": {
      "cachedScans": 45,
      "cacheMaxSize": 100,
      "retentionMs": 60000
    },
    "audit": {
      "total_validations": 234,
      "successful": 210,
      "errors": 15,
      "duplicates": 9,
      "avg_processing_time": 45,
      "max_processing_time": 320
    }
  }
}
```

---

### 4. Obtener Logs de Auditoría

**GET /api/scan/logs/audit?type=duplicates&startDate=2026-03-01&endDate=2026-03-03**

**Parámetros:**
- `type`: 'duplicates' | 'errors' | null (todos)
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `operatorId`: (opcional)

**Response:**
```javascript
{
  "success": true,
  "count": 45,
  "data": [
    {
      "timestamp": "2026-03-03T14:25:15Z",
      "status": "warning",
      "studentId": 1,
      "name": "Juan Pérez",
      "error": "DUPLICATE_SCAN",
      "isDuplicate": true,
      "processingTime": 45
    },
    ...
  ]
}
```

---

### 5. Resumen Rápido

**GET /api/scan/logs/summary**

**Response:**
```javascript
{
  "success": true,
  "data": {
    "lastMinute": {
      "total": 23,
      "successful": 20,
      "errors": 2,
      "duplicates": 1
    },
    "lastHour": {
      "total": 234,
      "successful": 210,
      "errors": 15,
      "duplicates": 9
    },
    "memoryUsage": {
      "logsStored": 234,
      "maxCapacity": 1000
    }
  }
}
```

---

### 6. Exportar Logs

**GET /api/scan/logs/export?startDate=2026-03-01&endDate=2026-03-03**

**Response:** CSV descargable
```csv
timestamp,studentId,status,error,isDuplicate,processingTime
2026-03-03T14:25:15Z,1,success,,false,45
2026-03-03T14:25:20Z,2,error,INVALID_CODE,false,120
...
```

---

## ⚠️ MANEJO DE ERRORES

### Códigos de Error

| Error | Causa | Solución |
|-------|-------|----------|
| `INVALID_FORMAT` | JSON malformado o formato incorrecto | Verificar código |
| `INVALID_CODE` | Estudiante no existe | Entrada manual |
| `DUPLICATE_SCAN` | Escaneado hace < 30s | Confirmar intención |
| `STUDENT_INACTIVE` | Estudiante no activo | Contactar admin |
| `NO_TYPE_DETECTED` | No se detectó tipo | Verificar código |
| `TIMEOUT` | Excedió 500ms | Reintentar |
| `SERVER_ERROR` | Error interno | Contactar soporte |

### Objeto de Error Estándar

```javascript
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Descripción legible",
  "suggestion": "Acción recomendada",
  "timestamp": "2026-03-03T14:25:30Z",
  "processingTime": 450
}
```

---

## ⚡ RENDIMIENTO

### Benchmarks Esperados

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Detección de tipo | < 5ms | En memoria |
| Validar formato | < 10ms | Regex |
| Descodificar | < 15ms | JSON.parse |
| Búsqueda en BD | < 200ms | Con índices |
| Chequeo duplicados | < 5ms | Hash map |
| Correcciones | < 10ms | Cálculos |
| **TOTAL** | **< 500ms** | Garantizado |

### Optimizaciones Implementadas

✅ Índices en BD (`students.id`, `qr_codes.student_id`)
✅ Caché en RAM para últimos 100 escaneos
✅ Timeout de 500ms máximo
✅ Operaciones asincrónicas
✅ Buffer de logs en memoria
✅ Limpieza automática de caché

---

## 🧪 TESTS

### Ejecutar Tests

```bash
node backend/src/services/ValidationService.test.js
```

### Suite de Tests

1. **testDetectCodeType()** - Detección de tipos
2. **testValidationFormat()** - Validación de formato
3. **testDuplicateCache()** - Caché de duplicados
4. **testAuditLogger()** - Logger de auditoría
5. **testLevenshteinDistance()** - Distancia de edición
6. **testValidationTimeout()** - Timeout
7. **testValidationStats()** - Estadísticas

**Cobertura:**
- ✅ Casos felices
- ✅ Casos de error
- ✅ Edge cases
- ✅ Rendimiento
- ✅ Integración

---

## ❓ FAQ

### ¿Qué pasa si el código está parcialmente dañado?

El algoritmo intenta:
1. Usar error correction code (ECC) del QR
2. Aplicar Levenshtein distance
3. Buscar estudiantes similares en BD
4. Si falla todo → Error con sugerencia manual

### ¿Cómo se calcula el "confidence"?

```
BASE: 100%
- JSON malformado: -20%
- Formato no estándar: -5%
- Búsqueda por similitud: -10%
- Resultado final: 50-100%

> 80% → Aceptar
50-80% → Sugerir confirmación
< 50% → Rechazar
```

### ¿Qué ocurre con un duplicado?

1. **< 30s**: Rechazar + advirtencia
2. **30-60s**: Permitir + marcar para review
3. **> 60s**: Permitir normalmente
4. **Log**: Siempre se registra el intento

### ¿Cómo se almacenan los logs?

**Triple almacenamiento:**
1. RAM: Últimos 1000 en memoria (vive solo en sesión)
2. Archivo: `/logs/validation-YYYY-MM-DD.json`
3. BD: Tabla `validation_logs` (si existe)

### ¿Es seguro validar en cliente?

**NO**. Siempre validar en servidor:
- ✅ Base de datos es source of truth
- ✅ Imposible falsificar desde cliente
- ✅ Logs centralizados bajo control

### ¿Puedo agregar más campos al QR?

Sí, pero actualiza:
1. `validateQRFormat()` en CodeGeneratorService
2. `decodeCodeData()` en ValidationService
3. Esquema de BD si es necesario

### ¿Cómo escalo para 500+ escaneos?

Recomendaciones:
1. Índices adicionales en BD
2. Connection pooling (pg.Pool)
3. Redis para caché distribuida
4. Load balancing (nginx)
5. Monitoreo con Prometheus

---

## 📚 REFERENCIAS ADICIONALES

- Documentación de Levenshtein Distance: https://en.wikipedia.org/wiki/Levenshtein_distance
- QR Code ECC: https://en.wikipedia.org/wiki/QR_code#Error_correction
- Code128 Checksum: https://en.wikipedia.org/wiki/Code_128

---

**Última actualización:** 3 de marzo de 2026
**Versión:** 1.0.0
**Estado:** ✅ Producción
