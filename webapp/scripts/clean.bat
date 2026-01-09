@echo off 
cd .. 
echo Cleaning all generated files and dependencies... 
echo. 
if exist "node_modules\" ( 
    echo Removing node_modules... 
    rmdir /s /q node_modules 
) 
if exist ".next\" ( 
    echo Removing .next build... 
    rmdir /s /q .next 
) 
if exist "pnpm-lock.yaml" ( 
    echo Removing pnpm-lock.yaml... 
    del /f /q pnpm-lock.yaml 
) 
echo. 
echo Cleanup complete Run 'install.bat' to reinstall. 
echo. 
pause 
