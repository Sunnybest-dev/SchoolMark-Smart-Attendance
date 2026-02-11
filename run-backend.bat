@echo off
echo Fixing all errors...
cd backend
call venv\Scripts\activate.bat && pip install django-cors-headers djangorestframework-simplejwt Pillow && python manage.py migrate && python create_test_users.py && python manage.py runserver
