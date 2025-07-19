#!/bin/bash

echo "Setting up local PostgreSQL database for Bitespeed Identity Reconciliation..."
echo

# Add PostgreSQL to PATH for this session
export PATH="/c/Program Files/PostgreSQL/16/bin:$PATH"

echo "Testing PostgreSQL connection..."
pg_isready -h localhost -p 5432
if [ $? -ne 0 ]; then
    echo "ERROR: PostgreSQL server is not running!"
    echo "Please make sure PostgreSQL service is started."
    exit 1
fi

echo
echo "PostgreSQL server is running!"
echo

echo "Creating database and user..."
echo "You will be prompted for the postgres user password."
echo

# Create database
echo "Creating database 'bitespeed_identity'..."
psql -U postgres -h localhost -c "CREATE DATABASE bitespeed_identity;"

# Create user (optional - you can use postgres user instead)
echo
echo "Creating user 'bitespeed_user'..."
psql -U postgres -h localhost -c "CREATE USER bitespeed_user WITH ENCRYPTED PASSWORD 'bitespeed_password';"

# Grant permissions
echo
echo "Granting permissions..."
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE bitespeed_identity TO bitespeed_user;"
psql -U postgres -h localhost -c "ALTER USER bitespeed_user CREATEDB;"

echo
echo "Database setup complete!"
echo
echo "Your database connection details:"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: bitespeed_identity"
echo "Username: bitespeed_user (or postgres)"
echo "Password: bitespeed_password (or your postgres password)"
echo
echo "Connection String for .env file:"
echo 'DATABASE_URL="postgresql://bitespeed_user:bitespeed_password@localhost:5432/bitespeed_identity"'
echo
echo "OR if you prefer to use the postgres user:"
echo 'DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/bitespeed_identity"'
echo
