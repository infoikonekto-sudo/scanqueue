# 🔧 COMERCIAL DE COMANDOS - ScanQueue Backend

Referencia rápida de comandos útiles para el desarrollo y deployment.

## 📦 Instalación y Setup

```bash
# Instalar dependencias del proyecto
npm install

# O instalar con versiones exactas
npm ci

# Instalar dependencia específica
npm install express@latest

# Instalar dependencias de desarrollo
npm install --save-dev nodemon
```

## 🗄️ Base de Datos

```bash
# Crear base de datos (una sola vez)
createdb scanqueue_db

# Inicializar esquema
npm run db:init

# Cargar datos de ejemplo
npm run db:seed

# Conectar a BD con psql
psql -h localhost -U postgres -d scanqueue_db

# Hacer backup manual
pg_dump -h localhost -U postgres scanqueue_db > backup.sql

# Restaurar desde backup
psql -h localhost -U postgres scanqueue_db < backup.sql
```

### Comandos SQL útiles
```sql
-- Listar todos los usuarios
SELECT id, email, role, created_at FROM users;

-- Listar estudiantes
SELECT id, name, grade, unique_code FROM students LIMIT 10;

-- Ver escaneos del día
SELECT s.*, st.name FROM scans s
LEFT JOIN students st ON s.student_id = st.id
WHERE DATE(s.timestamp) = CURRENT_DATE
ORDER BY s.timestamp DESC;

-- Estadísticas rápidas
SELECT COUNT(*) as total_students FROM students WHERE active = true;
SELECT COUNT(*) as scans_today FROM scans WHERE DATE(timestamp) = CURRENT_DATE;

-- Limpiar escaneos antiguos (CUIDADO!)
DELETE FROM scans WHERE timestamp < NOW() - INTERVAL '30 days';
```

## 🚀 Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

# Iniciar sin nodemon (producción)
node src/server.js

# Verificar setup
bash verify-setup.sh

# Ver versión de Node
node --version

# Ver versión de npm
npm --version
```

## 🧪 Testing & Debugging

```bash
# Ejecutar script testing (bash)
bash test-api.sh

# Test simple con curl - Health check
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@scanqueue.local","password":"admin123"}'

# Guardar token en variable
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@scanqueue.local","password":"admin123"}' \
  | jq -r '.token')

# Usar token en siguiente request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/students

# Test con datos JSON
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "grade": "1° Básico",
    "parent_email": "test@email.com"
  }'

# Ver logs en tiempo real
npm run dev

# Debug modo verbose
DEBUG=scanqueue:* npm run dev
```

## 🌐 API Endpoints Principales

```bash
# Autenticación
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

# Estudiantes
GET    /api/students
POST   /api/students
GET    /api/students/:id
PUT    /api/students/:id
DELETE /api/students/:id

# Escaneos ⭐ CRÍTICOS
POST   /api/scan
GET    /api/scan/queue
GET    /api/scan/history
POST   /api/scan/validate

# Rutas
GET    /api/routes
POST   /api/routes

# Códigos QR
POST   /api/qr/generate
POST   /api/qr/batch

# Dashboard
GET    /api/dashboard/stats
GET    /api/dashboard/today
```

## 📝 Edición de Archivos

```bash
# Editar arquivo de configuración
nano src/config/index.js
code src/config/index.js      # En VS Code

# Editar variables de entorno
nano .env
code .env

# Editar esquema BD
nano database/schema.sql
```

## 🔐 Manejo de Secretos

```bash
# Generar nueva clave JWT (Linux/Mac)
openssl rand -base64 32

# Generar contraseña fuerte
openssl rand -base64 16 | tr -d '='

# Verificar secreto en .env
grep JWT_SECRET .env
```

## 📊 Monitoreo

```bash
# Ver procesos Node.js
ps aux | grep node

# Matar proceso en puerto
lsof -i :5000           # Ver qué está en puerto 5000
kill -9 <PID>           # Matar ese proceso

# Ver estadísticas de memoria
top

# Logs del sistema
dmesg

# PostgreSQL service
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

## 🐳 Docker (Opcional)

```bash
# Construir imagen
docker build -t scanqueue-api .

# Ejecutar contenedor
docker run -p 5000:5000 --env-file .env scanqueue-api

# Docker Compose
docker-compose up              # Levantar servicios
docker-compose down            # Detener servicios
docker-compose logs -f api     # Ver logs

# Ver contenedores
docker ps
docker ps -a

# Eliminar contenedor
docker rm <container-id>
```

## 🔄 Git & Versionamiento

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Mensaje descriptivo"

# Push
git push origin main

# Ver historial
git log --oneline

# Crear rama
git checkout -b feature/nueva-funcionalidad

# Cambiar rama
git checkout main

# Merge
git merge feature/nueva-funcionalidad
```

## 📦 npm Scripts Personalizados

```bash
# Ver scripts disponibles
npm run

# Scripts pre-configurados en package.json
npm start           # node src/server.js
npm run dev        # nodemon src/server.js
npm run db:init    # node database/init.js
npm run db:seed    # node database/seed.js
```

## 🚀 Deployment

```bash
# PM2 - Instalar
npm install -g pm2

# PM2 - Iniciar app
pm2 start src/server.js --name "scanqueue-api"

# PM2 - Ver logs
pm2 logs scanqueue-api

# PM2 - Monitorear
pm2 monit

# PM2 - Guardar config
pm2 save
pm2 startup

# Nginx - Testear config
sudo nginx -t

# Nginx - Reiniciar
sudo systemctl restart nginx

# Let's Encrypt - Renovar certificado
sudo certbot renew --dry-run
```

## 🔍 Búsqueda y Análisis

```bash
# Buscar en archivos (grep)
grep -r "función" src/
grep -r "TODO" src/
grep -r "FIXME" src/

# Contar líneas de código
wc -l src/**/*.js

# Ver estructura
tree src/

# Listar archivos
ls -la

# Buscar archivos grandes
find . -size +1M
```

## ⚙️ Configuración y Utilidades

```bash
# Ver versión Node.js
node -v

# Ver versión npm
npm -v

# Ver versión PostgreSQL
psql --version

# Verificar puerto disponible
netstat -an | grep :5000

# Espacio en disco
df -h

# Información del sistema
uname -a

# Cambiar zona horaria (si es necesario)
sudo timedatectl set-timezone America/Santiago
```

## 📚 Documentación

```bash
# Ver README
cat README.md

# Abrir en navegador (si es HTTP)
open http://localhost:5000/health

# Ver logs detallados
tail -f npm-debug.log

# Limpiar logs viejos
rm -f npm-debug.log*
```

## 🧹 Mantenimiento

```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar cache npm
npm cache clean --force

# Auditar vulnerabilidades
npm audit

# Arreglar vulnerabilidades automáticamente
npm audit fix

# Ver actualizaciones disponibles
npm outdated

# Actualizar dependencias
npm update
```

## 🖥️ Comandos Rápidos Útiles

```bash
# Todo en uno - Setup y start
npm install && npm run db:init && npm run db:seed && npm run dev

# Backup y ver tamaño
pg_dump scanqueue_db | gzip > backup-$(date +%Y%m%d).sql.gz
ls -lh backup-*.sql.gz

# Test múltiple - Login y guardar token
TOKEN=$(curl -s http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@scanqueue.local","password":"admin123"}' \
  | jq -r '.token') && \
echo "Token: $TOKEN" && \
curl -s http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Ejecutar un script inmediatamente
node -e "import('./src/config/database.js').then(db => console.log('BD conectada'))"

# Monitorear puerto
watch -n 1 'lsof -i :5000'

# Contar endpoints
grep -r "@" src/routes/ | wc -l
grep -r "router\." src/routes/ | wc -l
```

## 🎯 Atajos Recomendados

Agregar a `~/.bashrc` o `~/.zshrc`:

```bash
# Alias útiles
alias scanqueue="cd /path/to/scanqueue/backend"
alias sq-dev="npm run dev"
alias sq-logs="npm run dev 2>&1 | grep -v node_modules"
alias sq-test="bash test-api.sh"
alias sq-db="npm run db:init && npm run db:seed"

# Funciones rápidas
function sq-login() {
  curl -s http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" | jq '.token'
}
```

Usar después:
```bash
source ~/.bashrc
scanqueue                    # Cambiar a carpeta
sq-dev                       # Iniciar servidor
TOKEN=$(sq-login operator@scanqueue.local admin123)  # Get token
```

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026

💡 Para más información, ver README.md o DEVELOPMENT.md
