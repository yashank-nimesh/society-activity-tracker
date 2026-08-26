@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Society Activity Tracker - Startup Script
echo ============================================
echo.

REM --- Figure out where this script lives, so it works no matter where the project is ---
set "ROOT=%~dp0"
cd /d "%ROOT%"

REM --- 1. Check server\.env exists, create it from .env.example if not ---
if not exist "server\.env" (
    echo [server] No .env found. Creating one from .env.example...
    copy "server\.env.example" "server\.env" >nul
    echo [server] Created server\.env
    echo [server] IMPORTANT: open server\.env and set MONGO_URI and JWT_SECRET before continuing.
    echo.
    pause
) else (
    echo [server] .env already exists, skipping.
)

REM --- 2. Check client\.env exists, create it from .env.example if not ---
if not exist "client\.env" (
    echo [client] No .env found. Creating one from .env.example...
    copy "client\.env.example" "client\.env" >nul
    echo [client] Created client\.env
) else (
    echo [client] .env already exists, skipping.
)

echo.

REM --- 3. Install server dependencies if node_modules is missing ---
if not exist "server\node_modules" (
    echo [server] node_modules not found. Running npm install...
    pushd server
    call npm install
    popd
) else (
    echo [server] node_modules already present, skipping install.
)

echo.

REM --- 4. Install client dependencies if node_modules is missing ---
if not exist "client\node_modules" (
    echo [client] node_modules not found. Running npm install...
    pushd client
    call npm install
    popd
) else (
    echo [client] node_modules already present, skipping install.
)

echo.
echo ============================================
echo   Setup complete. Starting servers...
echo ============================================
echo.

REM --- 5. Ask if the user wants to (re)seed the database ---
set /p SEED="Seed/reset the database with demo data? (y/n): "
if /i "%SEED%"=="y" (
    echo [server] Seeding database...
    pushd server
    call npm run seed
    popd
    echo.
)

REM --- 6. Start backend and frontend, each in their own new window ---
echo Starting backend on http://localhost:5000 ...
start "Society Tracker - Server" cmd /k "cd /d "%ROOT%server" && npm run dev"

REM Give the backend a moment to boot before starting the frontend
timeout /t 3 /nobreak >nul

echo Starting frontend on http://localhost:5173 ...
start "Society Tracker - Client" cmd /k "cd /d "%ROOT%client" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Once they're ready, open http://localhost:5173 in your browser.
echo.
pause