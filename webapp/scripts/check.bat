@echo off 
cd .. 
echo Checking for TypeScript errors... 
echo. 
call pnpm run check 
echo. 
pause 
