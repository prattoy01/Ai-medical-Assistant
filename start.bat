@echo off
echo Starting AI Medical Assistant...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python app.py"
cd ..

echo.
echo Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul 