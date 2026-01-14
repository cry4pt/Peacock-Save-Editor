@echo off 
cd .. 
echo Updating localization data from Peacock... 
echo. 
call bun run extract-localization
echo. 
if %errorlevel% equ 0 ( 
    echo Localization updated successfully 
) else ( 
    echo Failed to update localization. 
) 
echo. 
pause 
