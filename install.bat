@echo off
REM ScanQueue - Windows Setup
REM Script de instalación automática para Windows

cls

echo.
echo. ╔════════════════════════════════════════╗
echo. ║  🚀 ScanQueue Setup (Windows)         ║
echo. ║  Sistema de Cola en Tiempo Real       ║
echo. ╚════════════════════════════════════════╝
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo. ❌ Node.js no está instalado
    echo. Descárgalo desde: https://nodejs.org
    pause
    exit /b 1
)

echo. ✅ Node.js encontrado
echo. ✅ npm encontrado
echo.

REM Instalar Frontend
echo. 📦 Instalando Frontend...
cd frontend
call npm install
echo. ✅ Frontend instalado
cd ..
echo.

REM Instalar Backend
echo. 📦 Instalando Backend...
cd backend
call npm install
echo. ✅ Backend instalado
cd ..
echo.

REM Crear .env si no existe
if not exist backend\.env (
    echo. 📝 Creando .env del backend...
    copy backend\.env.example backend\.env >nul
)

if not exist frontend\.env (
    echo. 📝 Creando .env del frontend...
    copy frontend\.env.example frontend\.env >nul
)

echo.
echo. ═════════════════════════════════════════
echo. ✅ Instalación completada
echo. ═════════════════════════════════════════
echo.
echo. 🚀 Para iniciar los servidores:
echo.
echo.    Opción 1: Manual (Recomendado)
echo.    ─────────────────────────────────
echo.    Terminal 1 (Backend):
echo.    cd backend
echo.    npm run dev
echo.
echo.    Terminal 2 (Frontend):
echo.    cd frontend
echo.    npm run dev
echo.
echo.    Opción 2: Script de inicio
echo.    ───────────────────────────
echo.    start-dev.bat
echo.
echo. 📱 Luego abre: http://localhost:3000
echo.
pause
