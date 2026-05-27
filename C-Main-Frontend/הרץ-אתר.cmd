@echo off
cd /d "%~dp0"
echo Building frontend...
call npm run build -- --configuration=development
if errorlevel 1 exit /b 1
echo.
echo Starting site at http://localhost:4200
echo (Backend must run on http://localhost:5117)
echo.
npx --yes http-server dist/c-main-frontend/browser -p 4200 -c-1
