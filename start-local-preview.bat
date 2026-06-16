@echo off
setlocal

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

where php >nul 2>nul
if errorlevel 1 (
  echo PHP is not available in PATH.
  echo Install PHP or configure it in PATH, then run this file again.
  pause
  exit /b 1
)

echo No-Docker local preview is running:
echo Home:     http://localhost:%PORT%/
echo About:    http://localhost:%PORT%/about-us/
echo Contact:  http://localhost:%PORT%/contact-us/
echo Our Team: http://localhost:%PORT%/our-team/
echo.
echo Keep this window open while previewing. Press Ctrl+C to stop.
echo.

php -S localhost:%PORT% -t "%~dp0" "%~dp0local-static-preview.php"
