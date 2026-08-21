@echo off
title Iniciar Sistema POS-Inventario
echo ============================================
echo    Iniciando Sistema POS-Inventario
echo ============================================
echo.

echo Iniciando backend...
start /min "Backend POS" cmd /k "cd /d %~dp0backen && npm run dev"

echo Iniciando frontend...
start /min "Frontend POS" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Esperando a que el servidor este listo...
timeout /t 5

echo Abriendo el navegador...
start http://localhost:5174/

echo.
echo NO CIERRE las ventanas minimizadas.