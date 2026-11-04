import type { Domain } from "./types";

export type Category = "goz" | "algi" | "dikkat" | "hafiza" | "matematik" | "dil" | "okuma";

export const CATEGORY_LABEL: Record<Category, string> = {
  goz: "Göz Egzersizleri",
  algi: "Görsel Algı",
  dikkat: "Dikkat & Tepki",
  hafiza: "Hafıza",
  matematik: "Zihinsel Matematik",
  dil: "Dil & Anlama",
  okuma: "Okuma",
};

export const CATEGORY_COLOR: Record<Category, { bg: string; fg: string }> = {
  goz: { bg: "var(--cat-goz-bg)", fg: "var(--cat-goz-fg)" },
  algi: { bg: "var(--cat-algi-bg)", fg: "var(--cat-algi-fg)" },
  dikkat: { bg: "var(--cat-dikkat-bg)", fg: "var(--cat-dikkat-fg)" },
  hafiza: { bg: "var(--cat-hafiza-bg)", fg: "var(--cat-hafiza-fg)" },
  matematik: { bg: "var(--cat-matematik-bg)", fg: "var(--cat-matematik-fg)" },
  dil: { bg: "var(--cat-dil-bg)", fg: "var(--cat-dil-fg)" },
  okuma: { bg: "var(--cat-okuma-bg)", fg: "var(--cat-okuma-fg)" },
};

export interface GameMeta {
  id: string;
  title: string;
  emoji: string;
  category: Category;
  /** short tagline */
  tag: string;
  /** contribution weights to each domain (reading = reading speed engine) */
  domains: Partial<Record<Domain | "reading", number>>;
  /** approximate active seconds */
  seconds: number;
  /** step by step instructions shown before the exercise */
  steps: string[];
  /** scientific rationale */
  why: string;
  /** keyboard hint */
  keys?: string;
  /** not offered in free practice / auto plan */
  hidden?: boolean;
}

export const GAMES: GameMeta[] = [
  /* ---------------- GÖZ ---------------- */
  {
    id: "sicrayan-tavsan",
    title: "Sıçrayan Tavşan",
    emoji: "🐰",
    category: "goz",
    tag: "Sakkad – hızlı göz sıçraması",
    domains: { attention: 1, reaction: 0.6 },
    seconds: 60,
    steps: [
      "Başını sabit tut, yalnızca gözlerinle tavşanı takip et.",
      "Tavşan çalışma alanında köşelere, ortaya ve farklı noktalara ışınlanacak; ritmi metronom belirler.",
      "Tavşan 🥕 havuca dönüşürse hemen ekrana dokun ya da BOŞLUK tuşuna bas.",
      "Havuç yokken basarsan hata sayılır – acele etme, dikkatle izle.",
    ],
    why: "Okurken göz sayfada sıçramalarla (sakkad) ilerler. Bu egzersiz hedefe hızlı ve isabetli göz sıçramasını çalıştırır; içine yerleştirilen havuç hedefleri sürdürülebilir dikkati ve tepki süreni ölçer.",
    keys: "BOŞLUK = havucu yakala",
  },
  {
    id: "kelebek-sayaci",
    title: "Kelebek Sayacı",
    emoji: "🦋",
    category: "goz",
    tag: "Takip + zihinden sayma",
    domains: { attention: 1, memory: 0.5 },
    seconds: 45,
    steps: [
      "Başlamadan önce hangi canlıyı sayacağın söylenecek (ör. 🦋 kelebek).",
      "İki farklı canlı metronom eşliğinde ekranda yer değiştirerek dolaşacak.",
      "Gözünle takip et ve yalnızca hedef canlının kaç kez göründüğünü içinden say.",
      "Süre bitince saydığın sayıyı gir.",
    ],
    why: "Göz takibini çalışan bellekte sayı tutmakla birleştirir. Dikkatin dağılmadan aynı anda iki işi yürütmek (bölünmüş/sürdürülebilir dikkat) okumada satır takibi ile anlamı birlikte tutmanın temelidir.",
  },
  {
    id: "goz-takibi",
    title: "Kayan Yıldız",
    emoji: "⭐",
    category: "goz",
    tag: "Düzgün takip (smooth pursuit)",
    domains: { attention: 0.8, reaction: 0.8 },
    seconds: 50,
    steps: [
      "Yıldız sonsuzluk, daire ve satır (zikzak) rotalarında akıcı biçimde kayacak.",
      "Başını oynatmadan yalnızca gözlerinle takip et.",
      "Yıldız kısa bir an 💥 parlarsa hemen dokun ya da BOŞLUK tuşuna bas.",
    ],
    why: "Düzgün takip hareketleri göz kaslarının koordinasyonunu ve satır sonundan yeni satıra geçiş (geri dönüş sakkadı) kontrolünü çalıştırır. Parlama hedefleri takip sırasında dikkatin kopmadığını doğrular.",
    keys: "BOŞLUK = parlamayı yakala",
  },
  /* ---------------- ALGI ---------------- */
  {
    id: "genisleyen-cerceve",
    title: "Genişleyen Çerçeve",
    emoji: "🔲",
    category: "algi",
    tag: "Görme alanı genişletme",
    domains: { attention: 1 },
    seconds: 60,
    steps: [
      "Ekran kararır; gözünü yalnızca ortadaki turuncu noktaya sabitle.",
      "Aynı oranlı dikdörtgenler büyükten küçüğe ve küçükten büyüğe değişecek.",
      "Ara ara çerçevenin iki ucunda harfler belirecek. Gözünü merkezden ayırmadan iki harfin AYNI mı FARKLI mı olduğunu söyle.",
    ],
    why: "Algısal genişlik (perceptual span) okurken tek bakışta işlenen harf sayısını belirler. Merkeze sabitlenmişken çevredeki uyaranları ayırt etmek periferik farkındalığı ve görsel dikkati çalıştırır.",
    keys: "A = Aynı · L = Farklı",
  },
  {
    id: "simsek-kelime",
    title: "Şimşek Kelime",
    emoji: "⚡",
    category: "algi",
    tag: "Takistoskop – anlık tanıma",
    domains: { attention: 1, reaction: 0.3 },
    seconds: 70,
    steps: [
      "Ortadaki artıya bak. Bir kelime ya da kelime grubu çok kısa bir süre görünüp kaybolacak.",
      "Ardından gelen 4 seçenekten gördüğünü seç.",
      "Doğru bildikçe süre kısalır ve kelimeler uzar; yanılırsan süre biraz uzar.",
    ],
    why: "Takistoskop çalışmaları kelime tanıma hızını ölçer. Uyarlamalı merdiven (staircase) yöntemi her öğrenci için %75 doğruluk eşiğini bulur; eşik süresinin kısalması görsel işleme hızındaki gelişimi gösterir.",
  },
  {
    id: "schulte",
    title: "Schulte Tablosu",
    emoji: "🔢",
    category: "algi",
    tag: "Çevresel görüş + görsel tarama",
    domains: { attention: 1, reaction: 0.5 },
    seconds: 60,
    steps: [
      "Tablodaki sayılara 1'den başlayarak sırayla dokun.",
      "Gözünü mümkün olduğunca tablonun ortasında tut, sayıları çevresel görüşünle bul.",
      "Yanlış dokunuş hata sayılır ama süre devam eder.",
    ],
    why: "Schulte tabloları görsel tarama hızını ve çevresel görüşü çalıştıran klasik bir dikkat egzersizidir. Tamamlama süresi ve hata oranı birlikte değerlendirilir.",
  },
  {
    id: "ayni-mi",
    title: "Aynı mı, Farklı mı?",
    emoji: "👯",
    category: "algi",
    tag: "Kelime ayırt etme",
    domains: { attention: 1, reaction: 0.7 },
    seconds: 45,
    steps: [
      "Ekranda iki kelime yan yana belirecek (ör. kalem – kelam).",
      "Kelimeler tamamen aynıysa AYNI, tek harf bile farklıysa FARKLI'ya bas.",
      "Hem hızlı hem doğru olmaya çalış.",
    ],
    why: "Benzer kelimeleri hızla ayırt etmek kelime tanıma hassasiyetini artırır; okurken yanlış okuma ve geri dönüşleri azaltmaya yardımcı olur. Doğru tepki süresi ve doğruluk birlikte (ters verim skoru) hesaplanır.",
    keys: "A = Aynı · L = Farklı",
  },
  /* ---------------- DİKKAT ---------------- */
  {
    id: "kelime-avi",
    title: "Kelime Avı",
    emoji: "🔍",
    category: "dikkat",
    tag: "Görsel arama",
    domains: { attention: 1 },
    seconds: 60,
    steps: [
      "Üstte hedef kelime yazar. Altındaki tabloda benzer kelimeler arasında hedefin tüm kopyalarını bul.",
      "Hepsini bulunca yeni tabloya geçilir.",
      "Yanlış kelimeye dokunmak puan düşürür.",
    ],
    why: "Benzer çeldiriciler arasında hedef aramak seçici dikkati ve görsel ayırt etme becerisini çalıştırır.",
  },
  {
    id: "dur-gec",
    title: "Dur – Geç",
    emoji: "🚦",
    category: "dikkat",
    tag: "Dürtü kontrolü (Go/No-Go)",
    domains: { attention: 1, reaction: 0.8 },
    seconds: 60,
    steps: [
      "Ekranda 🐰 tavşan çıkınca hemen dokun ya da BOŞLUK'a bas.",
      "🦊 tilki çıkınca hiçbir şey yapma!",
      "Tavşanlar sık geldiği için parmağın alışacak – tilkiye basmamak için dikkatli ol.",
    ],
    why: "Go/No-Go görevi tepki ketlemenin (dürtü kontrolü) standart ölçümüdür. İsabet oranı, yanlış alarm oranı ve tepki süresi ayrı ayrı hesaplanır.",
    keys: "BOŞLUK = tavşan",
  },
  {
    id: "ok-yagmuru",
    title: "Ok Yağmuru",
    emoji: "🏹",
    category: "dikkat",
    tag: "Seçici dikkat (Flanker)",
    domains: { attention: 1, reaction: 0.8 },
    seconds: 60,
    steps: [
      "Ekranda beş ok görünecek. YALNIZCA ortadaki okun yönüne bak.",
      "Ortadaki ok sola bakıyorsa SOL, sağa bakıyorsa SAĞ butonuna bas.",
      "Yandaki oklar seni yanıltmaya çalışacak!",
    ],
    why: "Eriksen Flanker görevi çevredeki çeldiricileri bastırıp hedefe odaklanma becerisini ölçer. Uyumsuz denemelerdeki yavaşlama (çatışma maliyeti) dikkat kontrolünü gösterir.",
    keys: "← SOL · → SAĞ",
  },
  {
    id: "renk-tuzagi",
    title: "Renk Tuzağı",
    emoji: "🎨",
    category: "dikkat",
    tag: "Stroop etkisi",
    domains: { attention: 1, reaction: 0.6 },
    seconds: 60,
    steps: [
      "Ekranda renk adları yazacak (ör. KIRMIZI), ama farklı renkte boyanmış olacak.",
      "Kelimeyi okuma! Yazının BOYANDIĞI rengi seç.",
      "Hızlı ve doğru olmaya çalış.",
    ],
    why: "Stroop görevi otomatik okuma eğilimini bastırma (bilişsel kontrol) becerisini ölçen en bilinen testlerden biridir.",
    keys: "1-4 tuşları",
  },
  {
    id: "farkli-olan",
    title: "Farklı Olanı Bul",
    emoji: "🧐",
    category: "dikkat",
    tag: "Ayrıntıya dikkat",
    domains: { attention: 1, reaction: 0.5 },
    seconds: 60,
    steps: [
      "Tablodaki şekillerin hepsi aynı – biri hariç.",
      "Farklı olanı bul ve dokun.",
      "Her doğru cevapta tablo büyür ve farklar incelir.",
    ],
    why: "Benzer uyaranlar arasında tek farkı bulmak (görsel arama) dikkat odağını ve ayrıntı algısını geliştirir; okurken benzer harfleri (b/d, ı/i) ayırt etmeye katkı sağlar.",
  },
  {
    id: "tepki-avcisi",
    title: "Tepki Avcısı",
    emoji: "🥕",
    category: "dikkat",
    tag: "Basit & seçimli tepki süresi",
    domains: { reaction: 1 },
    seconds: 45,
    steps: [
      "Ekran yeşile döner ve havuç çıkar çıkmaz dokun ya da BOŞLUK'a bas.",
      "Havuç çıkmadan basarsan 'erken' sayılır.",
      "İleri seviyelerde havuç sağda ya da solda çıkar; doğru tarafa bas (← →).",
    ],
    why: "Basit ve seçimli tepki süresi bilgi işleme hızının temel göstergesidir. Ortalama doğru tepki süresi ve erken basma oranı ölçülür.",
    keys: "BOŞLUK · ← →",
  },
  /* ---------------- HAFIZA ---------------- */
  {
    id: "donen-kare",
    title: "Dönen Kare",
    emoji: "🧊",
    category: "hafiza",
    tag: "Görsel-uzamsal bellek + zihinsel döndürme",
    domains: { memory: 1, attention: 0.4 },
    seconds: 75,
    steps: [
      "Karelerden bazıları kısa süre boyanacak – yerlerini aklında tut.",
      "Sonra kare yüz 90°, 180° ya da 270° dönecek ve boyalar silinecek.",
      "Döndükten sonra boyalı karelerin yeni yerlerini işaretle ve ONAYLA'ya bas.",
    ],
    why: "Görsel-uzamsal çalışan bellek ile zihinsel döndürmeyi birlikte çalıştırır. Doğru hatırlanan kare sayısı ve ulaşılan seviye bellek kapasitesini gösterir.",
  },
  {
    id: "isik-yolu",
    title: "Işık Yolu",
    emoji: "💡",
    category: "hafiza",
    tag: "Sıralı uzamsal bellek (Corsi)",
    domains: { memory: 1 },
    seconds: 70,
    steps: [
      "Kareler sırayla yanıp sönecek.",
      "Işık bittikten sonra aynı sırayla karelere dokun.",
      "Her doğru cevapta dizi bir uzar; ileri seviyelerde sırayı TERSTEN girmen istenir.",
    ],
    why: "Corsi blok görevi görsel-uzamsal kısa süreli belleğin klasik ölçümüdür. Ulaşılan en uzun dizi (bellek uzamı) kaydedilir.",
  },
  {
    id: "sayi-hafizasi",
    title: "Sayı Hafızası",
    emoji: "🔟",
    category: "hafiza",
    tag: "Sayı dizisi uzamı",
    domains: { memory: 1 },
    seconds: 70,
    steps: [
      "Rakamlar ekranda tek tek görünecek.",
      "Dizi bitince rakamları aynı sırayla gir.",
      "Doğru bildikçe dizi uzar. İki kez üst üste yanılırsan egzersiz biter.",
    ],
    why: "Sayı dizisi uzamı (digit span) sözel çalışan belleğin en yaygın ölçümüdür. Okurken cümlenin başını akılda tutabilmek bu kapasiteye bağlıdır.",
    keys: "Rakam tuşları + ENTER",
  },
  {
    id: "hafiza-treni",
    title: "Hafıza Treni",
    emoji: "🚂",
    category: "hafiza",
    tag: "N-geri (n-back)",
    domains: { memory: 1, attention: 0.6 },
    seconds: 70,
    steps: [
      "Vagonlarda sırayla harfler gelecek.",
      "Gelen harf N adım önceki harfle aynıysa EŞLEŞTİ butonuna bas (N seviyeye göre 1, 2 ya da 3).",
      "Aynı değilse hiçbir şey yapma.",
    ],
    why: "N-geri görevi çalışan belleği güncelleme becerisini ölçer. Meta-analizler n-back çalışmasının en çok benzer bellek görevlerine aktarıldığını gösterir; bu yüzden ilerlemeyi bellek alanında takip ederiz.",
    keys: "BOŞLUK = eşleşti",
  },
  {
    id: "kelime-hafizasi",
    title: "Kelime Hafızası",
    emoji: "📝",
    category: "hafiza",
    tag: "Sözel tanıma belleği",
    domains: { memory: 1 },
    seconds: 70,
    steps: [
      "Bir kelime listesi kısa süre gösterilecek – olabildiğince çoğunu aklında tut.",
      "Sonra kelimeler tek tek gelecek: listede var mıydı?",
      "GÖRDÜM ya da GÖRMEDİM butonuna bas.",
    ],
    why: "Sözel tanıma belleği okuduğunu hatırlamanın temelidir. Doğru tanıma ile yanlış alarmlar birlikte değerlendirilir (sinyal algılama yaklaşımı).",
    keys: "A = Gördüm · L = Görmedim",
  },
  /* ---------------- MATEMATİK ---------------- */
  {
    id: "roket-siralama",
    title: "Roket Sıralama",
    emoji: "🚀",
    category: "matematik",
    tag: "Büyükten küçüğe sıralama",
    domains: { math: 0.8, attention: 0.6, reaction: 0.4 },
    seconds: 60,
    steps: [
      "Ekranda rastgele sayıda kutu belirecek, içlerinde sayılar var.",
      "Kutulara BÜYÜKTEN KÜÇÜĞE doğru sırayla dokun.",
      "Her doğru turda roket yükselir. İleri seviyelerde kutularda işlemler (3+4) çıkar.",
    ],
    why: "Sayı büyüklüğünü hızla karşılaştırma (sayı hissi) zihinsel matematiğin temelidir. İşlem içeren seviyeler hesaplamayı görsel tarama ile birleştirir.",
  },
  {
    id: "zihinden-hesap",
    title: "Zihinden Hesap",
    emoji: "🧮",
    category: "matematik",
    tag: "Aritmetik akıcılık",
    domains: { math: 1 },
    seconds: 60,
    steps: [
      "İşlemleri zihinden çöz ve cevabı tuş takımıyla gir.",
      "Doğru cevapta otomatik olarak sonraki işleme geçilir.",
      "Doğru yaptıkça işlemler zorlaşır.",
    ],
    why: "Aritmetik akıcılık (dakikada doğru işlem) zihinsel matematiğin en güvenilir ölçümüdür. Zorluk uyarlamalı olarak artar.",
    keys: "Rakam tuşları + ENTER",
  },
  {
    id: "sayi-zinciri",
    title: "Sayı Zinciri",
    emoji: "⛓️",
    category: "matematik",
    tag: "Zincirleme işlem",
    domains: { math: 1, memory: 0.6 },
    seconds: 70,
    steps: [
      "Bir başlangıç sayısı ve ardından işlemler tek tek gösterilecek (+3, ×2, −5...).",
      "Her adımda sonucu zihninde güncelle; hiçbir şey yazma.",
      "Zincir bitince son sonucu gir.",
    ],
    why: "Ara sonucu bellekte tutarken yeni işlem yapmak çalışan bellek ile aritmetiği birlikte zorlar.",
    keys: "Rakam tuşları + ENTER",
  },
  {
    id: "hangisi-buyuk",
    title: "Hangisi Büyük?",
    emoji: "⚖️",
    category: "matematik",
    tag: "Hızlı karşılaştırma",
    domains: { math: 1, reaction: 0.5 },
    seconds: 45,
    steps: [
      "İki ifade yan yana gelecek (sayı, işlem ya da kesir).",
      "Değeri BÜYÜK olan tarafa dokun.",
      "Hız ve doğruluk birlikte puanlanır.",
    ],
    why: "Sayısal büyüklükleri ve işlem sonuçlarını hızlıca kestirmek sayı hissini ve hesaplama hızını geliştirir.",
    keys: "← SOL · → SAĞ",
  },
  /* ---------------- YENİ: DİKKAT ---------------- */
  {
    id: "bilgi-avi",
    title: "Bilgi Avı",
    emoji: "🔎",
    category: "dikkat",
    tag: "Metinde tarama (scanning)",
    domains: { attention: 1, reaction: 0.4 },
    seconds: 75,
    steps: [
      "Üstte aranacak kelime yazar. Metni baştan okumana gerek yok – gözünle tara.",
      "Kelimeyi metinde bulunca üzerine dokun.",
      "Her bulduğunda yeni bir hedef gelir. Yanlış kelimeye dokunmak hata sayılır.",
    ],
    why: "Tarama (scanning), belirli bir bilgiyi metnin tamamını okumadan bulma becerisidir ve sınavlarda, araştırmalarda en çok kullanılan okuma stratejilerinden biridir. Bulma süresi ve doğruluk birlikte ölçülür.",
  },
  {
    id: "isaretleme",
    title: "İşaretleme Testi",
    emoji: "✏️",
    category: "dikkat",
    tag: "Seçici dikkat (d2 tipi)",
    domains: { attention: 1, reaction: 0.3 },
    seconds: 75,
    steps: [
      "Satırlarda üstünde ve altında küçük çizgiler olan d ve p harfleri var.",
      "Yalnızca toplam İKİ çizgisi olan d harflerine dokun (üstte 2, altta 2 ya da üstte 1 + altta 1).",
      "Her sayfa için süren sınırlı; bitirince 'Sonraki sayfa'ya geç.",
    ],
    why: "d2 dikkat testinden esinlenen bu görev, benzer uyaranlar arasında hedefi hızla seçmeyi ölçer. Konsantrasyon puanı = doğru işaret − yanlış işaret; atlanan hedefler ayrıca raporlanır.",
  },
  /* ---------------- YENİ: HAFIZA ---------------- */
  {
    id: "hafiza-kartlari",
    title: "Hafıza Kartları",
    emoji: "🃏",
    category: "hafiza",
    tag: "Eşleştirme belleği",
    domains: { memory: 1, attention: 0.3 },
    seconds: 90,
    steps: [
      "Kartlar ters çevrili. İki kart açarak aynı resimleri eşleştir.",
      "Eşleşmeyen kartlar tekrar kapanır – yerlerini aklında tut.",
      "Ne kadar az hamlede bitirirsen puanın o kadar yüksek olur.",
    ],
    why: "Eşleştirme oyunu görsel-uzamsal kısa süreli belleği ve yer-nesne bağlantısını çalıştırır. Verimlilik = çift sayısı ÷ hamle sayısı olarak hesaplanır.",
  },
  /* ---------------- YENİ: DİL & ANLAMA ---------------- */
  {
    id: "cumle-dogrulama",
    title: "Doğru mu, Yanlış mı?",
    emoji: "✅",
    category: "dil",
    tag: "Sessiz okuma verimliliği",
    domains: { reading: 1, attention: 0.4 },
    seconds: 90,
    steps: [
      "Ekranda kısa cümleler belirecek. Sessizce oku.",
      "Cümle doğruysa DOĞRU, yanlışsa YANLIŞ butonuna bas.",
      "90 saniyede olabildiğince çok cümleyi doğru değerlendirmeye çalış.",
    ],
    why: "Bu görev, sessiz okuma verimliliğini ölçen TOSREC gibi standart testlerin cümle doğrulama yöntemine dayanır: hem hızlı okumayı hem de anlamayı aynı anda gerektirir. Dakikada doğru cümle sayısı izlenir.",
    keys: "A = Doğru · L = Yanlış",
  },
  {
    id: "labirent-okuma",
    title: "Labirent Okuma",
    emoji: "🧭",
    category: "dil",
    tag: "Bağlamdan doğru kelimeyi seç (maze)",
    domains: { reading: 1, attention: 0.5 },
    seconds: 120,
    steps: [
      "Metni okurken bazı yerlerde üç kelimelik seçenek kutuları göreceksin.",
      "Cümleye anlamca uyan kelimeye dokunarak okumaya devam et.",
      "Süre bitene kadar olabildiğince ilerle – hem hız hem doğruluk önemli.",
    ],
    why: "'Maze' görevi, okuduğunu anlayarak ilerlemeyi ölçen yaygın bir okuma ölçeğidir: yaklaşık her yedinci kelime üç seçenekle değiştirilir. Doğru seçim için cümlenin anlamını takip etmek gerekir.",
  },
  {
    id: "kelime-ustasi",
    title: "Kelime Ustası",
    emoji: "📚",
    category: "dil",
    tag: "Eş ve zıt anlamlılar",
    domains: { memory: 1 },
    seconds: 60,
    steps: [
      "Ekrana bir kelime ve görev gelir: EŞ ANLAMLISI ya da ZIT ANLAMLISI.",
      "Dört seçenekten doğru olanı seç.",
      "Doğru yaptıkça daha zor kelimeler gelir.",
    ],
    why: "Araştırmalar okuma hızının ve anlamanın merkezinde dil bilgisi ve kelime dağarcığı olduğunu gösterir. Tanıdık kelimeler daha kısa sabitlenmeyle okunur; bu yüzden kelime çalışması gerçek okuma hızına katkı verir.",
  },
  /* ---------------- OKUMA ---------------- */
  {
    id: "rehberli-okuma",
    title: "Rehberli Okuma",
    emoji: "📖",
    category: "okuma",
    tag: "Hız rehberi + anlama",
    domains: { reading: 1 },
    seconds: 90,
    steps: [
      "Metin ekrana gelecek; bir ışık bandı satırlar üzerinde senin için belirlenen hızda ilerleyecek.",
      "Gözünü bandın üzerinde tut ve onunla birlikte oku. Geri dönme.",
      "Metin bitince anlama soruları gelecek – hız ancak anlama iyi olursa artar.",
    ],
    why: "Hız rehberli (pacer) okuma, geri dönüşleri azaltır ve okuru konforlu hızının biraz üstünde tutar. Bilimsel araştırmalar hız ile anlama arasında denge olduğunu gösterir; bu yüzden hızın artması anlama oranına bağlıdır (%80 üstü → hız artar, %60 altı → yavaşlar).",
  },
  {
    id: "blok-okuma",
    title: "Blok Okuma",
    emoji: "🧱",
    category: "okuma",
    tag: "Kelime grupları halinde okuma",
    domains: { reading: 1 },
    seconds: 80,
    steps: [
      "Metin, 2–4 kelimelik anlamlı gruplar halinde ekranın ortasında akacak.",
      "Her grubu tek bakışta bir bütün olarak algılamaya çalış.",
      "Akış bitince anlama soruları gelecek.",
    ],
    why: "Kelimeleri anlamlı öbekler halinde algılamak sabitlenme sayısını azaltır. Hız, ölçülen okuma hızına ve anlama başarına göre otomatik ayarlanır.",
  },
  {
    id: "golge-okuma",
    title: "Gölgeli Okuma",
    emoji: "🌗",
    category: "okuma",
    tag: "Gölgeleme ile grup okuma",
    domains: { reading: 1 },
    seconds: 90,
    steps: [
      "Metin dar sütunlar halinde gösterilecek; kelime grupları sırayla aydınlanacak.",
      "Yalnızca aydınlanan gruba bak; gölgede kalan kısımları okumaya çalışma.",
      "Bitince anlama soruları gelecek.",
    ],
    why: "Gölgeleme tekniği gözün her sabitlenmede daha geniş bir grubu almasını teşvik eder. Dar sütun, satır başına sabitlenme sayısını azaltır.",
  },
  {
    id: "okuma-testi",
    title: "Okuma Hızı Testi",
    emoji: "⏱️",
    category: "okuma",
    tag: "Hız + anlama ölçümü",
    domains: { reading: 1 },
    seconds: 180,
    steps: [
      "Normal okuma hızında, anlayarak oku. Acele etme – sonunda sorular var.",
      "BAŞLA'ya bastığında süre başlar; metni bitirince BİTİRDİM'e bas.",
      "Ardından 5 anlama sorusu gelecek. Hızın ve anlama oranın birlikte hesaplanacak.",
    ],
    why: "Okuma hızı (kelime/dk) tek başına yanıltıcıdır. Bu yüzden Etkili Okuma Hızı = hız × anlama oranı hesaplanır. Program tüm egzersiz hızlarını bu ölçüme göre otomatik belirler.",
    hidden: true,
  },
];

export const GAME_MAP: Record<string, GameMeta> = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export function primaryDomain(g: GameMeta): Domain | "reading" {
  let best: Domain | "reading" = "attention";
  let w = -1;
  for (const [d, v] of Object.entries(g.domains)) {
    if ((v ?? 0) > w) {
      w = v ?? 0;
      best = d as Domain | "reading";
    }
  }
  return best;
}
