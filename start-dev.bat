@echo off
title SOC Alert Noise Killer - DEV MODE

:: Clean up previous processes
echo [KILL] Stopping any old Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo ========================================================
echo     SOC ALERT NOISE KILLER - DEVELOPMENT LAUNCHER
echo ========================================================
echo.

:: 1. Start Backend Server
echo [BACKEND] Starting API server...
cd server
start "Backend" cmd /k "node src/server.js"
cd ..

:: 2. Start Frontend Dev Server
echo [FRONTEND] Starting Vite dev server...
cd client
start "Frontend" cmd /k "npm run dev"
cd ..

:: Wait for the server to initialize before starting the simulator
echo [WAIT] Waiting for server to boot (10 seconds)...
timeout /t 10 >nul

:: 3. Start Alert Simulator
echo [SIMULATOR] Starting alert flood simulator...
cd simulator
start "Simulator" cmd /k "npm start"
cd ..

echo.
echo [SUCCESS] All components are starting up in separate windows.
echo [URL] Frontend will be available at: http://localhost:5173 (Vite default)
echo [URL] Backend API is at: http://localhost:5000
echo.
pause
