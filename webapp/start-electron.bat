@echo off
echo Starting Peacock Unlock All Desktop App...
echo.
echo Starting Next.js server...
start /B bun --bun next dev

timeout /t 3 /nobreak >nul

echo Starting Electron app...
bun run electron:dev
