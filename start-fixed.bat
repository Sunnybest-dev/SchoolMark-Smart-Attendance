@echo off
echo ========================================
echo   SchoolMark System Startup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call venv\Scripts\activate.bat
pip install django-cors-headers djangorestframework djangorestframework-simplejwt Pillow

echo.
echo [2/4] Running Migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo [3/4] Creating Test Users...
python create_test_users.py

echo.
echo [4/4] Starting Servers...
start "Django Backend" cmd /k "cd /d %CD% && venv\Scripts\activate.bat && python manage.py runserver"

timeout /t 3 /nobreak > nul

cd ..\frontend
start "React Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   System Started!
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Test Credentials:
echo Admin: admin/admin123
echo Lecturer: lecturer/lecturer123
echo Student: student/student123
echo.
pause
