# 📖 Scripts de Deployment - README

Estos son todos los scripts necesarios para desplegar y mantener ScanQueue en producción.

## 📜 Scripts Disponibles

### 🚀 Deployment & Setup

| Script | Uso | Tiempo | Datos |
|--------|-----|--------|-------|
| `setup-production.sh` | Setup inicial (primero!) | 2 min | No destruye |
| `deploy.sh` | Deploy principal | 3-5 min | Actualiza datos |
| `./deploy.sh --full` | Setup completo (primera vez) | 5-10 min | Crea datos |
| `./deploy.sh --build` | Solo rebuild e inicio | 3 min | Mantiene datos |
| `./deploy.sh --migrate` | Ejecutar migraciones BD | 1 min | Evoluciona datos |

### 💾 Backup & Restore

| Script | Uso | Tiempo | Datos |
|--------|-----|--------|-------|
| `backup.sh` | Hacer backup manual | 1 min | No destruye |
| `restore.sh <file>` | Restaurar desde backup | 2 min | REEMPLAZA datos |
| Automático | Crontab cada 2 AM | 1 min | No destruye |

### 🔍 Monitoreo & Verificación

| Script | Uso | Tiempo | Datos |
|--------|-----|--------|-------|
| `health-check.sh` | Check de servicios | 10 sec | No destruye |
| `./health-check.sh --continuous` | Monitoreo en vivo | ∞ | No destruye |
| `monitor.sh` | Dashboard interactivo | ∞ | No destruye |

### 🔐 SSL & Certificados

| Script | Uso | Tiempo | Datos |
|--------|-----|--------|-------|
| `generate-certs.sh self-signed` | Certs auto-firmados | 10 sec | No destruye |
| `generate-certs.sh letsencrypt <domain> <email>` | Let's Encrypt | 1 min | No destruye |
| `./generate-certs.sh auto-renewal` | Auto-renovar certificados | 30 sec | No destruye |
| `./generate-certs.sh info` | Ver info certificado | 5 sec | No destruye |

---

## 🏃 Guía Rápida por Escenario

### Escenario 1: Primera Instalación

```bash
# 1. Setup
./setup-production.sh

# 2. Configurar
nano .env.production  # Cambiar valores críticos

# 3. Deploy completo
./deploy.sh --full

# 4. Verificar
./health-check.sh
```

### Escenario 2: Actualizar Código

```bash
# 1. Obtener cambios
git pull

# 2. Backup preventivo
./backup.sh

# 3. Redeploy
./deploy.sh --build

# 4. Verificar
./health-check.sh
```

### Escenario 3: Migraciones de BD

```bash
# Si hay cambios en schema de BD
./deploy.sh --migrate

# O con rebuild
./deploy.sh --build --migrate
```

### Escenario 4: Backup & Restore

```bash
# Backup manual
./backup.sh

# Restaurar desde backup
./restore.sh database_20240301_143025.sql.gz
# Pedir confirmación

# O sin confirmación (scripting)
./restore.sh --force database_20240301_143025.sql.gz
```

### Escenario 5: Monitoreo Continuo

```bash
# Health check una sola vez
./health-check.sh

# Monitoreo cada 30 segundos
./health-check.sh --continuous

# Dashboard interactivo
./monitor.sh
```

### Escenario 6: Renovar Certificado SSL

```bash
# Mostrar info actual
./generate-certs.sh info

# Renovar Let's Encrypt
./generate-certs.sh renew

# Configurar auto-renovación en crontab
./generate-certs.sh auto-renewal
crontab -e
# Agregar: 0 2 * * * /ruta/renew-certs-auto.sh
```

---

## ⚙️ Hacer Scripts Ejecutables

En Linux/macOS:

```bash
chmod +x *.sh
```

En Windows (WSL/Git Bash):

```bash
# Los archivos vienen con permisos de ejecución
# Si no:
git update-index --chmod=+x *.sh
```

---

## 📊 Ver Estado sin Ejecutar Deploy

```bash
# Ver contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs --tail=10

# Ver recursos
docker stats --no-stream
```

---

## 🔄 Orden Recomendado de Ejecución

1. **Primera vez**:
   - `setup-production.sh` ← Preparar
   - Edit `nano .env.production` ← Configurar
   - `deploy.sh --full` ← Deploy
   - `health-check.sh` ← Verificar

2. **Mantenimiento diario**:
   - `health-check.sh` ← Check
   - `monitor.sh` ← Monitorear
   - Automático: `backup.sh` cada 2 AM

3. **Actualizar código**:
   - `git pull` ← Get latest
   - `backup.sh` ← Backup preventivo
   - `deploy.sh --build` ← Redeploy
   - `health-check.sh` ← Verify

4. **Emergencia**:
   - `restore.sh <file>` ← Restore from backup
   - `./health-check.sh --continuous` ← Monitor

---

## 🆘 Solucionar de Problemas

```bash
# Ver logs completos
docker-compose -f docker-compose.prod.yml logs backend | head -100

# Buscar errores específicos
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Ver estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Entrar a contenedor
docker-compose -f docker-compose.prod.yml exec backend bash

# Más ayuda
cat TROUBLESHOOTING.md
```

---

## 📚 Documentación Completa

| Archivo | Contenido |
|---------|-----------|
| `DEPLOYMENT.md` | Guía de deployment completa (3000+ palabras) |
| `QUICKSTART.md` | Setup en 30 minutos |
| `TROUBLESHOOTING.md` | Problemas comunes y soluciones |
| `UPGRADE.md` | Actualizar versiones de ScanQueue |
| `README.md` | Información general del proyecto |

---

## 🎯 Checklist Diario

```
☐ Ejecutar: ./health-check.sh
☐ Ver logs: docker-compose logs --tail=20 backend
☐ CPU/Memoria: docker stats --no-stream
☐ Espacio disco: df -h /var/lib/docker
☐ Certificados: ./generate-certs.sh info

# Si algo está mal:
☐ Contactar soporte
☐ Hacer backup: ./backup.sh
☐ Ver troubleshooting: cat TROUBLESHOOTING.md
```

---

## 📞 Soporte

- **Issues**: https://github.com/tuorg/scanqueue/issues
- **Email**: soporte@tudominio.com
- **Documentación**: Ver archivos .md

---

**Versión**: 1.0.0  
**Última actualización**: 2024-03-01
