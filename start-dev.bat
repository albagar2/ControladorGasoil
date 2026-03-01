@echo off
echo Starting Vehicle Management System...

:: Start Backend
start "Backend API" cmd /k "cd backend && npm start"

:: Start Frontend
start "Frontend App" cmd /k "ng serve -o"

echo Servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:4200
