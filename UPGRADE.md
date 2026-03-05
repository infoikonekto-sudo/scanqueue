# 🔄 UPGRADE.md - Guía de Actualización de ScanQueue

## 📋 Tabla de Contenidos

1. [Actualización de Versión](#actualización-de-versión-menor)
2. [Proceso de Upgrade](#proceso-de-upgrade)
3. [Rollback y Recuperación](#rollback-y-recuperación)
4. [Actualización de Dependencias](#actualización-de-dependencias)
5. [Notas de Release](#notas-de-release)

---

## 🆕 Actualización de Versión Menor

### Versión 1.0.x → 1.1.x

**Tiempo estimado**: 5-10 minutos

**Pasos**:

```bash
# 1. Backup preventivo
./backup.sh

# 2. Obtener nuevos cambios
git pull origin main

# 3. Actualizar dependencias
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. Redeploy
./deploy.sh --build

# 5. Verificar
./health-check.sh

# 6. Probar functionalidad crítica
curl https://tudominio.com/api/students
```

---

## ⚙️ Proceso de Upgrade

### Pre-Upgrade Checklist

- ✅ Realizar backup de BD
- ✅ Comunicar a usuarios sobre mantenimiento
- ✅ Verificar espacio en disco (mínimo 5GB)
- ✅ Verificar status de servicios
- ✅ Tener acceso como root/sudo

### 1. Backup Completo

```bash
# Hacer backup manual (además del automático)
./backup.sh

# Verificar el backup se creó
ls -la backups/*.sql.gz

# Opcional: upload a S3
# aws s3 cp backups/database_*.sql.gz s3://tu-bucket/
```

### 2. Inspeccionar Cambios

```bash
# Ver qué cambios vienen
git fetch
git log --oneline origin/main ^HEAD | head -10

# Ver cambios en archivos específicos
git diff HEAD origin/main -- backend/src/

# O ver directamente en GitHub
# https://github.com/tu-org/scanqueue/compare
```

### 3. Actualizar Código

```bash
# Obtener cambios (asume que no hay cambios locales)
git pull origin main

# Si hay cambios locales, stashear primero:
git stash
git pull origin main
git stash pop

# Verificar cambios
git status
```

### 4. Actualizar Configuración (si aplica)

```bash
# Si hay un nuevo .env.example
# Comparar cambios
diff .env.production.example .env.production

# Agregar nuevas variables si es necesario
nano .env.production

# Validar
grep "CAMBIAR_ESTO" .env.production  # Debe estar vacío
```

### 5. Build y Deploy

```bash
# Opción A: Solo build (sin migrations)
./deploy.sh --build

# Opción B: Build + Migrations (si hay cambios BD)
./deploy.sh --build --migrate

# Opción C: Build + Migrations + Seed (si hay datos nuevos)
./deploy.sh --build --migrate --seed

# Monitorear
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 6. Verificación Post-Upgrade

```bash
# Health check
./health-check.sh

# Pruebas manuales
curl https://tudominio.com/
curl https://tudominio.com/api/health
curl https://tudominio.com/api/students

# Acceder desde navegador
# https://tudominio.com

# Verificar logs
docker-compose -f docker-compose.prod.yml logs --tail=50 backend | grep -i error
```

---

## 🔙 Rollback y Recuperación

### Rollback a Versión Anterior

```bash
# 1. Revertir código
git revert HEAD
# o
git reset --hard origin/1.0.x  # si versión anterior tiene rama

# 2. Restaurar BD desde backup
./restore.sh database_FECHA_PRE_UPGRADE.sql.gz

# 3. Redeploy
./deploy.sh --build

# 4. Verificar
./health-check.sh
```

### Rollback desde Backup Automático

```bash
# Ver backups disponibles
ls -lh backups/

# Restaurar el backup que quieras
./restore.sh database_20240301_010000.sql.gz

# El script pedirá confirmación y creará backup de seguridad
```

### Recuperación parcial (solo BD)

```bash
# Si solo la BD falla pero aplicación está bien
./restore.sh database_FECHA.sql.gz --force

# Verificar
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue -c "SELECT COUNT(*) FROM students;"
```

---

## 📦 Actualización de Dependencias

### Actualizar Node.js

```bash
# Cambiar versión en Dockerfile.backend
nano Dockerfile.backend

# Cambiar: FROM node:18-alpine
# A:      FROM node:20-alpine

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache backend

# Deploy
./deploy.sh --build

# Verificar
docker-compose -f docker-compose.prod.yml exec backend node --version
```

### Actualizar PostgreSQL

```bash
# IMPORTANTE: Hacer backup antes!
./backup.sh

# Cambiar versión en docker-compose.prod.yml
nano docker-compose.prod.yml

# Cambiar: image: postgres:15-alpine
# A:      image: postgres:16-alpine

# Pasos:
# 1. Exportar data desde BD 15
docker-compose -f docker-compose.prod.yml exec postgres pg_dump \
  -U scanqueue scanqueue > dump_pg15.sql

# 2. Parar servicios
docker-compose -f docker-compose.prod.yml down

# 3. Eliminar volumen antiguo (¡CUIDADO!)
docker volume rm scanqueue_postgres_data

# 4. Levantar con nueva versión
docker-compose -f docker-compose.prod.yml up -d postgres

# 5. Esperar sin esté listo
sleep 10

# 6. Importar dump
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue < dump_pg15.sql

# 7. Levantar resto de servicios
docker-compose -f docker-compose.prod.yml up -d
```

### Actualizar Nginx

```bash
# Cambiar en docker-compose.prod.yml
nano docker-compose.prod.yml

# Cambiar: image: nginx:alpine
# A:      image: nginx:1.25-alpine

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache nginx

# Validar configuración
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Aplicar
docker-compose -f docker-compose.prod.yml restart nginx
```

### Actualizar Docker & Docker Compose

```bash
# Ver versiones actuales
docker --version
docker-compose --version

# Actualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Reiniciar daemon
sudo systemctl restart docker

# Verificar servicios siguen andando
docker-compose -f docker-compose.prod.yml ps

# Actualizar Docker Compose (si no está integrado)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker-compose --version
```

### Actualizar Paquetes npm

```bash
# Backend
cd backend
npm update

# Verificar cambios mayores
npm outdated

# Si hay vulnerabilidades
npm audit fix

# Commit cambios
git add package.json package-lock.json
git commit -m "chore: update npm dependencies"

# Frontend
cd ../frontend
npm update
npm audit fix

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Deploy
./deploy.sh --build
```

---

## 📝 Notas de Release

### V1.0.0 (Release Inicial)

**Fecha**: 2024-03-01

**Cambios**:
- ✨ Sistema inicial de QR con datos en tiempo real
- 🔐 Autenticación JWT completa
- 📊 Dashboard de estadísticas
- 📧 Notificaciones por email
- 🗄️ Backup automático
- 🐳 Docker Compose completo

**Actualización desde**:
- Instalación nueva: `./deploy.sh --full`

### V1.1.0 (Mejoras Performance)

**Fecha**: 2024-04-15 (simulada)

**Cambios**:
- ⚡ Caché Redis integrado
- 🚀 Optimización de queries BD
- 📈 Soporte para múltiples instancias backend
- 🔧 Health checks mejorados
- 📱 Mejor responsive design

**Cambios en BD**: Sí (ejecutar `--migrate`)

**Actualización desde v1.0.x**:
```bash
./backup.sh
git pull origin main
./deploy.sh --build --migrate
./health-check.sh
```

**Rollback a v1.0.x**:
```bash
git reset --hard origin/1.0.x
./restore.sh database_pre_v1.1.sql.gz
./deploy.sh --build
```

### V1.2.0 (Seguridad)

**Fecha**: 2024-06-01 (simulada)

**Cambios**:
- 🔒 2FA (Two-Factor Authentication)
- 🚨 Rate limiting mejorado
- 📋 Audit logging completo
- 🔑 Rotación automática de keys
- 🛡️ WAF (Web Application Firewall) integration

**Cambios en BD**: Sí, cambios significativos

**Actualización desde v1.0.x o v1.1.x**:
```bash
./backup.sh
git pull origin main
./deploy.sh --build --migrate --seed
./health-check.sh
```

**Testing antes de update**:
```bash
# Ver cambios
git log v1.1.0..origin/main --oneline

# Preview en staging (si tienes)
git checkout staging
./deploy.sh --build --migrate
```

---

## 🗺️ Operación Paso a Paso: Update de v1.0 a v1.1

### Preparación (30 minutos antes)

```bash
# 1. Notificar a usuarios
# "Mantenimiento planeado entre 2:00 - 2:30 AM"

# 2. Reestablecer límites de logs para que no ocupen espacio
docker-compose -f docker-compose.prod.yml logs --tail=1000 > /tmp/last-logs-backup.txt

# 3. Hacer backup completo
./backup.sh

# 4. Ver que backup se hizo bien
ls -lh backups/database_*.sql.gz | tail -1
```

### Ejecución (10-15 minutos)

```bash
# 1. Obtener código nuevo
cd /home/scanqueue/scanqueue
git fetch
git pull origin main

# 2. Ver cambios
git diff HEAD@{1} -- backend/package.json frontend/package.json

# 3. Actualizar si hay nuevas variables
# (Comparar .env.production.example con actual)

# 4. Build y deploy
./deploy.sh --build  # El --migrate es opcional, chequear notas del release

# 5. Monitorear proceso
# En otra terminal:
docker-compose -f docker-compose.prod.yml logs -f backend &
```

### Post-Actualización (5-10 minutos)

```bash
# 1. Health check
./health-check.sh

# 2. Pruebas manuales
curl https://tudominio.com/
curl -H "Authorization: Bearer <token>" https://tudominio.com/api/students

# 3. Acceder en navegador, probar funciones críticas
# https://tudominio.com
# - Login
# - Scan QR
# - Dashboard

# 4. Monitorear logs por 5-10 minutos
docker-compose -f docker-compose.prod.yml logs -f backend | grep -i error

# 5. Notificar a usuarios
# "Mantenimiento completado. Sistema online."
```

---

## ⚠️ Cambios Importantes por Versión

### Backend Breaking Changes

| Versión | Cambio | Migración |
|---------|--------|-----------|
| v1.0 → v1.1 | Nuevo índice en BD | AUTO: `--migrate` |
| v1.1 → v1.2 | Tabla users.2fa_enabled | AUTO: `--migrate` |

### Frontend Breaking Changes

| Versión | Cambio | Acción |
|---------|--------|--------|
| v1.0 → v1.1 | API response format | AUTO en build |
| v1.1 → v1.2 | OAuth added | AUTO en build |

### Database Migrations

```bash
# Ver migraciones pendientes
docker-compose -f docker-compose.prod.yml exec backend \
  npm run db:status

# Ejecutar manualmente
./deploy.sh --migrate

# Rollback última migración (si falla)
docker-compose -f docker-compose.prod.yml exec backend \
  npm run db:rollback
```

---

## 📊 Monitoreo Post-Upgrade

### Métricas a Verificar

```bash
# 1. Respuesta de API
curl -w "Time: %{time_total}s\n" https://tudominio.com/api/health

# 2. Uso de recursos
docker stats --no-stream

# 3. Logs de error
docker-compose -f docker-compose.prod.yml logs backend | grep -i error | wc -l

# 4. Conexiones activas
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue -c "SELECT count(*) FROM pg_stat_activity;"

# 5. Tamaño de BD
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue -c "SELECT pg_size_pretty(pg_database_size('scanqueue'));"
```

### Alertas Comunes Post-Upgrade

| Alerta | Causa | Solución |
|--------|-------|----------|
| API 500 | Code error | Ver logs: `docker logs scanqueue-backend` |
| 502 Bad Gateway | Backend down | `docker-compose restart backend` |
| Slow queries | Índices faltantes | `./deploy.sh --migrate` |
| Memory spike | Memory leak | Restart: `docker-compose restart backend` |

---

## 📞 Soporte Post-Upgrade

Si algo falla:

```bash
# 1. Revisar troubleshooting
cat TROUBLESHOOTING.md

# 2. Ver logs completos
docker-compose -f docker-compose.prod.yml logs backend > /tmp/logs.txt

# 3. Rollback a versión anterior
git checkout 1.0.x
./restore.sh database_pre_upgrade.sql.gz
./deploy.sh --build

# 4. Contactar soporte
# Email: soporte@tudominio.com
# Incluir: /tmp/logs.txt
```

---

**Versión**: 1.0.0  
**Última actualización**: 2024-03-01  
**Políticas de Upgrade**: 
- Feature releases (1.x.0): Mensual
- Bugfix releases (1.0.x): Semanal
- Security updates: Inmediato
