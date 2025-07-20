@echo off
echo 🚀 Setting up Coding Assessment Platform for Local Development (Windows)
echo =======================================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Check if .env file exists, create if not
if not exist .env (
    echo ⚙️  Creating environment configuration...
    (
        echo # Database Configuration
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/coding_assessment
        echo PGHOST=localhost
        echo PGPORT=5432
        echo PGUSER=postgres
        echo PGPASSWORD=password
        echo PGDATABASE=coding_assessment
        echo.
        echo # Application Configuration
        echo NODE_ENV=development
        echo PORT=5000
    ) > .env
    echo ✅ Created .env file with default database settings
    echo 📝 Please update the database credentials in .env if needed
) else (
    echo ✅ .env file already exists
)

REM Create database setup SQL
echo 💾 Creating database setup script...
(
    echo -- Create database if it doesn't exist
    echo CREATE DATABASE coding_assessment;
    echo.
    echo -- Create user if it doesn't exist ^(optional, you can use existing postgres user^)
    echo -- CREATE USER coding_user WITH PASSWORD 'secure_password';
    echo -- GRANT ALL PRIVILEGES ON DATABASE coding_assessment TO coding_user;
    echo.
    echo -- Switch to the database
    echo \c coding_assessment;
    echo.
    echo -- The tables will be created automatically by Drizzle when you run the application
) > setup-database.sql

echo ✅ Database setup script created
echo.

echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Install and start PostgreSQL:
echo    - Download from: https://www.postgresql.org/download/windows/
echo    - Install and start the PostgreSQL service
echo.
echo 2. Install Python 3:
echo    - Download from: https://www.python.org/downloads/
echo.
echo 3. Install Java JDK:
echo    - Download from: https://www.oracle.com/java/technologies/downloads/
echo.
echo 4. Install Visual Studio Build Tools for C++:
echo    - Download Visual Studio Installer
echo    - Install "C++ build tools"
echo.
echo 5. Create the database:
echo    psql -U postgres -f setup-database.sql
echo.
echo 6. Update database credentials in .env file if needed
echo.
echo 7. Start the application:
echo    npm run dev
echo.
echo 8. Open your browser to http://localhost:5000
echo.
echo 🔐 Default admin credentials:
echo    Email: admin@codeassess.com
echo    Password: admin123

pause