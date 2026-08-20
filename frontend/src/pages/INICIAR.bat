@echo off
title Iniciar Sistema POS-Inventario
echo ============================================
echo    Iniciando Sistema POS-Inventario
echo ============================================
echo.

echo Iniciando backend...
start "Backend POS" cmd /k "cd backen && npm run dev"

echo Iniciando frontend...
start "Frontend POS" cmd /k "cd frontend && npm run dev"

echo.
echo El sistema se esta iniciando en dos ventanas.
echo - Backend: http://localhost:4000
echo - Frontend: http://localhost:5174 (o el puerto que indique Vite)
echo.
echo NO CIERRE estas ventanas mientras use el sistema.
echo.
pause