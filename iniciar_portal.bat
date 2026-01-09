@echo off
setlocal
cd /d %~dp0
echo ========================================
echo   Iniciando Portal Municipal
echo ========================================

echo 1. Verificando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    if NOT "%%a"=="" (
        echo    Limpiando puerto 3000 (proceso %%a^)...
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo 2. Verificando dependencias...
if not exist node_modules (
    echo    Instalando dependencias (esto solo ocurre la primera vez^)...
    call npm install
)

echo 3. Lanzando servidor...
start http://localhost:3000
node server.js
pause
