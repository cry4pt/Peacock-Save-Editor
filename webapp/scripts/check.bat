@echo off 
cd .. 
echo Checking for TypeScript errors... 
echo. 
call bun run check
echo. 
pause 
