@echo off
title SOC Alert Noise Killer - Enterprise Edition
color 0a
cls
echo ========================================================
echo     SOC ALERT NOISE KILLER - ENTERPRISE LAUNCHER
echo ========================================================
echo.
echo [INFO] Starting Backend Server (Port 5000)...
echo [INFO] Serving Static Frontend...
echo.

:: Start SOC Application
start /b SOC-Noise-Killer.exe > app.log 2>&1

:: Wait for server to initialize
echo [WAIT] Booting up Enterprise SOC...
timeout /t 5 >nul

:: Open Browser
echo [INFO] Opening Application Dashboard...
start http://localhost:5000

echo.
echo [SUCCESS] Application is running!
echo [INFO] Logs are being written to server.log
echo [INFO] Do NOT close this window to keep the server running.
echo.
pause
