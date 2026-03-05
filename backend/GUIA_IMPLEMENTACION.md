# 🎯 GUÍA DE IMPLEMENTACIÓN: VALIDADOR DE CÓDIGOS QR/BARRAS

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Instalación de Dependencias ✅

```bash
cd backend

# Verificar que están instaladas:
npm list qrcode        # Para generar QR
npm list pg           # Base de datos
npm list express      # Framework HTTP
npm list socket.io    # Comunicación en tiempo real
```

**Required packages (ya presentes):**
- ✅ `qrcode@^1.5.3` - Generación de QR
- ✅ `pg@^8.11.3` - PostgreSQL
- ✅ `express@^4.18.2` - HTTP server
- ✅ `socket.io@^4.7.2` - WebSocket

**Optional (para barcode mejorado):**
```bash
# Si deseas generar barcodes reales, instalar:
npm install bwip-js@^11.1.4
```

---

### Fase 2: Archivos Creados ✅

Nuevos archivos en el sistema:

```
backend/src/services/
├─ ValidationService.js       ✅ Validador principal
├─ DuplicateCache.js          ✅ Caché de duplicados
├─ AuditLogger.js             ✅ Logger de auditoría
├─ CodeGeneratorService.js    ✅ Generador QR/barcode
└─ ValidationService.test.js  ✅ Tests unitarios

backend/
└─ VALIDADOR_TECNICO.md       ✅ Documentación técnica
```

**Archivos Modificados:**

```
backend/src/
├─ index.js                   ✏️ Agregadas exportaciones
├─ controllers/ScanController.js  ✏️ Nuevos endpoints
├─ routes/scans.js            ✏️ Nuevas rutas
└─ utils/helpers.js           ✏️ Levenshtein distance
```

---

### Fase 3: Configuración de Base de Datos

#### Crear Tabla de Logs (Opcional pero Recomendado)

```sql
-- Tabla para almacenar logs de validación
CREATE TABLE IF NOT EXISTS validation_logs (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  status VARCHAR(50),          -- 'success', 'warning', 'error'
  error VARCHAR(100),          -- Código de error
  message TEXT,                -- Mensaje descriptivo
  confidence INT,              -- 0-100
  is_duplicate BOOLEAN DEFAULT FALSE,
  processing_time INT,         -- ms
  operator_id INT REFERENCES users(id),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda rápida
CREATE INDEX idx_validation_logs_student_id ON validation_logs(student_id);
CREATE INDEX idx_validation_logs_created_at ON validation_logs(created_at);
CREATE INDEX idx_validation_logs_is_duplicate ON validation_logs(is_duplicate);
CREATE INDEX idx_validation_logs_status ON validation_logs(status);
```

**Ejecutar en la BD:**
```bash
psql -U postgres -d scanqueue_db -f backend/database/schema.sql
```

---

### Fase 4: Variables de Entorno

Verificar `.env` con estas configuraciones:

```env
# Validación
DUPLICATE_SCAN_TIMEOUT=30           # Segundos
MAX_SCANS_PER_SECOND=10            # Rate limiting

# QR
QR_SIZE=200                        # Píxeles
QR_ERROR_CORRECTION=H              # Level H = 30%

# Server
PORT=5000
NODE_ENV=development
```

---

### Fase 5: Tests Unitarios

#### Ejecutar Tests

```bash
cd backend
node src/services/ValidationService.test.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     SUITE DE TESTS - VALIDADOR DE CÓDIGOS QR/BARRAS     ║
╚════════════════════════════════════════════════════════╝

=== TEST 1: Detección de Tipo ===
✅ Barcode numérico: barcode
✅ QR JSON: qr
...

📊 Tests Pasados: 7
❌ Tests Fallidos: 0
```

---

### Fase 6: Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

**Expected Output:**
```
[ISO_TIME] Backend escaneado en puerto 5000
[ISO_TIME] Conectado a PostgreSQL
[ISO_TIME] Validador de códigos activo
```

---

## 🧪 TESTING MANUAL

### Test 1: Validar un QR

```bash
curl -X POST http://localhost:5000/api/scan/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "{\"studentId\":1,\"name\":\"Juan\",\"grade\":\"1A\"}",
    "type": "qr"
  }'
```

**Response (Exitoso):**
```json
{
  "success": true,
  "status": "success",
  "studentId": 1,
  "name": "Juan Pérez",
  "grade": "1A",
  "confidence": 100,
  "message": "✅ Juan Pérez del 1A",
  "processingTime": 45
}
```

---

### Test 2: Intentar Duplicado

1. Ejecuta el curl anterior dos veces en < 30 segundos
2. Segunda respuesta debe tener: `"error": "DUPLICATE_SCAN"`

```json
{
  "success": false,
  "error": "DUPLICATE_SCAN",
  "message": "Código escaneado hace 5 segundos",
  "lastScan": "2026-03-03T14:25:15Z",
  "suggestion": "¿Deseas proceder de todas formas?"
}
```

---

### Test 3: Código Inválido

```bash
curl -X POST http://localhost:5000/api/scan/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ESTUDIANTE_NO_EXISTE",
    "type": "barcode"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "INVALID_CODE",
  "message": "Estudiante con ID ESTUDIANTE_NO_EXISTE no encontrado",
  "suggestion": "Intenta nuevamente o ingresa el ID manualmente"
}
```

---

### Test 4: Obtener Estadísticas

```bash
curl http://localhost:5000/api/scan/stats/validation \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "validation": {
      "cachedScans": 23,
      "cacheMaxSize": 100,
      "retentionMs": 60000
    },
    "audit": {
      "total_validations": 234,
      "successful": 210,
      "errors": 15,
      "duplicates": 9,
      "avg_processing_time": 45
    }
  }
}
```

---

### Test 5: Obtener Logs de Duplicados

```bash
curl "http://localhost:5000/api/scan/logs/audit?type=duplicates&startDate=2026-03-01&endDate=2026-03-03" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🖼️ GENERAR CÓDIGOS QR

### Opción 1: Mediante BD Existente

```bash
curl -X POST http://localhost:5000/api/qr/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1}'
```

### Opción 2: Generar Batch

```bash
curl -X POST http://localhost:5000/api/qr/batch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": [1, 2, 3, 4, 5]
  }'
```

---

## 📊 MONITOREAR RENDIMIENTO

### Logs en Tiempo Real

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Monitor
tail -f logs/validation-*.json | jq .

# Terminal 3: Tests de Carga
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/scan/validate \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"code\": \"STU$(($RANDOM % 100))\", \"type\": \"barcode\"}"
done
```

### Métricas Clave

```bash
# Nombre de escaneos hoy
curl http://localhost:5000/api/scan/logs/summary \
  -H "Authorization: Bearer TOKEN" | jq '.data.lastHour'

# Promedio de tiempo de procesamiento
curl http://localhost:5000/api/scan/stats/validation \
  -H "Authorization: Bearer TOKEN" | jq '.data.audit.avg_processing_time'

# Tasa de error
curl http://localhost:5000/api/scan/stats/validation \
  -H "Authorization: Bearer TOKEN" | jq '.data.audit.errors'
```

---

## 🚀 DESPLIEGUE EN PRODUCCIÓN

### Pre-deployment

```bash
# 1. Tests
npm test

# 2. Linting
npx eslint src/services/ValidationService.js

# 3. Build
npm run build

# 4. Verificar BD
psql -U postgres -d scanqueue_db -c "SELECT COUNT(*) FROM validation_logs;"
```

### Deploy en Docker

```dockerfile
# Dockerfile (ya existe)
# Asegúrate que incluya las variables de entorno correctas
ENV DUPLICATE_SCAN_TIMEOUT=30
ENV QR_ERROR_CORRECTION=H
```

```bash
docker-compose up -d
```

---

## 📝 LOGS Y DEBUGGING

### Ubicación de Logs

```
backend/logs/
├─ validation-2026-03-03.json
├─ validation-2026-03-04.json
└─ validation-2026-03-05.json
```

### Ver Logs Recientes

```bash
# Últimos 50 escaneos
tail -n 50 backend/logs/validation-*.json | jq '.[] | select(.status == "error")'

# Solo duplicados
jq '.[] | select(.isDuplicate == true)' backend/logs/validation-2026-03-03.json

# Estadísticas rápidas
jq 'group_by(.status) | map({status: .[0].status, count: length})' \
  backend/logs/validation-2026-03-03.json
```

---

## 🔍 TROUBLESHOOTING

### Problema: "Validación excedió 500ms"

**Causa:** BD lenta

**Soluciones:**
1. Agregar índices: `CREATE INDEX idx_students_id ...`
2. Aumentar pool size: `max: 20` en `database.js`
3. Usar Redis para caché

### Problema: "Memoria aumentando constantemente"

**Causa:** Logs no se limpian

**Soluciones:**
1. Implementar rotación de logs (500MB)
2. Exportar a CSV/BD periódicamente
3. Limitar buffer en memoria a 1000

### Problema: "Muchos duplicados falsos"

**Causa:** Timeout de duplicados muy bajo

**Soluciones:**
1. Aumentar `DUPLICATE_SCAN_TIMEOUT` a 45s
2. Revisar caché: `cache.size()` debe < 100
3. Ver logs para patrones

---

## ✨ FEATURES FUTUROS

- [ ] Integración con Redis para caché distribuida
- [ ] Reconocimiento OCR para códigos dañados
- [ ] API de corrección manual de errores
- [ ] Dashboard de estadísticas en tiempo real
- [ ] Alertas cuando supera umbral de errores
- [ ] Machine Learning para predicción de errores
- [ ] Soporte para códigos Data Matrix
- [ ] Integración Twilio para notificaciones

---

## 📞 SOPORTE

**Dudas o problemas?**

1. Revisar [VALIDADOR_TECNICO.md](./VALIDADOR_TECNICO.md)
2. Ejecutar tests: `node src/services/ValidationService.test.js`
3. Ver logs: `tail -f logs/validation-*.json`
4. Contactar: devops@scanqueue.local

---

**Última actualización:** 3 de marzo de 2026
**Versión:** 1.0.0
**Status:** ✅ Ready for Production
