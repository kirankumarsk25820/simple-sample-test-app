@echo off
echo 🚀 Starting Coding Assessment Platform (Windows)
echo ================================================

REM Check if .env file exists
if not exist .env (
    echo ⚙️  No .env file found. Creating from template...
    copy .env.example .env
    echo 📝 Please update the database credentials in .env file
)

REM Check if PostgreSQL service is running
sc query postgresql-x64-14 | find "RUNNING" >nul
if errorlevel 1 (
    echo ⚠️  PostgreSQL service doesn't seem to be running.
    echo Please start PostgreSQL service from Windows Services
    echo.
)

REM Push database schema
echo 🗄️  Syncing database schema...
npm run db:push

REM Start the application
echo 🎯 Starting the application...
npm run dev