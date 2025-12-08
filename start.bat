@echo off
REM Simon Transcendence - Quick Start Script for Windows

echo.
echo 🚀 Simon Transcendence - Quick Start
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

echo.
echo 📦 Installing backend dependencies...
cd backend

if not exist "node_modules" (
    call npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🎮 Starting Simon Transcendence Server...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start

pause
