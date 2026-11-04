# Tavşan · Hızlı Okuma Akademisi 🐰⚡

Okuma hızını **anlamayı kaybetmeden** geliştiren, her öğrenciyi önce ölçüp tüm egzersizleri ona göre
otomatik ayarlayan; **Tepki Süresi, Dikkat & Odaklanma, Hafıza ve Zihinsel Matematik** gelişimini
başlangıca göre **% olarak** raporlayan hızlı okuma platformu.

## Özellikler

| Alan | İçerik |
|---|---|
| **Tanıtım sayfası** | `/` – premium ana sayfa, “Giriş Yap” butonu |
| **Giriş** | `/giris` – öğrenci ve eğitmen aynı ekrandan girer |
| **Öğrenci paneli** | `/ogrenci` – ilk girişte okuma testi + 4 mini ölçüm, 12 adımlık günlük program, egzersiz kütüphanesi, gelişim grafikleri |
| **Oynatıcı** | Tam ekran; sol üstte logo, sağ üstte `5/12` sayacı + tam ekran aç/kapat; her egzersizden önce “Nasıl yapılır? / Neden işe yarar?” ekranı |
| **Eğitmen paneli** | `/egitmen` – öğrenci ekleme (hesap eğitmene bağlı), başlangıç & güncel kelime/dk, 4 alanın % gelişimi, etkinlik atama, oturum geçmişi |

### Premium özellikler
- **Okuma Odası:** kendi metnini yapıştırıp rehberli / blok / gölgeli modda otomatik hızda okuma; **kitap okuma takibi** (kronometre + sayfa → gerçek okuma hızı, eğitmen de görür)
- **Okuma ayarları:** Standart / Lexend / kitap (serif) yazı tipi, yazı boyutu, satır aralığı, satır geçişini kolaylaştıran **renkli satırlar**
- **Koyu mod** (Açık / Koyu / Sistem) – kenar çubuğundaki ay/güneş düğmesi veya Profil
- **Göz molası:** günlük programda her 4 egzersizde bir 20 saniyelik 20-20-20 molası
- **Haftalık hedef** (haftada 5 gün), **yazdırılabilir / PDF gelişim raporu**, eğitmen için **sınıf raporu (CSV/Excel)**

### 31 egzersiz + okuma testi
- **Göz:** Sıçrayan Tavşan (sakkad + havuç yakalama), Kelebek Sayacı (metronomlu takip + sayma), Kayan Yıldız (düzgün takip)
- **Algı:** Genişleyen Çerçeve (siyah ekran, aynı oranlı dikdörtgenler + çevresel harf ayırt etme), Şimşek Kelime (takistoskop, uyarlamalı eşik), Schulte Tablosu, Aynı mı Farklı mı?
- **Dikkat & Tepki:** Kelime Avı, Dur–Geç (Go/No-Go), Ok Yağmuru (Flanker), Renk Tuzağı (Stroop), Farklı Olanı Bul, Tepki Avcısı
- **Hafıza:** Dönen Kare (3×3→5×5 boyalı kareler + 90/180/270° döndürme), Işık Yolu (Corsi), Sayı Hafızası (digit span), Hafıza Treni (n-geri), Kelime Hafızası
- **Matematik:** Roket Sıralama (büyükten küçüğe, işlemli seviyeler), Zihinden Hesap, Sayı Zinciri, Hangisi Büyük?
- **Dil & Anlama:** Doğru mu Yanlış mı? (TOSREC tipi sessiz okuma verimliliği), Labirent Okuma (maze), Kelime Ustası (eş/zıt anlamlılar)
- **Yeni dikkat/hafıza:** Bilgi Avı (metinde tarama), İşaretleme Testi (d2 tipi), Hafıza Kartları
- **Okuma:** Rehberli Okuma (satır ışık bandı), Blok Okuma (öbek RSVP), Gölgeli Okuma, Okuma Hızı Testi

### Hesaplama motoru (`lib/engine.ts`)
- Her egzersiz alan başına pozitif bir **performans indeksi** üretir (tepki için ters verim skoru: ort. doğru tepki ÷ doğruluk).
- `gelişim = ort(son 3 oturum) ÷ ort(ilk 2 oturum) − 1` (egzersiz bazında; ölçekler karışmaz).
- Alan % = egzersiz gelişimlerinin `ağırlık × güven (oturum sayısı)` ile ağırlıklı ortalaması.
- Okuma: **Etkili Okuma Hızı = kelime/dk × anlama**. Antrenman hızı tamamen otomatik:
  anlama ≥ %80 → +%4, %60–80 → +%1,5, < %60 → −%6; tavan: son ölçülen hızın 1,6 katı. Öğrenci hızı kendisi ayarlayamaz.
- Haftalık ölçüm otomatik olarak programa eklenir; anlama < %40 olan güvenilmez ölçüm ertesi gün tekrarlanır.

## Demo hesaplar (ilk istekte otomatik oluşturulur)

| Rol | Kullanıcı adı | Şifre |
|---|---|---|
| Eğitmen | `egitmen` | `tavsan2026` |
| Öğrenci (eğitmene bağlı, sıfır hesap → önce okuma testi) | `ogrenci` | `tavsan2026` |
| Örnek öğrenci (28 günlük demo veri) | `ornek` | `tavsan2026` |

> Canlıya aldıktan sonra şifreleri Profil sayfasından değiştirin.

## Vercel’e kurulum

1. [vercel.com/new](https://vercel.com/new) → bu GitHub deposunu içe aktarın (Framework: Next.js, ayar gerekmez).
2. Proje → **Storage** → **Upstash for Redis** (ücretsiz plan) → projeye bağlayın. `KV_REST_API_URL` ve `KV_REST_API_TOKEN` otomatik eklenir.
3. Proje → **Settings → Environment Variables** → `AUTH_SECRET` = uzun rastgele bir değer.
4. **Redeploy**. İlk girişte demo hesaplar oluşturulur.

> Veritabanı bağlanmazsa uygulama yine çalışır ama veriler sunucu örneği yeniden başladığında silinir; panelde uyarı görünür.

## Yerel geliştirme

```bash
npm install
npm run dev     # http://localhost:3000 – veriler .data/ klasöründe tutulur
```

## Teknoloji
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · jose (JWT oturum) · Node scrypt (şifre) ·
Upstash Redis REST / Redis / JSON dosya sürücüsü.
