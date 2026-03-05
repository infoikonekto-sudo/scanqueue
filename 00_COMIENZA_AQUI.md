# 🚀 COMIENZA AQUÍ - ScanQueue Sistema de Llamado Escolar

Bienvenido a **ScanQueue** - Tu sistema inteligente profesional para gestionar el llamado escolar.

> ⏱️ **Tiempo de lectura:** 5 minutos | **Tiempo de setup:** 30 minutos

---

## 📌 Lo que necesitas saber EN 2 MINUTOS

ScanQueue es un **sistema web centralizado** que permite:

✅ **Operador escanea QR** en tablet → 
✅ **Estudiante aparece en cola** (monitor bonito) → 
✅ **Padres recogen a sus hijos** → 
✅ **Sistema registra todo automáticamente** → 
✅ **Soporte para 200+ estudiantes simultáneos**

---

## 🎯 Elige tu camino

### 👨‍💼 Soy ADMINISTRADOR - Quiero usarlo MAÑANA

**Tiempo:** 30 minutos

```bash
# 1. Descarga
git clone https://github.com/tuusuario/scanqueue.git
cd scanqueue

# 2. Configura
cp .env.production.example .env.production
# Edita .env.production con tus datos (contraseña BD, etc)

# 3. Ejecuta
chmod +x deploy.sh
./deploy.sh --full

# ✅ Abre: https://tudominio.com
# Login: admin@scanqueue.local / admin123
```

👉 **Próximo paso:** Lee [backend/README.md](./backend/README.md)

---

### 👨‍💻 Soy DESARROLLADOR - Quiero entender todo

**Tiempo:** 1 hora

```bash
# 1. Frontend (escaneo + cola + admin)
cd frontend
npm install
npm run dev
# Abre: http://localhost:5173

# 2. Backend (en otra terminal)
cd backend
npm install
npm run dev
# Abre: http://localhost:5000

# 3. Base de Datos (si no usas Docker)
# PostgreSQL 13+ ejecutando en localhost:5432
```

👉 **Próximo paso:** Lee [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md)

---

### 🎓 Soy USUARIO FINAL - Solo quiero usar el app

**Tiempo:** 15 minutos

1. **App de Escaneo** (en tablet/celular):
   - Abre: `https://tudominio.com/scanner`
   - Botón grande "📱 ESCANEAR"
   - Apunta a QR → listo ✅

2. **Pantalla de Cola** (en monitor):
   - Abre: `https://tudominio.com/queue`
   - Mira estudiantes aparecer en vivo
   - Bonito y profesional ✅

3. **Admin Panel** (si eres directivo):
   - Abre: `https://tudominio.com/admin`
   - Gestiona todo desde ahí

👉 **Próximo paso:** Llama a tu IT para agregar estudiantes

---

## 🏗️ Qué está incluido

Tu proyecto **COMPLETO** contiene:

### 📱 **Frontend (React)**
```
├── Scanner (QR/Barras) - App responsiva para tablet
├── Queue (Cola viva) - Monitor bonito con actualizaciones
├── Admin Panel - Gestión de estudiantes, reportes, etc.
└── Login - Autenticación segura
```

### 🔧 **Backend (Node.js)**
```
├── API REST (36+ endpoints)
├── WebSocket (actualizaciones en vivo)
├── Base de Datos (PostgreSQL)
├── Validador QR (con corrección de errores)
└── Seguridad (JWT, rate limiting, etc)
```

### 🐳 **Docker**
```
├── docker-compose.prod.yml - Para deploy en 1 comando
├── Dockerfile (Frontend + Backend)
├── Nginx (reverse proxy, SSL)
└── Scripts (backup, restore, health-check)
```

### 📚 **Documentación** (15,000+ palabras)
```
├── README.md - Este archivo
├── QUICKSTART.md - Setup en 30 min
├── DEPLOYMENT.md - Deploy a producción
├── API_REFERENCE.md - Endpoints disponibles
├── TROUBLESHOOTING.md - Solución de problemas
└── ... y mucho más
```

---

## 🎯 Próximos Pasos

### **OPCIÓN A: Quiero empezar ahora mismo (Docker)**

```bash
cd scanqueue
./deploy.sh --full
```

✅ Listo en 5 minutos

👉 **Lee:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

### **OPCIÓN B: Quiero aprender primero (Local)**

```bash
cd scanqueue/backend && npm run dev
# En otra terminal:
cd scanqueue/frontend && npm run dev
```

✅ Listo en 15 minutos

👉 **Lee:** [frontend/ADMIN_PANEL_GUIDE.md](./frontend/ADMIN_PANEL_GUIDE.md)

---

### **OPCIÓN C: Quiero entender la arquitectura**

Abre cada archivo en orden:
1. [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md) - Cómo funciona
2. [backend/API_REFERENCE.md](./backend/API_REFERENCE.md) - Endpoints
3. [frontend/ADMIN_PANEL_GUIDE.md](./frontend/ADMIN_PANEL_GUIDE.md) - Interfaz

✅ Léete todo en 1 hora

---

## ❓ Preguntas Frecuentes (2 minutos)

**P: ¿Cuánto cuesta?**  
R: Gratis (MIT License). Siempre.

**P: ¿Necesito dominio?**  
R: No, funciona con IP local también.

**P: ¿Cuántos estudiantes soporta?**  
R: 200+ simultáneos sin problemas. Escalable a más.

**P: ¿Y si se cae el internet?**  
R: La tablet guarda los escaneos localmente y sincroniza después.

**P: ¿Quién puede ver los datos?**  
R: Solo usuarios autenticados (administradores + operadores).

**P: ¿Cómo respaldo los datos?**  
R: Automático cada noche. También manual: `bash backup.sh`

**P: ¿Se pierde si reinicio?**  
R: No, los datos están en la BD. Reinicia sin miedo.

---

## 📞 Necesito ayuda

| Problema | Solución |
|----------|----------|
| **No sé por dónde empezar** | Lee [QUICKSTART.md](./docs/QUICKSTART.md) |
| **Algo no funciona** | Mira [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) |
| **Pregunta técnica** | Busca en [backend/API_REFERENCE.md](./backend/API_REFERENCE.md) |
| **Error al deploy** | Lee [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| **¿Cómo uso el admin?** | [frontend/ADMIN_PANEL_GUIDE.md](./frontend/ADMIN_PANEL_GUIDE.md) |

---

## 🗺️ Mapa de Archivos Importantes

```
scanqueue/
├── ⭐ README.md                    ← COMENZASTE AQUÍ
├── 📖 00_LEEME_PRIMERO.md          ← También buena opción
│
├── 🚀 deploy.sh                    ← EJECUTA ESTO
├── docker-compose.prod.yml         ← O esto
│
├── backend/
│   ├── README.md                   ← Guía backend
│   ├── ARCHITECTURE.md             ← Cómo funciona
│   └── API_REFERENCE.md            ← Endpoints
│
├── frontend/
│   ├── README.md                   ← Guía frontend
│   ├── ADMIN_PANEL_GUIDE.md        ← Panel administrativo
│   └── vite.config.js              ← Configuración
│
├── docs/
│   ├── QUICKSTART.md               ← 30 min de setup
│   ├── DEPLOYMENT.md               ← Deploy profesional
│   ├── TROUBLESHOOTING.md          ← Solución problemas
│   └── UPGRADE.md                  ← Actualizar versión
│
└── scripts/
    ├── deploy.sh                   ← Deploy automático
    ├── backup.sh                   ← Backup BD
    ├── health-check.sh             ← Verificar status
    └── monitor.sh                  ← Dashboard vivo
```

---

## ⚡ Quick Reference

### Setup Docker (Recomendado)
```bash
./deploy.sh --full
```

### Setup Local (Desarrollo)
```bash
npm install && npm run dev
```

### Ver logs
```bash
docker-compose logs -f backend
```

### Backup
```bash
bash backup.sh
```

### Health check
```bash
bash health-check.sh
```

---

## 🎓 Camino de Aprendizaje Recomendado

**DÍA 1: Instala y usa**
1. Ejecuta `./deploy.sh --full`
2. Abre el admin panel
3. Carga algunos estudiantes de prueba
4. Genera códigos QR

**DÍA 2: Aprende a operar**
1. Lee `frontend/ADMIN_PANEL_GUIDE.md`
2. Prueba escaneo en una tablet
3. Mira la cola en vivo en un monitor
4. Genera tu primer reporte PDF

**DÍA 3: Customización**
1. Carga tu lista de estudiantes real
2. Configura tus rutas de transporte
3. Personaliza horarios y configuración
4. Entrena a tu equipo

**DÍA 4+: Producción**
1. Apunta tu dominio
2. Obtén certificado SSL (Let's Encrypt)
3. Configura backups automáticos
4. Entrena a padres sobre el sistema

---

## 🚨 Problemas Comunes

### ❌ "Docker no está instalado"
```bash
# Instala Docker Desktop desde docker.com
# O en Linux:
sudo apt-get install docker docker-compose
```

### ❌ "Port 80 already in use"
```bash
# Cámbia puerto en docker-compose.prod.yml
# De: 80:80
# A: 8080:80
# Luego: http://localhost:8080
```

### ❌ "PostgreSQL connection failed"
```bash
# Espera 10 segundos y reinintenta
# O revisa .env.production
docker-compose logs postgres
```

### ❌ "No puedo acceder a /admin"
```bash
# Espera a que la BD se inicialice (1-2 min)
# O ejecuta migraciones:
docker-compose exec backend npm run db:migrate
```

---

<div align="center">

## ✅ Listo para empezar?

### Opción 1: Quiero deploy automático
```bash
./deploy.sh --full
```

### Opción 2: Quiero aprender primero
```bash
cd frontend && npm run dev
```

### Opción 3: Necesito toda la documentación
👉 **[Ir a Documentación Completa](./docs/)**

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026  
**Estado:** ✅ Producción lista

[README.md](./README.md) • [QUICKSTART.md](./docs/QUICKSTART.md) • [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

</div>
