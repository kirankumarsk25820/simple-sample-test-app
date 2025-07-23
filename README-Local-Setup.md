# Local Development Setup Guide

This guide will help you set up the Coding Assessment Platform on your local machine for offline development.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

## Quick Setup

### Linux/macOS
```bash
# Make the setup script executable
chmod +x setup-local.sh

# Run the setup script
./setup-local.sh
```

### Windows
```batch
# Run the setup script
setup-local.bat
```

## Manual Setup

If you prefer to set up manually or the script doesn't work for your system:

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/coding_assessment
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=coding_assessment

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 3. Database Setup
```bash
# Connect to PostgreSQL and create database
psql -U postgres
CREATE DATABASE coding_assessment;
\q
```

### 4. System Dependencies for Code Execution

#### Python 3
- **Ubuntu/Debian**: `sudo apt-get install python3 python3-pip`
- **macOS**: `brew install python3`
- **Windows**: Download from [python.org](https://www.python.org/downloads/)

#### Java JDK
- **Ubuntu/Debian**: `sudo apt-get install default-jdk`
- **macOS**: `brew install openjdk`
- **Windows**: Download from [Oracle](https://www.oracle.com/java/technologies/downloads/)

#### GCC/Build Tools
- **Ubuntu/Debian**: `sudo apt-get install build-essential`
- **macOS**: `xcode-select --install`
- **Windows**: Install Visual Studio Build Tools

### 5. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Default Credentials

### Admin Login
- **Email**: admin@codeassess.com
- **Password**: admin123

## Project Structure

```
coding-assessment/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared types and schemas
├── setup-local.sh         # Linux/macOS setup script
├── setup-local.bat        # Windows setup script
├── setup-database.sql     # Database initialization
├── .env                   # Environment variables
└── package.json           # Dependencies
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Sync database schema

## Database Management

### Reset Database
If you need to reset the database:
```bash
psql -U postgres
DROP DATABASE coding_assessment;
CREATE DATABASE coding_assessment;
\q

# Restart the application to recreate tables
npm run dev
```

### View Database
```bash
psql -U postgres -d coding_assessment
\dt  # List tables
\q   # Quit
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check credentials in `.env` file
3. Verify database exists

### Code Execution Issues
1. Ensure Python 3, Java, and GCC are installed
2. Check system PATH includes these tools
3. Test individually: `python3 --version`, `javac -version`, `gcc --version`

### Port Already in Use
Change the PORT in `.env` file to a different number (e.g., 3000, 8000)

### Permission Issues (Linux/macOS)
```bash
sudo chown -R $USER:$USER ./
chmod +x setup-local.sh
```

## Features Available Offline

- ✅ Student assessment interface
- ✅ MCQ questions and coding problems
- ✅ Code execution (Python, Java, C++, C, JavaScript)
- ✅ Admin panel for content management
- ✅ Results tracking and analytics
- ✅ Timer functionality
- ✅ Automatic grading

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in `.env`
2. Use a production PostgreSQL instance
3. Configure proper security settings
4. Use a process manager like PM2

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed correctly
3. Verify your `.env` configuration
4. Check that PostgreSQL is running

The platform is now ready for offline development and testing!