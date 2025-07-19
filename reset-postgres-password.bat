@echo off
echo PostgreSQL Password Reset Instructions
echo =====================================
echo.
echo If you don't remember your postgres password, follow these steps:
echo.
echo 1. Open Command Prompt as Administrator
echo 2. Stop PostgreSQL service:
echo    net stop postgresql-x64-16
echo.
echo 3. Edit pg_hba.conf file at:
echo    "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
echo.
echo 4. Find this line (usually near the bottom):
echo    host    all             all             127.0.0.1/32            scram-sha-256
echo.
echo 5. Change it to:
echo    host    all             all             127.0.0.1/32            trust
echo.
echo 6. Save the file and restart PostgreSQL:
echo    net start postgresql-x64-16
echo.
echo 7. Now you can connect without password:
echo    psql -U postgres -h localhost
echo.
echo 8. Set a new password:
echo    ALTER USER postgres PASSWORD 'your_new_password';
echo.
echo 9. Exit psql and change pg_hba.conf back to scram-sha-256
echo 10. Restart PostgreSQL service again
echo.
echo OR use the simpler option below...
pause
