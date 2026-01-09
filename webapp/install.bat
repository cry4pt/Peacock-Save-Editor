@echo off
setlocal enabledelayedexpansion

:: Peacock Webapp - Automatic Installer
:: This script automatically installs all dependencies and sets up the webapp

echo.
echo ========================================
echo   Peacock Webapp - Auto Installer
echo ========================================
echo.

:: Check if we're in the webapp directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the webapp directory.
    echo.
    pause
    exit /b 1
)

echo [1/7] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended: Node.js 18.x or newer
    echo.
    pause
    exit /b 1
)

:: Get Node version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    Found Node.js %NODE_VERSION%
echo.

echo [2/7] Checking pnpm installation...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] pnpm is not installed!
    echo.
    echo Installing pnpm globally...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install pnpm!
        echo Please install manually: npm install -g pnpm
        echo.
        pause
        exit /b 1
    )
    echo.
    echo pnpm installed successfully!
)

:: Get pnpm version
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo    Found pnpm v%PNPM_VERSION%
echo.

echo [3/7] Cleaning previous installations...
if exist "node_modules\" (
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
if exist ".next\" (
    echo    Removing old build cache...
    rmdir /s /q .next >nul 2>&1
)
echo    Cleanup complete!
echo.

echo [4/7] Installing dependencies with pnpm...
echo    This may take a few minutes...
echo.

:: Run pnpm install and force completion
call pnpm install --ignore-scripts
set INSTALL_RESULT=%errorlevel%

if %INSTALL_RESULT% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo.
    pause
    exit /b 1
)

echo.
echo    Dependencies installed successfully!
echo.

echo [5/7] Extracting localization data...
echo    Searching for Peacock installation...
echo.

:: Run localization extraction and force completion
call pnpm run extract-localization
set EXTRACT_RESULT=%errorlevel%

if %EXTRACT_RESULT% neq 0 (
    echo.
    echo [WARNING] Failed to extract localization data.
    echo This is not critical - the webapp will still work.
    echo You can run 'pnpm run extract-localization' manually later.
    echo.
)

echo.
echo [6/7] Creating scripts folder and startup scripts...

:: Create scripts folder
if not exist "scripts\" mkdir scripts

:: Create dev.bat
echo @echo off > scripts\dev.bat
echo cd .. >> scripts\dev.bat
echo echo Starting Peacock Webapp in development mode... >> scripts\dev.bat
echo echo. >> scripts\dev.bat
echo echo Webapp will be available at: http://localhost:3000 >> scripts\dev.bat
echo echo Press Ctrl+C to stop the server >> scripts\dev.bat
echo echo. >> scripts\dev.bat
echo call pnpm run dev >> scripts\dev.bat
echo    Created: scripts\dev.bat

:: Create build.bat
echo @echo off > scripts\build.bat
echo cd .. >> scripts\build.bat
echo echo Building Peacock Webapp for production... >> scripts\build.bat
echo echo. >> scripts\build.bat
echo call pnpm run build >> scripts\build.bat
echo if %%errorlevel%% equ 0 ( >> scripts\build.bat
echo     echo. >> scripts\build.bat
echo     echo Build completed successfully! >> scripts\build.bat
echo     echo Run 'start.bat' to start the production server. >> scripts\build.bat
echo     echo. >> scripts\build.bat
echo ) else ( >> scripts\build.bat
echo     echo. >> scripts\build.bat
echo     echo Build failed! Check the errors above. >> scripts\build.bat
echo     echo. >> scripts\build.bat
echo ) >> scripts\build.bat
echo pause >> scripts\build.bat
echo    Created: scripts\build.bat

:: Create start.bat
echo @echo off > scripts\start.bat
echo cd .. >> scripts\start.bat
echo echo Starting Peacock Webapp in production mode... >> scripts\start.bat
echo echo. >> scripts\start.bat
echo if not exist ".next\" ( >> scripts\start.bat
echo     echo [ERROR] Production build not found! >> scripts\start.bat
echo     echo Please run 'build.bat' first to build the webapp. >> scripts\start.bat
echo     echo. >> scripts\start.bat
echo     pause >> scripts\start.bat
echo     exit /b 1 >> scripts\start.bat
echo ) >> scripts\start.bat
echo echo Webapp will be available at: http://localhost:3000 >> scripts\start.bat
echo echo Press Ctrl+C to stop the server >> scripts\start.bat
echo echo. >> scripts\start.bat
echo call pnpm run start >> scripts\start.bat
echo    Created: scripts\start.bat

:: Create check.bat
echo @echo off > scripts\check.bat
echo cd .. >> scripts\check.bat
echo echo Checking for TypeScript errors... >> scripts\check.bat
echo echo. >> scripts\check.bat
echo call pnpm run check >> scripts\check.bat
echo echo. >> scripts\check.bat
echo pause >> scripts\check.bat
echo    Created: scripts\check.bat

:: Create update-localization.bat
echo @echo off > scripts\update-localization.bat
echo cd .. >> scripts\update-localization.bat
echo echo Updating localization data from Peacock... >> scripts\update-localization.bat
echo echo. >> scripts\update-localization.bat
echo call pnpm run extract-localization >> scripts\update-localization.bat
echo echo. >> scripts\update-localization.bat
echo if %%errorlevel%% equ 0 ( >> scripts\update-localization.bat
echo     echo Localization updated successfully! >> scripts\update-localization.bat
echo ) else ( >> scripts\update-localization.bat
echo     echo Failed to update localization. >> scripts\update-localization.bat
echo ) >> scripts\update-localization.bat
echo echo. >> scripts\update-localization.bat
echo pause >> scripts\update-localization.bat
echo    Created: scripts\update-localization.bat

:: Create clean.bat
echo @echo off > scripts\clean.bat
echo cd .. >> scripts\clean.bat
echo echo Cleaning all generated files and dependencies... >> scripts\clean.bat
echo echo. >> scripts\clean.bat
echo if exist "node_modules\" ( >> scripts\clean.bat
echo     echo Removing node_modules... >> scripts\clean.bat
echo     rmdir /s /q node_modules >> scripts\clean.bat
echo ) >> scripts\clean.bat
echo if exist ".next\" ( >> scripts\clean.bat
echo     echo Removing .next build... >> scripts\clean.bat
echo     rmdir /s /q .next >> scripts\clean.bat
echo ) >> scripts\clean.bat
echo if exist "pnpm-lock.yaml" ( >> scripts\clean.bat
echo     echo Removing pnpm-lock.yaml... >> scripts\clean.bat
echo     del /f /q pnpm-lock.yaml >> scripts\clean.bat
echo ) >> scripts\clean.bat
echo echo. >> scripts\clean.bat
echo echo Cleanup complete! Run 'install.bat' to reinstall. >> scripts\clean.bat
echo echo. >> scripts\clean.bat
echo pause >> scripts\clean.bat
echo    Created: scripts\clean.bat

echo.
echo [7/7] Creating README...

:: Create README.txt
(
echo ========================================
echo   Peacock Webapp - Quick Reference
echo ========================================
echo.
echo GETTING STARTED:
echo   1. Run 'install.bat' to install everything ^(already done!^)
echo   2. Run 'scripts\dev.bat' to start the webapp
echo   3. Open http://localhost:3000 in your browser
echo.
echo AVAILABLE COMMANDS:
echo.
echo   scripts\dev.bat                  - Start development server
echo                                      Hot reload, debugging enabled
echo                                      Use this for development
echo.
echo   scripts\build.bat                - Build for production
echo                                      Optimizes and compiles the app
echo                                      Run before using start.bat
echo.
echo   scripts\start.bat                - Start production server
echo                                      Faster than dev mode
echo                                      Must run build.bat first
echo.
echo   scripts\check.bat                - Check for TypeScript errors
echo                                      Validates code without running
echo.
echo   scripts\update-localization.bat  - Update challenge/story names
echo                                      Re-extracts from Peacock
echo                                      Run after Peacock updates
echo.
echo   scripts\clean.bat                - Clean all generated files
echo                                      Removes node_modules and builds
echo                                      Run install.bat after cleaning
echo.
echo USING PNPM DIRECTLY:
echo   pnpm run dev             - Same as dev.bat
echo   pnpm run build           - Same as build.bat
echo   pnpm run start           - Same as start.bat
echo   pnpm run check           - Same as check.bat
echo   pnpm run extract-localization - Same as update-localization.bat
echo.
echo TROUBLESHOOTING:
echo   - If webapp won't start: run clean.bat then install.bat
echo   - If port 3000 busy: close other apps or edit package.json
echo   - If pnpm errors: run 'npm install -g pnpm' to reinstall
echo   - If localization missing: run update-localization.bat
echo.
echo REQUIREMENTS:
echo   - Node.js 18.x or newer
echo   - pnpm ^(auto-installed by install.bat^)
echo   - Windows 10/11
echo.
echo WEBAPP FEATURES:
echo   - Profile management and editing
echo   - Unlock all content
echo   - Location mastery management
echo   - Challenge completion
echo   - Mission story completion
echo   - Escalation management
echo   - Backup and restore profiles
echo   - Real-time activity logging
echo   - Auto-detects Peacock installation
echo.
echo For more help, check the documentation in the docs folder.
echo ========================================
) > README.txt
echo    Created: README.txt

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Quick Start:
echo   1. Run: scripts\dev.bat
echo   2. Open: http://localhost:3000
echo.
echo All available commands:
echo   scripts\dev.bat                  - Start development server
echo   scripts\build.bat                - Build for production
echo   scripts\start.bat                - Start production server
echo   scripts\check.bat                - Check for errors
echo   scripts\update-localization.bat  - Update challenge names
echo   scripts\clean.bat                - Clean everything
echo.
echo Using pnpm:
echo   pnpm run dev             - Development mode
echo   pnpm run build           - Build production
echo   pnpm run start           - Start production
echo   pnpm run check           - Type check
echo   pnpm run extract-localization - Update localization
echo.
echo ========================================
echo.
echo Next Steps:
echo   1. Building production bundle...
echo   2. Starting production server...
echo   3. Opening browser...
echo.
echo Press Ctrl+C to cancel and exit.
echo.

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   [Step 1/3] Building Production Bundle
echo ========================================
echo.
echo Compiling and optimizing webapp...
echo This may take 1-2 minutes...
echo.

:: Build the production bundle
call pnpm run build
set BUILD_RESULT=%errorlevel%

if %BUILD_RESULT% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Build complete!
echo.
echo ========================================
echo   [Step 2/3] Starting Production Server
echo ========================================
echo.
echo Starting Next.js server...
echo.

:: Open browser after 5 seconds
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the production server
call pnpm run start
