@echo off 
cd .. 
echo Building Peacock Webapp for production... 
echo. 
call pnpm run build 
if %errorlevel% equ 0 ( 
    echo. 
    echo Build completed successfully 
    echo Run 'start.bat' to start the production server. 
    echo. 
) else ( 
    echo. 
    echo Build failed Check the errors above. 
    echo. 
) 
pause 
