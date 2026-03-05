# Guía Completa de Variables de Entorno

Este archivo explica cada variable de entorno en `.env` y cómo configurarla.

## Database (Conexión PostgreSQL)

### DB_HOST
**Tipo:** String  
**Default:** `localhost`  
**Producción:** IP o dominio del servidor PostgreSQL  
**Descripción:** Host donde está alojado el servidor PostgreSQL

```env
DB_HOST=localhost           # Desarrollo local
DB_HOST=db.scanqueue.com    # Producción con dominio
DB_HOST=192.168.1.100       # Producción con IP
```

### DB_PORT
**Tipo:** Integer  
**Default:** `5432`  
**Rango válido:** 1024-65535  
**Descripción:** Puerto donde escucha PostgreSQL

```env
DB_PORT=5432         # Puerto estándar (default)
DB_PORT=5433         # Si hay conflicto
```

### DB_NAME
**Tipo:** String  
**Default:** `scanqueue_db`  
**Descripción:** Nombre de la base de datos

```env
DB_NAME=scanqueue_db              # Desarrollo
DB_NAME=scanqueue_db_production   # Producción
```

> ⚠️ **Importante:** La BD debe existir. Crear con:
> ```bash
> createdb scanqueue_db
> ```

### DB_USER
**Tipo:** String  
**Default:** `postgres`  
**Descripción:** Usuario para conectarse a PostgreSQL

```env
DB_USER=postgres              # Usuario admin (no recomendado en prod)
DB_USER=scanqueue_user        # Usuario específico (recomendado)
```

> 💡 **Buena práctica:** Crear usuario específico con permisos limitados

### DB_PASSWORD
**Tipo:** String  
**Default:** (vacío - ¡CAMBIAR!)  
**Descripción:** Contraseña del usuario PostgreSQL

```env
DB_PASSWORD=dev123                    # Desarrollo
DB_PASSWORD=super_secret_password_123 # Producción (mínimo 20 caracteres)
```

> 🔐 **Seguridad:** 
> - Mínimo 16 caracteres en producción
> - Usar caracteres especiales
> - NUNCA commits en git

---

## Server (Configuración del Servidor)

### PORT
**Tipo:** Integer  
**Default:** `5000`  
**Rango válido:** 1024-65535  
**Descripción:** Puerto donde escucha el servidor Node.js

```env
PORT=5000         # Desarrollo
PORT=3000         # Si 5000 está ocupado
PORT=8000         # Alternativa
```

### NODE_ENV
**Tipo:** String  
**Válidos:** `development`, `production`  
**Default:** `development`  
**Descripción:** Ambiente de ejecución

```env
NODE_ENV=development    # Desarrollo (logs verbosos, sin caché)
NODE_ENV=production     # Producción (optimizado)
```

---

## JWT (Autenticación)

### JWT_SECRET
**Tipo:** String  
**Largo:** Mínimo 32 caracteres  
**Default:** (vacío - ¡CAMBIAR!)  
**Descripción:** Clave secreta para firmar tokens JWT

```env
# Generar segura:
# Linux/Mac: openssl rand -base64 32
JWT_SECRET=rTdyOmZ6hP2jNqW8vL5sX9cK3mA7bZ1eY4f6gH8j0lP

# Desarrollo (solo para testing):
JWT_SECRET=dev-secret-key-12345
```

> 🔐 **CRÍTICO:** 
> - NUNCA pushear valor real a git
> - Cambiar regularmente en producción
> - Mínimo 32 caracteres aleatorios

### JWT_EXPIRATION
**Tipo:** String  
**Default:** `24h`  
**Formato:** Puede ser número (ms) o string con unidad  
**Descripción:** Tiempo de expiración del token

```env
JWT_EXPIRATION=24h         # 24 horas
JWT_EXPIRATION=48h         # 48 horas
JWT_EXPIRATION=7d          # 7 días
JWT_EXPIRATION=86400       # 86400 milisegundos
```

> 💡 **Recomendación:** 
> - Desarrollo: 7 días o más
> - Producción: 24h máximo

---

## Admin Usuario Inicial

### ADMIN_EMAIL
**Tipo:** String  
**Default:** `admin@scanqueue.local`  
**Descripción:** Email del usuario administrador inicial

```env
ADMIN_EMAIL=admin@scanqueue.local       # Desarrollo
ADMIN_EMAIL=admin@tu-escuela.edu.ar     # Producción
```

### ADMIN_PASSWORD
**Tipo:** String  
**Default:** `admin123`  
**Descripción:** Contraseña inicial del admin

```env
ADMIN_PASSWORD=admin123              # Desarrollo SOLO
ADMIN_PASSWORD=C0mpl3j@P@ssw0rd123!  # Producción FUERTE
```

> ⚠️ **IMPORTANTE:** 
> - CAMBIAR después del primer login en producción
> - Mínimo 12 caracteres en producción
> - Incluir mayúsculas, minúsculas, números, símbolos

---

## CORS (Cross-Origin Resource Sharing)

### CORS_ORIGIN
**Tipo:** String o Array  
**Default:** `http://localhost:3000`  
**Descripción:** Dominio(s) permitido(s) para CORS

```env
# Desarrollo (frontend local):
CORS_ORIGIN=http://localhost:3000

# Producción (dominio real):
CORS_ORIGIN=https://app.scanqueue.edu.ar

# Múltiples orígenes (si es necesario, separar con comas):
CORS_ORIGIN=https://app.scanqueue.edu.ar,https://admin.scanqueue.edu.ar
```

> 🔒 **Seguridad:** En producción, especificar dominio exacto

---

## QR (Configuración Códigos QR)

### QR_SIZE
**Tipo:** Integer  
**Default:** `200`  
**Rango recomendado:** 100-500  
**Descripción:** Tamaño en píxeles del código QR

```env
QR_SIZE=200         # Tamaño estándar
QR_SIZE=300         # Más grande (mejor legibilidad)
QR_SIZE=150         # Más pequeño (ahorra espacio)
```

### QR_ERROR_CORRECTION
**Tipo:** String  
**Válidos:** `L`, `M`, `Q`, `H`  
**Default:** `H`  
**Descripción:** Nivel de corrección de errores

```env
QR_ERROR_CORRECTION=L    # Bajo (7%)
QR_ERROR_CORRECTION=M    # Medio (15%)
QR_ERROR_CORRECTION=Q    # Cuartil (25%)
QR_ERROR_CORRECTION=H    # Alto (30%) - RECOMENDADO

# H permite leer el QR aunque esté hasta 30% dañado
```

---

## Rate Limiting

### MAX_SCANS_PER_SECOND
**Tipo:** Integer  
**Default:** `10`  
**Descripción:** Máximo escaneos permitidos por segundo

```env
MAX_SCANS_PER_SECOND=10    # Estándar (10 escaneos/seg)
MAX_SCANS_PER_SECOND=20    # Más permisivo
MAX_SCANS_PER_SECOND=5     # Más restrictivo
```

> 💡 Con 10 escaneos/segundo, se pueden registrar 600 estudiantes en 60 segundos

### DUPLICATE_SCAN_TIMEOUT
**Tipo:** Integer  
**Default:** `30`  
**Unidad:** segundos  
**Descripción:** Ventana de tiempo para detectar escaneos duplicados

```env
DUPLICATE_SCAN_TIMEOUT=30    # 30 segundos (estándar)
DUPLICATE_SCAN_TIMEOUT=60    # 1 minuto (más tolerante)
DUPLICATE_SCAN_TIMEOUT=15    # 15 segundos (más restrictivo)
```

> Si el mismo estudiante se escanea dos veces dentro de este intervalo, se considera duplicado

---

## File Upload

### MAX_FILE_SIZE
**Tipo:** Integer  
**Default:** `5242880`  
**Unidad:** bytes (5MB)  
**Descripción:** Tamaño máximo de archivo para upload

```env
MAX_FILE_SIZE=5242880       # 5 MB (estándar)
MAX_FILE_SIZE=10485760      # 10 MB
MAX_FILE_SIZE=1048576       # 1 MB (restrictivo)
```

### UPLOAD_DIR
**Tipo:** String  
**Default:** `./uploads`  
**Descripción:** Directorio local donde guardar archivos

```env
UPLOAD_DIR=./uploads                    # Relativo a projet root
UPLOAD_DIR=/home/scanqueue/uploads      # Ruta absoluta
UPLOAD_DIR=C:\\app\\uploads             # Windows
```

---

## Socket.io (WebSocket)

### SOCKET_PORT
**Tipo:** Integer  
**Default:** `3001`  
**Descripción:** Puerto para WebSocket (Socket.io)

```env
SOCKET_PORT=3001     # Desarrollo (debe ser diferente a PORT)
SOCKET_PORT=5001     # Producción
```

> Si usas proxy (nginx), puede ser el mismo puerto que HTTP

---

## Ejemplo Completo de .env

### Desarrollo
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scanqueue_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_EXPIRATION=7d

# Admin User
ADMIN_EMAIL=admin@scanqueue.local
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=http://localhost:3000

# QR
QR_SIZE=200
QR_ERROR_CORRECTION=H

# Rate Limiting
MAX_SCANS_PER_SECOND=10
DUPLICATE_SCAN_TIMEOUT=30

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Socket.io
SOCKET_PORT=3001
```

### Producción
```env
# Database
DB_HOST=db.scanqueue.prod.com
DB_PORT=5432
DB_NAME=scanqueue_db_prod
DB_USER=scanqueue_prod_user
DB_PASSWORD=rTdyOmZ6hP2jNqW8vL5sX9cK3mA7bZ1eY4f6gH8j0lP

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=xK9jM2nP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN
JWT_EXPIRATION=24h

# Admin User
ADMIN_EMAIL=admin@escuela-xyz.edu.ar
ADMIN_PASSWORD=C0mpl3j@P@ssw0rd#2026!Secure

# CORS
CORS_ORIGIN=https://app.scanqueue.edu.ar

# QR
QR_SIZE=200
QR_ERROR_CORRECTION=H

# Rate Limiting
MAX_SCANS_PER_SECOND=15
DUPLICATE_SCAN_TIMEOUT=30

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/var/app/scanqueue/uploads

# Socket.io
SOCKET_PORT=5000
```

---

## Validación de .env

Todas las variables son validadas en `src/config/index.js`

```bash
# Test si está configurado correctamente:
node -e "import('./src/config/index.js').then(c => console.log(c.config))"
```

---

## Checklist de Seguridad

Antes de ir a producción:

- [ ] JWT_SECRET cambiado (mínimo 32 caracteres)
- [ ] ADMIN_PASSWORD fuerte (12+ caracteres)
- [ ] DB_PASSWORD fuerte (20+ caracteres)
- [ ] NODE_ENV = production
- [ ] CORS_ORIGIN apunta al dominio correcto
- [ ] No hay .env en git (revisar .gitignore)
- [ ] MAX_SCANS_PER_SECOND ajustado según necesidad
- [ ] UPLOAD_DIR apunta a ruta segura
- [ ] Todos los valores son seguros y únicos

---

## Regenerar Variables Seguras

### Generar JWT_SECRET
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | forEach {[byte](Get-Random -Maximum 256)}))
```

### Generar Contraseña Segura
```bash
# Linux/Mac
openssl rand -base64 16 | tr -d '='

# Online
https://passwordsgenerator.net (mínimo 20 caracteres)
```

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026
