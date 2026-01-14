@echo off
setlocal enabledelayedexpansion

:: Peacock Webapp - Automatic Installer (Bun Edition)
:: This script automatically installs all dependencies and sets up the webapp

echo.
echo ========================================
echo   Peacock Webapp - Auto Installer
echo ========================================
echo.

:: Check if we are in the webapp directory
if not exist "package.json" (
    echo [ERROR] package.json not found\!
    echo Please run this script from the webapp directory.
    echo.
    pause
    exit /b 1
)

echo [1/6] Checking Bun installation...
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Bun is not installed\!
    echo.
    echo Please install Bun from: https://bun.sh/
    echo Windows: powershell -c "irm bun.sh/install.ps1 | iex"
    echo.
    pause
    exit /b 1
)

:: Get Bun version
for /f "tokens=*" %%i in ('bun --version') do set BUN_VERSION=%%i
echo    Found Bun v%BUN_VERSION%
echo.

echo [2/6] Cleaning previous installations...
if exist "node_modules" (
    echo    Removing old node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
if exist "package-lock.json" (
    echo    Removing old package-lock.json...
    del /f /q package-lock.json >nul 2>&1
)
if exist "pnpm-lock.yaml" (
    echo    Removing old pnpm-lock.yaml...
    del /f /q pnpm-lock.yaml >nul 2>&1
)
if exist "bun.lockb" (
    echo    Removing old bun.lockb...
    del /f /q bun.lockb >nul 2>&1
)
if exist ".next" (
    echo    Removing old build cache...
    rmdir /s /q .next >nul 2>&1
)
echo    Cleanup complete\!
echo.

echo [3/6] Installing dependencies with Bun...
echo    This is blazingly fast with Bun\!
echo.

call bun install
set INSTALL_RESULT=%errorlevel%

if %INSTALL_RESULT% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies\!
    echo.
    pause
    exit /b 1
)

echo.
echo    Dependencies installed successfully\!
echo.

echo [4/6] Extracting localization data...
echo    Searching for Peacock installation...
echo.

call bun run extract-localization
set EXTRACT_RESULT=%errorlevel%

if %EXTRACT_RESULT% neq 0 (
    echo.
    echo [WARNING] Failed to extract localization data.
    echo This is not critical - the webapp will still work.
    echo You can run "bun run extract-localization" manually later.
    echo.
)

echo.
echo [5/6] Creating startup scripts...

if not exist "scripts" mkdir scripts

:: Create dev.bat
(
echo @echo off
echo cd ..
echo echo Starting Peacock Webapp in development mode...
echo echo.
echo echo Webapp will be available at: http://localhost:3000
echo echo Press Ctrl+C to stop the server
echo echo.
echo call bun run dev
) > scripts\dev.bat
echo    Created: scripts\dev.bat

:: Create build.bat
(
echo @echo off
echo cd ..
echo echo Building Peacock Webapp for production...
echo echo.
echo call bun run build
echo pause
) > scripts\build.bat
echo    Created: scripts\build.bat

:: Create start.bat
(
echo @echo off
echo cd ..
echo echo Starting Peacock Webapp in production mode...
echo echo.
echo echo Webapp will be available at: http://localhost:3000
echo echo Press Ctrl+C to stop the server
echo echo.
echo call bun run start
) > scripts\start.bat
echo    Created: scripts\start.bat

echo.
echo [6/6] Building and starting...
echo.

echo ========================================
echo   Installation Complete\!
echo ========================================
echo.
echo Quick Start:
echo   1. Run: scripts\dev.bat
echo   2. Open: http://localhost:3000
echo.
echo Using Bun:
echo   bun run dev   - Development mode
echo   bun run build - Build production
echo   bun run start - Start production
echo.
echo ========================================
echo.

timeout /t 2 /nobreak >nul

call bun run build
set BUILD_RESULT=%errorlevel%

if %BUILD_RESULT% neq 0 (
    echo.
    echo [ERROR] Build failed\!
    pause
    exit /b 1
)

echo.
echo Build complete\! Starting server...
echo.

start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"
call bun run start
