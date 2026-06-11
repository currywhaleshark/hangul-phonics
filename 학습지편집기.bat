@echo off
setlocal
title Hangul Phonics Worksheet Editor

set "EDITOR_PORT=3001"
set "EDITOR_URL=http://127.0.0.1:%EDITOR_PORT%/worksheets/editor.html"

echo ===================================================
echo   Starting Hangul Phonics Worksheet Editor...
echo ===================================================

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo Node.js was not found.
    echo Install Node.js from https://nodejs.org and run this file again.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo.
    echo npm was not found. Check your Node.js installation.
    echo.
    pause
    exit /b 1
)

echo.
echo 1. Checking dependencies...
set "NEED_INSTALL=0"
if not exist node_modules set "NEED_INSTALL=1"
if not exist node_modules\vite set "NEED_INSTALL=1"
if not exist node_modules\html2canvas set "NEED_INSTALL=1"

if "%NEED_INSTALL%"=="1" (
    echo Required packages are missing. Installing packages...
    call npm install
    if errorlevel 1 (
        echo.
        echo Package installation failed.
        pause
        exit /b 1
    )
)

echo.
echo 2. Starting editor server...
echo If the browser does not open, use this URL:
echo %EDITOR_URL%
echo.

start "Worksheet Editor Server" cmd /k "cd /d ""%~dp0"" && npx --no-install vite --config vite.editor.config.js"

echo Waiting for the server to start...
timeout /t 2 /nobreak >nul
start "" "%EDITOR_URL%"

echo.
echo The editor server is running in a separate window.
echo Close the "Worksheet Editor Server" window when finished.
pause
