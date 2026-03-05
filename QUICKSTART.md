# 🚀 QUICKSTART - Deployment en 30 Minutos

Este es un **guide ultra-rápido** para desplegar ScanQueue en producción.

## ⏱️ En 5 minutos

```bash
# 1. Setup inicial
./setup-production.sh

# 2. Configurar valores críticos
nano .env.production
# Reemplazar:
# - DATABASE_PASSWORD
# - JWT_SECRET
# - CORS_ORIGIN=tu_dominio.com

# Guardar: Ctrl+X → Y → Enter

# 3. Deploy
./deploy.sh --full

# 4. Verificar
./health-check.sh
```

**Resultado esperado**: Sistema online en `https://tu_dominio.com`

---

## 📋 Checklist Pre-Deployment

- [ ] Docker instalado (`docker --version`)
- [ ] Docker Compose instalado (`docker-compose --version`)
- [ ] 2GB RAM mínimo disponible
- [ ] 20GB disco disponible
- [ ] Dominio DNS configurado (o usar IP)

---

## 🔑 Variables Críticas a Cambiar

| Variable | Ejemplo | Cómo Generar |
|----------|---------|-------------|
| `DATABASE_PASSWORD` | `aB3$K9pL2@mX` | `openssl rand -base64 24` |
| `JWT_SECRET` | `x9kL2@mX3$aB3K` | `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://miescuela.com` | Tu dominio real |
| `ADMIN_PASSWORD` | `Pwd@2024#Secure` | Contraseña fuerte |

---

## 📦 Archivos Generados

Después del setup, verás:

```
scanqueue/
├── ✅ docker-compose.prod.yml     ← Configuración principal
├── ✅ Dockerfile.backend          ← Imagen del servidor
├── ✅ Dockerfile.frontend         ← Imagen del sitio web
├── ✅ nginx.conf                  ← Proxy inverso
├── ✅ .env.production             ← Variables de entorno (SECRETO)
├── ✅ certs/                      ← Certificados SSL
├── ✅ deploy.sh                   ← Comando deployment
├── ✅ backup.sh                   ← Backups automáticos
├── ✅ restore.sh                  ← Restaurar desde backup
├── ✅ health-check.sh             ← Monitoreo
├── ✅ generate-certs.sh           ← Generar nuevos certificados
├── ✅ setup-production.sh         ← Setup inicial
└── ✅ monitor.sh                  ← Dashboard en tiempo real
```

---

## 🚀 Comandos Más Comunes

```bash
# Ver que todo está corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs del backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Parar servicios
docker-compose -f docker-compose.prod.yml down

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Backup manual
./backup.sh

# Dashboard en tiempo real
./monitor.sh
```

---

## 🔒 Seguridad Básica

✅ **Ya configurado automáticamente**:
- HTTPS/SSL con Nginx
- Rate limiting
- CORS protegido
- Security headers

⚠️ **Debes configurar**:
- `CORS_ORIGIN` → Tu dominio
- `JWT_SECRET` → Contraseña fuerte
- `DATABASE_PASSWORD` → Contraseña segura
- `ADMIN_PASSWORD` → Contraseña única

---

## 📞 URLs Después de Deploy

```
Frontend:   https://tu_dominio.com
API:        https://tu_dominio.com/api
WebSocket:  wss://tu_dominio.com/ws
Health:     https://tu_dominio.com/api/health
```

---

## ✅ Verificar Que Todo Funciona

```bash
# 1. Health check
./health-check.sh

# Esperado: Todos los servicios en ✓

# 2. Abrir en navegador
# https://tu_dominio.com

# 3. Login
# usuario: admin@tudominio.com
# contraseña: (la que pusiste en ADMIN_PASSWORD)
```

---

## 🆘 Algo Salió Mal?

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs backend | tail -50

# Reinicar todo
docker-compose -f docker-compose.prod.yml restart

# O resetear completamente
docker-compose -f docker-compose.prod.yml down
./deploy.sh --full
```

---

## 📚 Documentación Completa

- **DEPLOYMENT.md**: Guía completa (3000+ palabras)
- **TROUBLESHOOTING.md**: Problemas y soluciones
- **UPGRADE.md**: Actualizar versiones
- **README.md**: Información general

---

**¿Necesitas ayuda?**
- Ver TROUBLESHOOTING.md
- Comando: `./health-check.sh`
- Email: soporte@tudominio.com
