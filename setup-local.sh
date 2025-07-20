#!/bin/bash

echo "🚀 Setting up Coding Assessment Platform for Local Development"
echo "============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "- Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "- macOS: brew install postgresql"
    echo "- Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Check if .env file exists, create if not
if [ ! -f .env ]; then
    echo "⚙️  Creating environment configuration..."
    cat > .env << 'EOF'
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
EOF
    echo "✅ Created .env file with default database settings"
    echo "📝 Please update the database credentials in .env if needed"
else
    echo "✅ .env file already exists"
fi

# Create database setup SQL
echo "💾 Creating database setup script..."
cat > setup-database.sql << 'EOF'
-- Create database if it doesn't exist
CREATE DATABASE coding_assessment;

-- Create user if it doesn't exist (optional, you can use existing postgres user)
-- CREATE USER coding_user WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE coding_assessment TO coding_user;

-- Switch to the database
\c coding_assessment;

-- The tables will be created automatically by Drizzle when you run the application
EOF

echo "✅ Database setup script created"
echo ""

# Install system dependencies for code execution
echo "🔧 Checking system dependencies for code execution..."

# Python check
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python3 not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y python3 python3-pip
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install python3
    else
        echo "❌ Please install Python3 manually"
    fi
else
    echo "✅ Python3 is available"
fi

# Java check
if ! command -v javac &> /dev/null; then
    echo "⚠️  Java compiler not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y default-jdk
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install openjdk
    else
        echo "❌ Please install Java JDK manually"
    fi
else
    echo "✅ Java compiler is available"
fi

# GCC check
if ! command -v gcc &> /dev/null; then
    echo "⚠️  GCC not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y build-essential
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        xcode-select --install
    else
        echo "❌ Please install GCC/build tools manually"
    fi
else
    echo "✅ GCC is available"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start PostgreSQL service:"
echo "   - Ubuntu/Debian: sudo systemctl start postgresql"
echo "   - macOS: brew services start postgresql"
echo "   - Windows: Start PostgreSQL from Services"
echo ""
echo "2. Create the database:"
echo "   psql -U postgres -f setup-database.sql"
echo ""
echo "3. Update database credentials in .env file if needed"
echo ""
echo "4. Start the application:"
echo "   npm run dev"
echo ""
echo "5. Open your browser to http://localhost:5000"
echo ""
echo "🔐 Default admin credentials:"
echo "   Email: admin@codeassess.com"
echo "   Password: admin123"