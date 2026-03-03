@echo off
set IP=192.168.1.103
echo Starting Vehicle Management System on %IP%...

:: Start Backend
start "Backend API" cmd /k "cd backend && npm start"

:: Start Frontend
start "Frontend App" cmd /k "ng serve --host 0.0.0.0"

echo Servers are starting...
echo Backend: http://%IP%:3001
echo Frontend: http://%IP%:4200
echo Local access: http://localhost:4200
