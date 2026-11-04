/** Sık kullanılan Türkçe kelimeler (uzunluğa göre). */
export const WORDS: string[] = Array.from(new Set((
  "ev göz yol kuş süt dal gül kar yaz kış ata ağaç deniz kitap kalem masa okul sınıf bahçe çiçek " +
  "kapı pencere bulut güneş yıldız orman nehir dağlar tavşan havuç kelebek arılar balık köpek kedi " +
  "sabah akşam gece öğle hafta takvim saat zaman dakika saniye hızlı yavaş büyük küçük uzun kısa " +
  "mavi yeşil sarı kırmızı turuncu mor beyaz siyah gri pembe elma armut kiraz üzüm muz karpuz " +
  "limon portakal ekmek peynir zeytin yumurta çorba yemek mutfak tabak çatal kaşık bardak sandalye " +
  "defter silgi cetvel çanta tahta öğrenci öğretmen arkadaş kardeş anne baba dede nine teyze amca " +
  "şehir köy kasaba sokak cadde meydan köprü liman tren uçak gemi araba bisiklet otobüs yolcu " +
  "harita pusula yolculuk macera hikâye masal şiir roman cümle kelime harf hece paragraf sayfa " +
  "bilgi bilim deney gözlem merak soru cevap düşünce fikir hayal umut sevgi saygı cesaret sabır " +
  "dikkat hafıza odak tepki hesap sayı rakam toplam çarpım bölüm kesir oran yüzde ölçü metre " +
  "toprak taş kum kaya volkan ada göl kıyı dalga rüzgâr yağmur fırtına şimşek gökkuşağı bulutlar " +
  "kalemlik kütüphane laboratuvar bilgisayar televizyon telefon fotoğraf resim müzik şarkı oyun " +
  "futbol basketbol voleybol koşu yüzme satranç bulmaca labirent hazine anahtar kilit kutu sepet " +
  "yaprak kök dal tohum fidan meyve sebze tarla çiftlik ahır inek koyun keçi tavuk horoz ördek"
)
  .split(/\s+/)
  .filter(Boolean)));

export function wordsOfLength(min: number, max: number) {
  return WORDS.filter((w) => w.length >= min && w.length <= max);
}

const SIMILAR: Record<string, string[]> = {
  a: ["e", "o"], e: ["a", "o"], ı: ["i", "l"], i: ["ı", "l"], o: ["ö", "a", "u"], ö: ["o", "ü"], u: ["ü", "o"], ü: ["u", "ö"],
  b: ["d", "p"], d: ["b", "p"], p: ["b", "q"], m: ["n"], n: ["m", "r"], r: ["n"], s: ["ş", "z"], ş: ["s"], c: ["ç", "e"], ç: ["c"],
  g: ["ğ", "q"], ğ: ["g"], k: ["h"], h: ["k", "b"], l: ["i", "t"], t: ["l", "f"], f: ["t"], y: ["v"], v: ["y"], z: ["s"],
};

/** Creates a visually similar but different word (one letter changed or two letters swapped). */
export function similarWord(word: string, rand: () => number = Math.random): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const chars = [...word];
    if (rand() < 0.35 && chars.length > 3) {
      const i = 1 + Math.floor(rand() * (chars.length - 2));
      [chars[i], chars[i - 1]] = [chars[i - 1], chars[i]];
    } else {
      const i = Math.floor(rand() * chars.length);
      const opts = SIMILAR[chars[i]];
      if (!opts) continue;
      chars[i] = opts[Math.floor(rand() * opts.length)];
    }
    const out = chars.join("");
    if (out !== word) return out;
  }
  return word.slice(0, -1) + (word.endsWith("a") ? "e" : "a");
}

export const COLORS: { name: string; hex: string }[] = [
  { name: "KIRMIZI", hex: "#E11D48" },
  { name: "MAVİ", hex: "#2563EB" },
  { name: "YEŞİL", hex: "#16A34A" },
  { name: "SARI", hex: "#EAB308" },
];

export const NBACK_LETTERS = ["B", "D", "K", "M", "R", "S", "T", "Z"];
