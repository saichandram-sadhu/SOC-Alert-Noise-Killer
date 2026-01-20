@echo off
echo [HARD RESET] Stopping all SOC processes...
taskkill /F /IM SOC-Noise-Killer.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo [CLEANUP] Clearing temp files...
if exist "%temp%\pkg-cache" rmdir /s /q "%temp%\pkg-cache"

echo [START] Launching SOC Dashboard...
start "" "SOC-Noise-Killer.exe"

echo [DONE] You can close this window.
timeout /t 5
exit
