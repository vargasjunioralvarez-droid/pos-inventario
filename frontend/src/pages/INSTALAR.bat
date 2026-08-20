@echo off
title Instalador del Sistema POS-Inventario
echo ============================================
echo    Instalacion del Sistema POS-Inventario
echo ============================================
echo.

REM Verificar que Node.js este instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que PostgreSQL este instalado
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] PostgreSQL no esta en el PATH.
    echo Asegurese de tener PostgreSQL instalado y configurado.
)

echo.
echo [1/6] Instalando dependencias del backend...
cd backen
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron instalar las dependencias del backend.
    pause
    exit /b 1
)

echo.
echo [2/6] Generando cliente de Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo generar el cliente de Prisma.
    pause
    exit /b 1
)

echo.
echo [3/6] Aplicando migraciones a la base de datos...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron aplicar las migraciones.
    echo Verifique que la base de datos existe y las credenciales en .env son correctas.
    pause
    exit /b 1
)

echo.
echo [4/6] Creando usuario administrador...
if exist seed.js (
    call node seed.js
) else (
    echo [AVISO] No se encontro seed.js. Debera crear el usuario admin manualmente.
)

echo.
echo [5/6] Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron instalar las dependencias del frontend.
    pause
    exit /b 1
)

echo.
echo [6/6] Compilando el frontend para produccion...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo compilar el frontend.
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo    Instalacion completada exitosamente!
echo ============================================
echo.
echo Para iniciar el sistema, ejecute INICIAR.bat
echo.
pause