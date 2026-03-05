@echo off
REM ScanQueue - Windows Development Launcher (Optimizado)
REM Limpia los puertos y abre el servidor de frontend y backend

echo. 🚀 Iniciando ScanQueue en desarrollo...
echo.

REM Verificar que existan las carpetas
if not exist backend (
    echo. ❌ Carpeta backend no encontrada
    pause
    exit /b 1
)

if not exist frontend (
    echo. ❌ Carpeta frontend no encontrada
    pause
    exit /b 1
)

REM Limpieza de puertos para evitar errores EADDRINUSE
echo. 🧹 Limpiando puertos 3000 y 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo. ✅ Puertos listos.

REM Iniciar Backend en nueva ventana
echo. ▶ Abriendo Backend en puerto 5000...
start "ScanQueue Backend" /D backend cmd /c "npm run dev"

REM Esperar un poco para que el backend inicie
timeout /t 2 /nobreak >nul

REM Iniciar Frontend en nueva ventana
echo. ▶ Abriendo Frontend en puerto 3000...
start "ScanQueue Frontend" /D frontend cmd /c "npm run dev"

echo.
echo. ✨ ¡Sistema en funcionamiento! ✨
echo. 📱 Frontend: http://localhost:3000
echo. 🔌 Backend:  http://localhost:5000 (Socket.io)
echo.
echo. No cierres este menú hasta que termines de trabajar.
echo.
pause
