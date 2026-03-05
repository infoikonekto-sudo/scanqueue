# 🆘 TROUBLESHOOTING.md - Guía de Solución de Problemas

## Tabla de Contenidos

1. [Problemas de Instalación](#problemas-de-instalación)
2. [Problemas de Servicios](#problemas-de-servicios)
3. [Problemas de Base de Datos](#problemas-de-base-de-datos)
4. [Problemas de Certificados SSL](#problemas-de-certificados-ssl)
5. [Problemas de Performance](#problemas-de-performance)
6. [Problemas de Red](#problemas-de-red)
7. [Problemas de Seguridad](#problemas-de-seguridad)

---

## 🔧 Problemas de Instalación

### Error: "docker: command not found"

**Síntomas**: No puedo ejecutar comandos de Docker

**Solución**:
```bash
# Verificar instalación
which docker

# Si no existe, instalar
curl -fsSL https://get.docker.com | sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
```

### Error: "Permission denied while trying to connect to Docker daemon"

**Síntomas**: `Got permission denied while trying to connect to the Docker daemon socket`

**Solución**:
```bash
# Opción 1: Agregar usuario al grupo (RECOMENDADO)
sudo usermod -aG docker $USER
newgrp docker

# Opción 2: Usar sudo (NO RECOMENDADO)
sudo docker ps

# Opción 3: Verificar socket
ls -l /var/run/docker.sock
```

### Error: ".env.production not found"

**Síntomas**: `ERROR: Archivo .env.production no encontrado`

**Solución**:
```bash
# Copiar del ejemplo
cp .env.production.example .env.production

# Editar valores críticos
nano .env.production

# Validar que no hay valores por defecto
grep "CAMBIAR_ESTO" .env.production
# Debe estar vacío
```

### Error: "No space left on device"

**Síntomas**: Docker no puede escribir, errores de espacio

**Solución**:
```bash
# Ver espacio disponible
df -h

# Ver uso de Docker
docker system df

# Limpiar
docker system prune -a

# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Limpiar volúmenes no usados (CUIDADO - elimina datos)
docker volume prune

# Usar herramientas de limpieza
sudo apt clean
sudo apt autoclean
```

---

## 🚀 Problemas de Servicios

### Error: "backend is not running"

**Síntomas**: El contenedor backend no inicia

**Diagnóstico**:
```bash
# Ver logs del backend
docker-compose -f docker-compose.prod.yml logs backend

# Tipos de errores comunes:
```

**Soluciones**:

1. **Puerto ocupado**:
```bash
# Ver qué usa puerto 5000
sudo lsof -i :5000

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en .env.production
PORT=5001
```

2. **Dependencia no lista (PostgreSQL)**:
```bash
# Esperar más tiempo
sleep 15
docker-compose -f docker-compose.prod.yml up -d

# Aumentar timeout en docker-compose.prod.yml
service_healthy:
  condition: service_healthy
```

3. **Variables de entorno faltantes**:
```bash
# Verificar NODE_ENV
grep NODE_ENV .env.production

# Verificar DATABASE_URL
echo "DATABASE_URL=postgres://$(grep DATABASE_USER .env.production | cut -d= -f2):$(grep DATABASE_PASSWORD .env.production | cut -d= -f2)@postgres:5432/$(grep DATABASE_NAME .env.production | cut -d= -f2)"
```

4. **Error del módulo npm**:
```bash
# Reconstruir
docker-compose -f docker-compose.prod.yml build --no-cache backend

# Espacio: limpiar caché pip
docker system prune -a
```

### Error: "nginx not starting"

**Síntomas**: `FAILED 502 Bad Gateway` o nginx no inicia

**Solución**:
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs nginx

# Validar configuración de nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Verifica que apunta a contenedores correctos:
# backend:5000 debe existir
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:5000/api/health

# Reiniciar
docker-compose -f docker-compose.prod.yml restart nginx
```

### Error: "frontend not building"

**Síntomas**: Frontend no inicia, `ENOENT: no such file`

**Solución**:
```bash
# Limpiar cache build
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Ver logs de build
docker-compose -f docker-compose.prod.yml build frontend 2>&1 | tail -50

# Verificar que frontend/package.json existe
ls -la frontend/package.json

# Verificar versión Node
grep "node" frontend/package.json
```

---

## 💾 Problemas de Base de Datos

### Error: "Cannot connect to PostgreSQL"

**Síntomas**: `ECONNREFUSED` en logs backend

**Diagnóstico**:
```bash
# Ver si PostgreSQL está corriendo
docker-compose -f docker-compose.prod.yml ps postgres

# Ver logs
docker-compose -f docker-compose.prod.yml logs postgres

# Probar conexión
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

**Soluciones**:

1. **PostgreSQL no inicia**:
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs postgresql

# Posible corrupción de volumen
docker-compose -f docker-compose.prod.yml down
docker volume rm scanqueue_postgres_data  # DESTRUYE DATOS
docker-compose -f docker-compose.prod.yml up -d postgres

# Restaurar desde backup
./restore.sh database_FECHA.sql.gz
```

2. **Contraseña incorrecta**:
```bash
# Verificar en .env.production
grep DATABASE_PASSWORD .env.production

# Verificar que se pasó correctamente a contenedor
docker-compose -f docker-compose.prod.yml exec postgres psql -U scanqueue scanqueue -c "SELECT 1"

# Cambiar contraseña en PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue \
  -c "ALTER USER scanqueue WITH PASSWORD 'new_password';"

# Actualizar .env.production
sed -i 's/DATABASE_PASSWORD=.*/DATABASE_PASSWORD=new_password/' .env.production
```

3. **Tabla no existe**:
```bash
# Verificar tablas
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue -c "\dt"

# Detectar: si está vacío, las migraciones no corrieron
./deploy.sh --migrate
```

### Error: "Database query timeout"

**Síntomas**: Requests lentos, timeouts en API

**Solución**:
```bash
# Aumentar timeout en backend
grep "QUERY_TIMEOUT\|DATABASE_TIMEOUT" .env.production

# O agregar:
# DATABASE_POOL_TIMEOUT=30000

# Optimizar queries
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue \
  -c "SELECT * FROM pg_stat_statements WHERE mean_exec_time > 1000 ORDER BY mean_exec_time DESC LIMIT 10;"

# Recrear índices
docker-compose -f docker-compose.prod.yml exec backend \
  npm run db:reindex
```

### Error: "Disk quota exceeded"

**Síntomas**: `ENOSPC`, base de datos no guarda

**Solución**:
```bash
# Ver tamaño BD
docker-compose -f docker-compose.prod.yml exec postgres \
  du -sh /var/lib/postgresql/data

# Limpiar logs antiguos
docker-compose -f docker-compose.prod.yml exec postgres \
  vacuumdb -U scanqueue -d scanqueue

# Ver archivos pesados
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue \
  -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) \
      FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 🔐 Problemas de Certificados SSL

### Error: "SSL_ERROR_INTERNAL_ERROR_ALERT"

**Síntomas**: Navegador muestra advertencia SSL

**Solución**:
```bash
# Ver información del certificado
./generate-certs.sh info

# Si está expirado (días = negativo)
./generate-certs.sh renew

# O generar nuevo
./generate-certs.sh self-signed tudominio.com

# Reiniciar Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Error: "Unable to obtain certificate from Let's Encrypt"

**Síntomas**: Fallo al generar certificado Let's Encrypt

**Solución**:
```bash
# Verificar que puerto 80 está abierto (requerido por Certbot)
sudo netstat -tlnp | grep :80

# Matar cualquier cosa en puerto 80
sudo lsof -i :80
sudo kill -9 <PID>

# O usar modo DNS (si no tienes puerto 80 accesible)
./generate-certs.sh letsencrypt tudominio.com admin@mail.com --dns

# Verificar DNS records
nslookup tudominio.com
```

### Error: "CERTIFICATE_VERIFY_FAILED"

**Síntomas**: Clientes no pueden conectar, error de verificación

**Solución**:
```bash
# Para clientes Node.js, agregar en .env.production:
NODE_TLS_REJECT_UNAUTHORIZED=0  # Solo testing!

# Mejor: usar certificados válidos
./generate-certs.sh letsencrypt tudominio.com admin@tudominio.com

# Verificar certificado con OpenSSL
openssl s_client -connect localhost:443 -showcerts
```

### Error: "Mixed content blocked"

**Síntomas**: Frontend carga pero APIs fallan (HTTPS a HTTP)

**Solución**:
```bash
# Verificar HTTPS en .env.production
grep VITE_API_URL .env.production
# Debe ser: https://... no http://

grep VITE_WS_URL .env.production
# Debe ser: wss://... no ws://

# Actualizar y redeploy
nano .env.production
./deploy.sh --build
```

---

## ⚡ Problemas de Performance

### Problema: "Página carga lentamente"

**Síntomas**: Navegador dice "Waiting for server"

**Diagnóstico**:
```bash
# Con curl, medir tiempo de respuesta
time curl https://tudominio.com/

# Esperado: < 1 segundo

# Ver estadísticas de Nginx
docker-compose -f docker-compose.prod.yml logs nginx | grep "request_time"
```

**Soluciones**:

1. **Backend lento**:
```bash
# Ver CPU/Memoria
docker stats --no-stream scanqueue-backend

# Si CPU > 50%, optimizar código o escalar
# Ver queries lentas en BD

# Aumentar réplicas del backend
# (ver sección Escalabilidad en DEPLOYMENT.md)
```

2. **Base de datos lenta**:
```bash
# Ver queries lentas
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue \
  -c "SELECT mean_exec_time, calls, query FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Crear índices faltantes
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U scanqueue -d scanqueue \
  -c "EXPLAIN ANALYZE SELECT * FROM students WHERE school_id = 1;"
```

3. **Red lenta**:
```bash
# Verificar latencia
ping tudominio.com

# Si > 100ms, problema de red o DNS
nslookup tudominio.com

# Ver si estás usando CDN
curl -I https://tudominio.com | grep -i "x-served-by\|server"
```

### Problema: "Memoria llena"

**Síntomas**: OOM killer, servicios se reinician solos

**Solución**:
```bash
# Ver memoria en uso
docker stats --no-stream

# Establecer límites en docker-compose.prod.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

# Restart para aplicar
docker-compose -f docker-compose.prod.yml up -d

# Ver si hay memory leaks en Node
docker-compose -f docker-compose.prod.yml exec backend \
  ps aux | grep node
```

### Problema: "Alta latencia de API"

**Síntomas**: Requests tardan > 5 segundos

**Solución**:
```bash
# Monitorear en tiempo real
watch -n 1 'docker-compose -f docker-compose.prod.yml logs --tail=5 backend | grep request_time'

# Ver requests lentas específicamente
docker-compose -f docker-compose.prod.yml logs backend | awk -F'rt=' '{if ($2 > 5000) print $0}'

# Aumentar pool de conexiones BD
grep DATABASE_POOL .env.production
# Aumentar DATABASE_POOL_MAX

# Agregar caché Redis
REDIS_ENABLED=true
REDIS_HOST=redis
```

---

## 🌐 Problemas de Red

### Error: "Cannot reach domain"

**Síntomas**: `Connection refused` o timeout

**Diagnóstico**:
```bash
# Verificar DNS
nslookup tudominio.com
# Debe mostrar la IP de tu servidor

# Verificar conectividad
ping tudominio.com

# Desde otra máquina
curl -v https://tudominio.com
```

**Soluciones**:

1. **DNS no resuelve**:
```bash
# Cambiar registros DNS en tu proveedor
# Apuntar a la IP de tu servidor

# Verificar propagación
dig tudominio.com
nslookup tudominio.com

# Esperar 24-48 horas para propagación total
```

2. **Firewall bloquea puertos**:
```bash
# Verificar puertos abiertos
sudo iptables -L -n | grep -E "80|443"

# O si usas UFW
sudo ufw status

# Abrir puertos
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH

# Reload firewall
sudo ufw reload
```

3. **Nginx no escucha en puerto 80/443**:
```bash
# Ver puertos en escucha
sudo netstat -tlnp | grep nginx

# Esperado:
# tcp 0 0 0.0.0.0:80 LISTEN
# tcp 0 0 0.0.0.0:443 LISTEN

# Si no, reiniciar Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Error: "CORS error"

**Síntomas**: `No 'Access-Control-Allow-Origin' header`

**Solución**:
```bash
# Verificar CORS_ORIGIN en .env.production
grep CORS_ORIGIN .env.production

# Debe ser tu dominio real:
CORS_ORIGIN=https://tudominio.com

# Actualizar
nano .env.production

# Redeploy
./deploy.sh --build

# Verificar header en respuesta
curl -I https://tudominio.com/api/health
# Debe incluir: Access-Control-Allow-Origin: https://tudominio.com
```

---

## 🔒 Problemas de Seguridad

### Alerta: "Insecure password detected"

**Síntomas**: Sistema detecta contraseña débil

**Solución**:
```bash
# Regenerar contraseñas fuertes
openssl rand -base64 32

# Actualizar en .env.production
DATABASE_PASSWORD=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=$(openssl rand -base64 20)

nano .env.production

# Redeploy
./deploy.sh --build
```

### Advertencia: "Self-signed certificate"

**Síntomas**: Navegador muestra advertencia (con self-signed)

**Solución**:
```bash
# Para testing: agregar excepción en navegador

# Para producción: usar Let's Encrypt
./generate-certs.sh letsencrypt tudominio.com admin@tudominio.com

# Renovación automática
./generate-certs.sh auto-renewal
crontab -e
# Agregar: 0 2 * * * /ruta/renew-certs-auto.sh
```

### Error: "Unauthorized 401"

**Síntomas**: APIs devuelven 401 aunque estoy logueado

**Solución**:
```bash
# Verificar JWT_SECRET es igual en backend
grep JWT_SECRET .env.production
docker-compose -f docker-compose.prod.yml exec backend env | grep JWT_SECRET

# Si diferente, regenerar y redeploy
JWT_SECRET=$(openssl rand -base64 32)
nano .env.production
./deploy.sh --build
```

---

## 📝 Checklista de Debug

2. Reiniciar servicios: `docker-compose -f docker-compose.prod.yml restart`
3. Ver logs: `docker-compose -f docker-compose.prod.yml logs -f | head -100`
4. Ejecutar health checks: `./health-check.sh`
5. Buscar en google: `"ScanQueue" + "error message"`
6. Contactar soporte: soporte@tudominio.com

---

**Versión**: 1.0.0  
**Última actualización**: 2024-03-01
