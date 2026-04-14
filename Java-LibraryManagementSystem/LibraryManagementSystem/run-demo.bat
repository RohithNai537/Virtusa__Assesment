@echo off
echo ========================================
echo  LibraSync - Library Management System
echo ========================================
echo.
echo Opening application in browser...
echo.
echo Demo Credentials:
echo   Admin : admin@library.com / admin123
echo   Member: rahul@example.com / member123
echo.
start "" "%~dp0src\main\webapp\index.html"
echo.
echo If browser didn't open, manually open:
echo %~dp0src\main\webapp\index.html
echo.
pause
