@echo off
echo Setting up PostgreSQL database for Bitespeed Identity Reconciliation...
echo.

REM Set PostgreSQL password as environment variable
echo Please enter your PostgreSQL password when prompted.
set /p PGPASSWORD="Enter PostgreSQL password: "

echo.
echo Creating database and user...

REM Create database and user
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE bitespeed_identity;"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -c "CREATE USER bitespeed_user WITH PASSWORD 'bitespeed_password123';"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE bitespeed_identity TO bitespeed_user;"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -c "ALTER USER bitespeed_user CREATEDB;"

echo.
echo Database setup completed!
echo Your DATABASE_URL should be: postgresql://bitespeed_user:bitespeed_password123@localhost:5432/bitespeed_identity
echo.
pause
