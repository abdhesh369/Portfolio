@echo off
REM Set environment variables for Windows
set NODE_ENV=production
set DATABASE_PATH=/tmp/portfolio-db
set RENDER=false

echo Starting Portfolio Backend
echo NODE_ENV: %NODE_ENV%
echo DATABASE_PATH: %DATABASE_PATH%
echo RENDER: %RENDER%

REM Run the app
node dist/src/index.js