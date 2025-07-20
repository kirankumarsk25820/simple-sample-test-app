#!/bin/bash

echo "🚀 Starting Coding Assessment Platform"
echo "======================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please update the database credentials in .env file"
fi

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "⚠️  PostgreSQL doesn't seem to be running."
    echo "Please start PostgreSQL service:"
    echo "- Ubuntu/Debian: sudo systemctl start postgresql"
    echo "- macOS: brew services start postgresql"
    echo "- Windows: Start PostgreSQL from Services"
    echo ""
fi

# Check if database exists
if command -v psql &> /dev/null; then
    DB_EXISTS=$(psql -U ${PGUSER:-postgres} -lqt | cut -d \| -f 1 | grep -w ${PGDATABASE:-coding_assessment} | wc -l)
    if [ $DB_EXISTS -eq 0 ]; then
        echo "📊 Database '${PGDATABASE:-coding_assessment}' doesn't exist. Creating..."
        createdb -U ${PGUSER:-postgres} ${PGDATABASE:-coding_assessment} || echo "⚠️  Could not create database. Please create it manually."
    fi
fi

# Push database schema
echo "🗄️  Syncing database schema..."
npm run db:push

# Start the application
echo "🎯 Starting the application..."
npm run dev