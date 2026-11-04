@echo off
chcp 65001 >nul
title Tavsan Hizli Okuma
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js bulunamadi. Lutfen https://nodejs.org adresinden LTS surumunu kurup bu dosyayi tekrar calistirin.
  start "" https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules (
  echo  Paketler yukleniyor, ilk seferde birkac dakika surebilir...
  call npm install || (pause & exit /b 1)
)
if not exist .next\BUILD_ID (
  echo  Uygulama hazirlaniyor...
  call npm run build || (pause & exit /b 1)
)
echo.
echo  Tavsan Hizli Okuma calisiyor: http://localhost:3000
echo  Kapatmak icin bu pencereyi kapatin.
echo.
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm start
pause
