@echo off
echo ========================================================
echo  Starting SupplyFlow SCM v2.6 (Nexora Clean Modern)
echo ========================================================

echo [1/3] Starting MySQL Daemon on Port 3306...
start "SupplyFlow MySQL" "C:\xampp\mysql\bin\mysqld.exe" --datadir="C:\xampp\mysql\data_supplyflow" --port=3306

timeout /t 2 /nobreak > nul

echo [2/3] Starting Laravel API Backend (http://127.0.0.1:8000)...
start "SupplyFlow Backend API" cmd /k "cd backend && php artisan serve --port=8000"

timeout /t 1 /nobreak > nul

echo [3/3] Starting Vite React Frontend (http://localhost:5173)...
start "SupplyFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  All services are running!
echo  Frontend URL: http://localhost:5173
echo  Backend API:  http://127.0.0.1:8000/api
echo.
echo  Demo Credentials:
echo   - Super Admin:   admin@supplyflow.com / password123
echo   - Supply Chain:  supplychain@supplyflow.com / password123
echo   - Production:    production@supplyflow.com / password123
echo ========================================================
pause
