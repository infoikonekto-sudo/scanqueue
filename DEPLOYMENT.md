# 📦 DEPLOYMENT.md - Guía Completa de Producción ScanQueue

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Arquitectura de Despliegue](#arquitectura-de-despliegue)
4. [Instalación Inicial](#instalación-inicial)
5. [Configuración de Entorno](#configuración-de-entorno)
6. [Certificados SSL/HTTPS](#certificados-sslhttps)
7. [Despliegue en Producción](#despliegue-en-producción)
8. [Verificación de Servicios](#verificación-de-servicios)
9. [Copias de Seguridad](#copias-de-seguridad)
10. [Monitoreo y Logs](#monitoreo-y-logs)
11. [Troubleshooting](#troubleshooting)
12. [Actualización de Sistema](#actualización-de-sistema)
13. [Escalabilidad](#escalabilidad)

---

## 🎯 Introducción

Este documento proporciona una guía completa para desplegar **ScanQueue** en un entorno de producción. ScanQueue es un sistema integral de control de asistencia escolar con código QR, diseñado para escuelas y espacios educativos.

### Características Principales
- **Single-command deployment** con Docker Compose
- **HTTPS/SSL** automático con Nginx
- **Alta disponibilidad** con health checks
- **Backups automáticos** diarios
- **Escalable** hasta 1000+ usuarios/día
- **Monitoreo integrado** 24/7
- **Seguridad de nivel empresarial**

---

## 📋 Requisitos Previos

### Hardware Mínimo
```
CPU:     2 cores
RAM:     2GB mínimo, 4GB recomendado
Disco:   20GB disponible (SSD recomendado)
Red:     1Mbps conexión estable
```

### Hardware Recomendado
```
CPU:     4+ cores
RAM:     8GB
Disco:   100GB SSD
Red:     10Mbps conexión
Uptime:  99.9%+ SLA
```

### Software Requerido
```
Docker:          20.10+ (instalar desde https://docker.com)
Docker Compose:  2.0+ (generalmente incluido)
Git:             (para clonar repositorio)
OpenSSL:         (para certificados SSL)
Curl/Wget:       (para testing)
```

### Sistema Operativo Soportado
- Ubuntu 18.04 LTS o superior
- Debian 10 o superior
- CentOS 8 o superior
- RHEL 8 o superior
- macOS 11+ (para testing)
- Windows 10/11 + WSL2 (para testing)

### Dependencias Externas
- **Dominio DNS** (opcional, funciona con IP)
- **Certificado SSL** (auto-generado o Let's Encrypt)
- **Servidor SMTP** (para notificaciones por email, opcional)
- **Espacio S3** (para backups remotos, opcional)

---

## 🏗️ Arquitectura de Despliegue

### Componentes Principales
```
┌─────────────────────────────────────────────────────┐
│                   INTERNET                           │
└────────────┬────────────────────────────────────────┘
             │ HTTPS (443)
             │
┌────────────▼────────────────────────────────────────┐
│           NGINX (Reverse Proxy)                      │
│     - Load Balancer                                  │
│     - SSL/TLS Termination                            │
│     - Rate Limiting                                  │
│     - Compresión Gzip                               │
│     - Cache de assets                                │
└────┬────────────────────────────────────────┬───────┘
     │                                        │
     │ HTTP (3000)              HTTP (5000)       │
     │                          │
┌────▼──────────────────┐  ┌───▼──────────────────┐
│   Frontend (React)    │  │  Backend (Node.js)   │
│   - SPA Application   │  │  - Express API       │
│   - Webpack Gzip      │  │  - Socket.io         │
│   - Min assets        │  │  - JWT Auth          │
│   - ~3MB gzipped      │  │  - REST endpoints    │
└────────────────────────┘  └─────┬────────────────┘
                                   │
                            ┌──────▼────────────┐
                            │  PostgreSQL DB    │
                            │  - Puerto 5432    │
                            │  - Volumen datos  │
                            │  - Backups auto   │
                            └───────────────────┘

Todas las dependencias están en la red scanqueue-network
Aisladas del exterior por Nginx
```

### Stack Tecnológico
```
Capa de Presentación:
  - React 18          (Frontend Framework)
  - Vite              (Build Tool)
  - TailwindCSS       (Styling)
  - Socket.io Client  (Real-time)

Capa de Aplicación:
  - Node.js 18        (Runtime)
  - Express.js        (Web Framework)
  - Socket.io         (WebSocket)
  - JWT               (Autenticación)
  - Joi               (Validación)

Capa de Datos:
  - PostgreSQL 15     (Base de Datos)
  - pg                (Driver)

Infraestructura:
  - Docker            (Containerización)
  - Nginx             (Reverse Proxy)
  - OpenSSL           (SSL/TLS)
```

---

## 🔧 Instalación Inicial

### Paso 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar requisitos
sudo apt install -y curl git wget openssh-server openssl

# Crear usuario para ScanQueue (opcional pero recomendado)
sudo useradd -m -s /bin/bash scanqueue
sudo usermod -aG docker scanqueue
```

### Paso 2: Instalar Docker

```bash
# Instalación automática
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

### Paso 3: Clonar Repositorio

```bash
# Clonar desde repositorio
cd /home/scanqueue  # o tu ruta de producción
git clone https://github.com/tuorganizacion/scanqueue.git
cd scanqueue

# O descargar ZIP
wget https://github.com/tuorganizacion/scanqueue/archive/main.zip
unzip main.zip
cd scanqueue-main
```

### Paso 4: Ejecutar Setup Inicial

```bash
# Hacer ejecutable el script de setup
chmod +x setup-production.sh

# Ejecutar setup
./setup-production.sh

# Este script:
# - Verifica Docker/Docker Compose
# - Crea directorio de backups
# - Genera certificados SSL auto-firmados
# - Crear estructura de directorios
# - Configura permisos
```

---

## ⚙️ Configuración de Entorno

### Paso 1: Crear Archivo .env.production

```bash
# Copiar template
cp .env.production.example .env.production

# Editar con valores reales (usar editor seguro)
nano .env.production
```

### Paso 2: Configurar Variables Críticas

Estas variables **DEBEN** ser cambiadas antes de deployment:

```bash
# Base de Datos (CAMBIAR OBLIGATORIAMENTE)
DATABASE_PASSWORD=TU_CONTRASEÑA_MUY_SEGURA_123!@#

# Seguridad (GENERAR NUEVAS CLAVES)
JWT_SECRET=TU_JWT_SECRET_LARGO_Y_ALEATORIO_123!@#456
REFRESH_TOKEN_SECRET=OTRO_SECRET_ALEATORIO_789!@#012

# Dominio (TU DOMINIO REAL)
CORS_ORIGIN=https://tudominio.com
VITE_API_URL=https://tudominio.com/api
VITE_WS_URL=wss://tudominio.com/ws

# Email (si usas notificaciones)
SMTP_USER=tu_correo@gmail.com
SMTP_PASSWORD=tu_app_password_gmail

# Admin (credenciales iniciales)
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=TU_PASSWORD_ADMIN_SEGURO_123!@#
```

### Paso 3: Generar Contraseñas Seguras

```bash
# Generar contraseña aleatoria segura
openssl rand -base64 32

# Ejemplos:
# JWT_SECRET: $(openssl rand -base64 32)
# DB_PASSWORD: $(openssl rand -base64 24)
# ADMIN_PASSWORD: $(openssl rand -base64 20)
```

### Paso 4: Validar Configuración

```bash
# Verificar que TODAS las variables críticas están configuradas
grep "CAMBIAR_ESTO" .env.production

# Debe estar vacío - si hay output, hacer los cambios faltantes
```

---

## 🔐 Certificados SSL/HTTPS

### Opción 1: Certificados Auto-Firmados (Testing)

```bash
# Generar certificados auto-firmados
./generate-certs.sh self-signed

# Para dominio específico
./generate-certs.sh self-signed midominio.com

# Generar solo clave y certificado
./generate-certs.sh self-signed
```

**NOTA**: Los certificados auto-firmados mostrarán advertencias en navegadores. Solo usar para testing.

### Opción 2: Let's Encrypt (RECOMENDADO)

```bash
# Instalar Certbot (si no está instalado)
sudo apt install certbot python3-certbot-nginx

# Generar certificado (requiere que Nginx esté corriendo)
./generate-certs.sh letsencrypt midominio.com admin@midominio.com

# El certificado se obtiene automáticamente desde Let's Encrypt
# Válido por 90 días
```

### Opción 3: Certificado Comercial

```bash
# Copiar certificados comerciales a directorio certs/
cp mi_certificado.crt certs/cert.pem
cp mi_clave_privada.key certs/key.pem
cp cadena_certificados.crt certs/chain.pem

# Verificar que nginx.conf apunta a estos archivos
grep "ssl_certificate" nginx.conf
```

### Configurar Renovación Automática

```bash
# Para Let's Encrypt, configurar auto-renovación
./generate-certs.sh auto-renewal

# Verá las instrucciones para agregar a crontab
# Ejemplo:
# 0 2 * * * /home/scanqueue/scanqueue/renew-certs-auto.sh

# Agregar manualmente
crontab -e

# Y agregar esta línea:
# 0 2 * * * /ruta/a/scanqueue/renew-certs-auto.sh
```

### Verificar Certificado

```bash
# Ver información del certificado
./generate-certs.sh info

# Resultado esperado:
# Subject: CN=midominio.com
# Valid por X días
# Archivos: certs/cert.pem y certs/key.pem
```

---

## 🚀 Despliegue en Producción

### Paso 1: Verificar Prerequisitos

```bash
# Antes de hacer deploy, verificar todo está listo
docker --version           # Debe ser 20.10+
docker-compose --version   # Debe ser 2.0+
ls .env.production        # Debe existir
ls certs/cert.pem        # Certificados existentes
grep CAMBIAR .env.production  # Debe estar vacío
```

### Paso 2: Despliegue Inicial (PRIMERA VEZ)

```bash
# Hacer script ejecutable
chmod +x deploy.sh

# Deployment completo (recomendado para primera vez)
# Esto hace: build + migraciones + seed + backup
./deploy.sh --full

# El proceso toma 2-5 minutos:
# ✓ Valida configuración
# ✓ Construye imágenes Docker
# ✓ Inicia contenedores
# ✓ Espera a que servicios estén listos
# ✓ Ejecuta migraciones BD
# ✓ Crea datos iniciales
# ✓ Verifica salud
# ✓ Muestra URLs de acceso
```

### Paso 3: Despliegue Subsecuente (ACTUALIZACIONES)

```bash
# Para actualizar código sin perder datos
./deploy.sh --build

# Solo migraciones
./deploy.sh --migrate

# Backup + Build + Migrate + Seed
./deploy.sh --backup --build --migrate --seed

# Ver status sin cambios
docker-compose -f docker-compose.prod.yml ps
```

### Paso 4: Verificar Deployment

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Seguir solo el backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Ver últimas 100 líneas
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

---

## ✅ Verificación de Servicios

### Health Check Automático

```bash
# Verificar salud de todos los servicios una sola vez
./health-check.sh

# Esperado:
# [✓] Docker disponible
# [✓] Contenedores en ejecución
# [✓] PostgreSQL disponible
# [✓] Backend API respondiendo
# [✓] Frontend disponible
# [✓] WebSocket disponible

# Monitoreo continuo
./health-check.sh --continuous
# Presionar Ctrl+C para salir
```

### Pruebas Manuales

```bash
# Frontend (React app)
curl -I http://localhost/

# Backend API - Health check
curl http://localhost:5000/api/health

# Backend API - Listar estudiantes
curl http://localhost:5000/api/students

# WebSocket
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     http://localhost:5000/socket.io/?transport=websocket

# Base de Datos
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U scanqueue -d scanqueue -c "SELECT version();"
```

### Verificar Puertos

```bash
# Puertos que deben estar escuchando
netstat -tlnp | grep -E '80|443|5000|5432'

# Esperado:
# 80   - Nginx (HTTP redirect)
# 443  - Nginx (HTTPS)
# 5000 - Backend (solo interno)
# 5432 - PostgreSQL (solo interno)
```

### Prueba de Carga Básica

```bash
# Instalar Apache Bench
sudo apt install apache2-utils

# Hacer 100 requests con 10 concurrentes
ab -n 100 -c 10 https://tudominio.com/

# Resultado esperado: requests/sec ~ 100+
```

---

## 💾 Copias de Seguridad

### Backup Automático

Los backups corren automáticamente según crontab:

```bash
# Ver trabajos cron programados
crontab -l | grep backup

# Si no hay, agregar backup diario a las 2 AM
crontab -e

# Agregar línea:
0 2 * * * /home/scanqueue/scanqueue/backup.sh
```

### Backup Manual

```bash
# Hacer backup inmediatamente
./backup.sh

# Esto hace:
# - Dump de PostgreSQL
# - Backup de archivos cargados
# - Backup de logs
# - Backup de configuración
# - Compresión gzip
# - Limpieza de backups antiguos (>30 días)

# Ver backups creados
ls -lh backups/

# Resultado:
# database_20240301_143025.sql.gz (completará ~10-50MB)
# uploads_20240301_143025.tar.gz
# logs_20240301_143025.tar.gz
# config_20240301_143025.tar.gz
```

### Upload a S3 (Opcional)

Si tienes AWS S3 configurado:

```bash
# En .env.production
AWS_ENABLED=true
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET=tu_bucket_scanqueue

# Los backups se subirán automáticamente
# Ver en consola de AWS S3
```

### Restauración desde Backup

```bash
# Listar backups disponibles
ls backups/*.sql.gz

# Restaurar desde backup específico
./restore.sh database_20240301_143025.sql.gz

# El script:
# - Pide confirmación
# - Crea backup de seguridad
# - Restaura BD
# - Restaura archivos
# - Verifica integridad
# - Reinicia servicios

# Restaurar sin confirmación (para scripting)
./restore.sh --force database_20240301_143025.sql.gz

# Prueba sin cambios (dry-run)
./restore.sh --dry-run database_20240301_143025.sql.gz
```

---

## 📊 Monitoreo y Logs

### Estructura de Logs
```
scanqueue/
├── backend/logs/
│   ├── error.log
│   ├── access.log
│   └── audit.log
├── docker-compose.prod.yml (logs JSON)
└── health-check.log
```

### Ver Logs

```bash
# Todos los servicios en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Específico
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f nginx

# Últimas N líneas
docker-compose -f docker-compose.prod.yml logs --tail=50 backend

# Seguir solo errores
docker-compose -f docker-compose.prod.yml logs backend | grep -i error
```

### Analizar Logs

```bash
# Buscar errores
docker-compose -f docker-compose.prod.yml logs backend | grep -i "error"

# Ver logs de acceso (API)
docker-compose -f docker-compose.prod.yml logs backend | grep "GET\|POST\|PUT\|DELETE"

# Contar errores
docker-compose -f docker-compose.prod.yml logs backend | grep -i "error" | wc -l

# Ver requests lentos
docker-compose -f docker-compose.prod.yml logs backend | awk -F'rt=' '{print $2}' | head -20
```

### Monitoring en Tiempo Real

```bash
# Dashboard simple con Stats
watch -n 1 'docker-compose -f docker-compose.prod.yml ps'

# Ver uso de CPU/RAM
docker stats

# Salida esperada:
# CONTAINER       CPU %   MEM USAGE / LIMIT
# scanqueue-nginx  0.1%   15MB / 256MB
# scanqueue-backend 0.3%  50MB / 512MB
# scanqueue-postgres 0.4% 80MB / 1GB
```

---

## 🔧 Troubleshooting

### Problema: Backend no inicia

```bash
# Ver logs del backend
docker-compose -f docker-compose.prod.yml logs backend

# Causas comunes:
# 1. Base de datos no está lista
sleep 10
docker-compose -f docker-compose.prod.yml restart backend

# 2. Puerto 5000 en uso
lsof -i :5000
sudo kill -9 <PID>

# 3. Variables .env incorrectas
grep DATABASE_ .env.production
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

### Problema: PostgreSQL no inicia

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs postgres

# Causas comunes:
# 1. Volumen corrompido
docker-compose -f docker-compose.prod.yml down -v  # ⚠️ Eliminará datos
docker-compose -f docker-compose.prod.yml up -d postgres

# 2. Contraseña incorrecta
grep DATABASE_PASSWORD .env.production

# 3. Sin espacio en disco
df -h | grep /var/lib/docker
```

### Problema: Frontend muestra error 404

```bash
# Verificar que existe
curl http://localhost/index.html

# Verificar que Nginx está corriendo
docker-compose -f docker-compose.prod.yml ps nginx

# Verificar configuración de Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Ver logs
docker-compose -f docker-compose.prod.yml logs nginx
```

### Problema: SSL Certificate Error

```bash
# Verificar certificado
./generate-certs.sh info

# Si está expirado:
./generate-certs.sh self-signed  # Para testing

# O para Let's Encrypt:
./generate-certs.sh letsencrypt tudominio.com admin@tudominio.com

# Reiniciar Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Problema: Discos Llenos

```bash
# Ver uso de disco
df -h

# Limpiar contenedores parados
docker container prune -f

# Limpiar imágenes no usadas
docker image prune -f

# Ver tamaño de volúmenes
docker volume ls -vf dangling=true

# Limpiar logs de Docker (CUIDADO)
sudo sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'
```

---

## 🔄 Actualización de Sistema

### Actualizar ScanQueue

```bash
# 1. Hacer backup
./backup.sh

# 2. Obtener últimos cambios
git pull origin main

# 3. Rebuild y deploy
./deploy.sh --build

# 4. Ejecutar migraciones si hay
./deploy.sh --migrate

# 5. Verificación
./health-check.sh
```

### Actualizar Docker/Docker Compose

```bash
# Actualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Verificar
docker --version

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

### Renovar Certificado Let's Encrypt

```bash
# Renovación manual
./generate-certs.sh renew

# Automática (recomendado)
./generate-certs.sh auto-renewal
crontab -e
# Agregar: 0 2 * * * /home/scanqueue/scanqueue/renew-certs-auto.sh
```

---

## 📈 Escalabilidad

### Configuración Actual (1-1000 usuarios)

```
- 1 Nginx (reverse proxy)
- 1 Backend Node.js
- 1 PostgreSQL
- 2GB RAM mínimo
```

### Escalar a Múltiples Instancias Backend

```yaml
# En docker-compose.prod.yml, agregar:
backend2:
  build: ./backend
  environment:
    [...mismas variables...]
    PORT: 5001
  depends_on:
    - postgres
  networks:
    - scanqueue-network

backend3:
  build: ./backend
  environment:
    [...mismas variables...]
    PORT: 5002
  depends_on:
    - postgres
  networks:
    - scanqueue-network

# En nginx.conf, agregar:
upstream backend {
    least_conn;
    server backend:5000 max_fails=3 fail_timeout=30s;
    server backend2:5001 max_fails=3 fail_timeout=30s;
    server backend3:5002 max_fails=3 fail_timeout=30s;
}
```

### Agregar Redis para Cache

```yaml
# En docker-compose.prod.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
  networks:
    - scanqueue-network

# En .env.production
REDIS_ENABLED=true
REDIS_HOST=redis
REDIS_PORT=6379
```

### Usar CDN para Assets Estáticos

```bash
# Subir /dist al CDN (Cloudflare, AWS CloudFront, etc.)
# Configurar en frontend para servir desde CDN

# Ejemplo con Cloudflare:
VITE_CDN_URL=https://cdn.tudominio.com
# Los assets se cargan desde CDN en lugar del servidor
```

### Monitoreo Avanzado con Prometheus

```bash
# Agregar en docker-compose.prod.yml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus-data:/prometheus
  ports:
    - "9090:9090"
  networks:
    - scanqueue-network

# Acceder: http://localhost:9090
```

---

## 📞 Soporte y Recursos

### Comandos Útiles
```bash
# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Entrar a contenedor
docker-compose -f docker-compose.prod.yml exec backend bash

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Parar
docker-compose -f docker-compose.prod.yml down

# Iniciar
docker-compose -f docker-compose.prod.yml up -d
```

### Archivos Importantes
```
scanqueue/
├── docker-compose.prod.yml    ← Configuración principal
├── nginx.conf                 ← Reverse proxy
├── .env.production            ← Variables de entorno (SECRETO)
├── deploy.sh                  ← Script de deployment
├── backup.sh                  ← Backups
├── restore.sh                 ← Restauración
├── health-check.sh            ← Monitoreo
└── generate-certs.sh          ← Certificados SSL
```

### Contactos
- **Issues**: https://github.com/tuorganizacion/scanqueue/issues
- **Email**: soporte@tudominio.com
- **Documentación**: https://docs.tudominio.com

---

**Versión**: 1.0.0  
**Última actualización**: 2024-03-01  
**Mantener actualizado para producción**
