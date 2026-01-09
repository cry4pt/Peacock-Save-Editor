@echo off 
cd .. 
echo Starting Peacock Webapp in production mode... 
echo. 
if not exist ".next\" ( 
    echo [ERROR] Production build not found 
    echo Please run 'build.bat' first to build the webapp. 
    echo. 
    pause 
    exit /b 1 
) 
echo Webapp will be available at: http://localhost:3000 
echo Press Ctrl+C to stop the server 
echo. 
call pnpm run start 
