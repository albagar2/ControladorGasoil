@echo off
setlocal enabledelayedexpansion

:: Detectar dirección IPv4 local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
)

if not defined IP (
    echo [ERROR] No se pudo detectar tu IP, usando por defecto 192.168.1.103
    set IP=192.168.1.103
)

echo ######################################################
echo Sincronizando IP %IP% con el codigo...
echo ######################################################

:: Actualizar apiUrl en los archivos de environment de Angular
powershell -Command "(gc src/environments/environment.ts) -replace 'apiUrl: .*', 'apiUrl: ''http://%IP%:3002/api''' | Out-File -encoding utf8 src/environments/environment.ts"
powershell -Command "(gc src/environments/environment.development.ts) -replace 'apiUrl: .*', 'apiUrl: ''http://%IP%:3002/api''' | Out-File -encoding utf8 src/environments/environment.development.ts"

echo.
echo ######################################################
echo Iniciando Control Gasoil Familiar en %IP%
echo ######################################################
echo IMPORTANTE: Si no puedes acceder desde el movil:
echo 1. Permite Node.js en el Firewall de Windows (Privado y Publico)
echo 2. BORRA LA CACHE DEL MOVIL (o usa una pestania de Incognito)
echo 3. Comprueba que tu Wi-Fi esta configurada como PRIVADA (no PUBLICA)
echo ######################################################

:: Iniciar Backend
start "Backend API" cmd /k "cd backend && npm start"

:: Iniciar Frontend
start "Frontend App" cmd /k "ng serve --host 0.0.0.0"

echo Los servidores se estan iniciando...
echo ACCESO DESDE LA RED: http://%IP%:4200
echo Acceso local: http://localhost:4200
echo 
echo Si el movil falla, ejecuta fix-firewall.bat como Administrador.
echo ######################################################
