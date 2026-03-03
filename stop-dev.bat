@echo off
echo Deteniendo servidores de Control Gasoil Familiar...

:: Matar procesos por el tÃ­tulo de la ventana que pusimos en start-dev.bat
taskkill /F /FI "WINDOWTITLE eq Backend API*" /T
taskkill /F /FI "WINDOWTITLE eq Frontend App*" /T

:: Por si acaso, liberar los puertos directamente
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do taskkill /F /PID %%a 2>nul

echo Servidores detenidos correctamente.
pause
