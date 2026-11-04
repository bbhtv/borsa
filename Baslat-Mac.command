#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js bulunamadı. https://nodejs.org adresinden LTS sürümünü kurup bu dosyayı tekrar açın."
  open "https://nodejs.org"
  read -r -p "Kapatmak için Enter'a basın..."
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Paketler yükleniyor, ilk seferde birkaç dakika sürebilir..."
  npm install || { read -r -p "Hata oluştu. Enter..."; exit 1; }
fi
if [ ! -f .next/BUILD_ID ]; then
  echo "Uygulama hazırlanıyor..."
  npm run build || { read -r -p "Hata oluştu. Enter..."; exit 1; }
fi
echo
echo "Tavşan Hızlı Okuma çalışıyor: http://localhost:3000"
echo "Kapatmak için bu pencereyi kapatın (veya Ctrl+C)."
echo
(sleep 4; open "http://localhost:3000") &
npm start
