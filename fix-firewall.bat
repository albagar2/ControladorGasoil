@echo off
title Configurar Firewall - Control Gasoil Familiar

:: Verificar privilegios de Administrador
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Solicitando permisos de Administrador...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

echo ######################################################
echo CONFIGURANDO REGLAS DE FIREWALL
echo ######################################################
echo.

:: Ejecutar comandos de PowerShell para abrir los puertos
powershell -Command "New-NetFirewallRule -DisplayName 'Permitir Angular (Gasoil)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4200 -ErrorAction SilentlyContinue"
powershell -Command "New-NetFirewallRule -DisplayName 'Permitir Backend (Gasoil)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001 -ErrorAction SilentlyContinue"

echo.
echo ######################################################
echo REGLAS CONFIGURADAS CORRECTAMENTE
echo Ya puedes intentar acceder desde el movil.
echo ######################################################
echo.
pause
