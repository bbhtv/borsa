import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { HeroDevice } from "@/components/landing/HeroDevice";
import { ExerciseShowcase } from "@/components/landing/ExerciseShowcase";
import { GAMES } from "@/lib/catalog";
import { ThemeToggle } from "@/components/ui/Theme";

export const dynamic = "force-dynamic";

const DOMAINS = [
  {
    e: "⚡",
    t: "Tepki Süresi",
    c: "#E8890C",
    d: "Basit ve seçimli tepki, Go/No-Go ve hızlı karşılaştırma görevleri.",
    m: "Ters verim skoru (süre ÷ doğruluk) – tahminle kazanılan hız cezalandırılır.",
  },
  {
    e: "🎯",
    t: "Dikkat ve Odaklanma",
    c: "#0AA5BC",
    d: "Flanker, Stroop, Schulte, görsel arama, görme alanı ve takistoskop.",
    m: "Çatışma altındaki doğruluk ve hız; algı eşiği (ms) ve tarama hızı.",
  },
  {
    e: "🧠",
    t: "Hafıza",
    c: "#6D4AE8",
    d: "Corsi blokları, sayı dizisi uzamı, n-geri, dönen kare ve kelime tanıma.",
    m: "Bellek uzamı, isabet − yanlış alarm (sinyal algılama) ve ulaşılan seviye.",
  },
  {
    e: "➗",
    t: "Zihinsel Matematik",
    c: "#16A34A",
    d: "Zihinden hesap, sayı zinciri, roket sıralama ve büyüklük karşılaştırma.",
    m: "Dakikada doğru işlem × zorluk ağırlığı; uyarlamalı zorluk merdiveni.",
  },
];

const FAQ = [
  [
    "Okuma hızımı kendim mi ayarlıyorum?",
    "Hayır. İlk girişte bir okuma testi ve 4 mini ölçüm yapılır. Tüm egzersizlerin hızı ve temposu bu sonuçlara göre otomatik belirlenir; okuma egzersizlerinde anlama oranın %80'in üzerindeyse hız artar, %60'ın altına düşerse yavaşlar.",
  ],
  [
    "Gelişim yüzdeleri nasıl hesaplanıyor?",
    "Her egzersiz doğruluk, tepki süresi ve ulaşılan zorluğu tek bir performans puanına çevirir. Son 3 oturumun ortalaması ilk 2 oturumla karşılaştırılır. Alan puanı (tepki, dikkat, hafıza, matematik), o alanı çalıştıran egzersizlerin güvenilirliğe göre ağırlıklı ortalamasıdır.",
  ],
  [
    "Hızlı okuma gerçekten işe yarıyor mu?",
    "Bilimsel literatür, anlamayı kaybetmeden hızın sınırsız artırılamayacağını gösterir (Rayner ve ark., 2016). Bu yüzden Tavşan yalnızca hızı değil, Etkili Okuma Hızını (hız × anlama) ölçer ve hızı ancak anlama korunduğunda artırır. Asıl kazanım düzenli okuma pratiği, akıcılık ve dikkat becerilerinden gelir.",
  ],
  [
    "Eğitmen neleri görebiliyor?",
    "Eğitmen; öğrencisinin başlangıç ve güncel okuma hızını, anlama oranını, 4 bilişsel alandaki % gelişimini, günlük programın ne kadarını yaptığını ve tüm oturumlarını görür. Dilediği egzersizleri ödev olarak atayabilir.",
  ],
  [
    "Günde ne kadar çalışmak gerekiyor?",
    "Günlük program 12 adımdan oluşur ve yaklaşık 15–20 dakika sürer: göz ısınması, algı, rehberli okuma, bilişsel oyunlar ve kapanış okuma çalışması. Haftada en az 4–5 gün düzenli çalışma önerilir.",
  ],
];

export default async function Landing() {
  const s = await getSession();
  const panel = s ? (s.role === "teacher" ? "/egitmen" : "/ogrenci") : null;
  const cta = panel ? { href: panel, label: "Panele Git" } : { href: "/giris", label: "Giriş Yap" };

  return (
    <div className="bg-bg text-ink">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-deep-3 text-white">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/30 blur-[120px]" />
        <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-grape/30 blur-[120px]" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center gap-6 px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Tavşan">
            <Logo white height={34} />
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm font-bold text-white/70 md:flex">
            <a href="#nasil" className="hover:text-white">Nasıl çalışır?</a>
            <a href="#alanlar" className="hover:text-white">Gelişim alanları</a>
            <a href="#egzersizler" className="hover:text-white">Egzersizler</a>
            <a href="#bilim" className="hover:text-white">Bilim</a>
            <a href="#egitmen" className="hover:text-white">Eğitmenler</a>
          </nav>
          <ThemeToggle className="ml-auto bg-white/10 text-white hover:bg-white/20" />
          <Link href={cta.href} className="btn-3d rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_#07879B] hover:brightness-110 sm:text-base">
            {cta.label}
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-16">
          <div className="flex flex-col gap-6" style={{ animation: "fadeUp .7s both" }}>
            <span className="self-start rounded-full border border-logo/30 bg-logo/10 px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-logo">
              ✦ Bilimsel temelli · Uyarlamalı · Ölçülebilir
            </span>
            <h1 className="text-balance text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Daha hızlı oku.
              <br />
              <span className="bg-gradient-to-r from-logo via-brand to-carrot bg-clip-text text-transparent">Daha derin anla.</span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-white/75">
              Tavşan; okuma hızını anlamayı kaybetmeden geliştiren, her öğrenciyi önce ölçen ve tüm egzersizleri ona göre otomatik ayarlayan premium hızlı okuma platformu.
              Tepki süresi, dikkat, hafıza ve zihinsel matematik gelişimini yüzde olarak gösterir.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={cta.href} className="btn-3d rounded-[20px] bg-brand px-8 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#07879B] hover:brightness-110">
                {cta.label} →
              </Link>
              <a href="#nasil" className="rounded-[20px] border border-white/20 bg-white/5 px-7 py-4 text-lg font-extrabold text-white hover:bg-white/10">
                Nasıl çalışır?
              </a>
            </div>
            <div className="mt-2 grid max-w-lg grid-cols-3 gap-3">
              {[
                [String(GAMES.length), "bilimsel egzersiz"],
                ["4", "bilişsel alan + okuma"],
                ["%100", "otomatik hız ayarı"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <div className="text-2xl font-extrabold text-logo">{v}</div>
                  <div className="text-xs font-bold text-white/60">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ animation: "fadeUp .9s .15s both" }}>
            <HeroDevice />
          </div>
        </div>
      </section>

      {/* ================= VALUE STRIP ================= */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-3 rounded-[30px] border border-line bg-surface p-4 shadow-lift sm:grid-cols-3 sm:p-5">
          {[
            ["📏", "Önce ölçer", "Okuma testi + 4 mini test ile başlangıç seviyesi belirlenir."],
            ["🎛️", "Kendini ayarlar", "Hız, tempo ve zorluk performansa göre her gün yeniden hesaplanır."],
            ["📈", "Gelişimi kanıtlar", "Her alan başlangıca göre % olarak raporlanır – öğrenciye de eğitmene de."],
          ].map(([e, t, d]) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl p-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-2xl">{e}</span>
              <div>
                <div className="font-extrabold">{t}</div>
                <div className="text-sm font-semibold text-slate">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW ================= */}
      <section id="nasil" className="mx-auto max-w-6xl scroll-mt-10 px-5 py-24 sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Nasıl çalışır?</span>
          <h2 className="mt-2 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">Üç adımda kişisel antrenman</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "Ölç", "İlk girişte öğrenci bir metni okur ve anlama sorularını yanıtlar. Ardından tepki, dikkat, hafıza ve matematik için kısa ölçümler gelir.", "📄"],
            ["02", "Çalış", "Her gün 12 adımlık program: göz ısınması → algı → rehberli okuma → zayıf alana öncelik veren bilişsel oyunlar → kapanış okuması. Tam ekran, odaklı.", "🎯"],
            ["03", "Gelişimi gör", "Okuma hızı, anlama ve etkili okuma hızı ile 4 alanın % gelişimi grafiklerle izlenir. Haftalık ölçüm otomatik eklenir.", "📈"],
          ].map(([n, t, d, e]) => (
            <div key={n} className="relative flex flex-col gap-3 overflow-hidden rounded-[30px] border border-line bg-surface p-7 shadow-card">
              <span className="absolute right-5 top-4 text-6xl font-extrabold text-bg">{n}</span>
              <span className="relative text-4xl">{e}</span>
              <h3 className="relative text-2xl font-extrabold">{t}</h3>
              <p className="relative font-medium leading-relaxed text-slate">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= DOMAINS ================= */}
      <section id="alanlar" className="scroll-mt-10 bg-surface py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 grid items-end gap-6 lg:grid-cols-2">
            <div>
              <span className="text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Hesaplama motoru</span>
              <h2 className="mt-2 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">Sadece hız değil, beynin tamamı.</h2>
            </div>
            <p className="text-lg font-medium leading-relaxed text-slate">
              Her egzersiz, bilişsel psikolojide kabul görmüş bir paradigmaya dayanır ve sonucunu ilgili alanlara ağırlıklı olarak işler.
              Böylece okuma hızının yanında dört temel beceri de başlangıca göre yüzde olarak izlenir.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAINS.map((d) => (
              <div key={d.t} className="flex flex-col gap-3 rounded-[28px] border border-line bg-bg p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: d.c + "22" }}>
                  {d.e}
                </span>
                <h3 className="text-xl font-extrabold">{d.t}</h3>
                <p className="text-sm font-semibold text-slate">{d.d}</p>
                <p className="mt-auto rounded-2xl bg-surface p-3 text-xs font-bold text-ink ring-1 ring-line">📐 {d.m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PREMIUM ================= */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Premium deneyim</span>
          <h2 className="mt-2 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">Egzersizlerin ötesinde</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["📝", "Kendi metnini oku", "Ders kitabından ya da bir makaleden metni yapıştır; rehberli, blok ya da gölgeli modda otomatik hızında okut."],
            ["📚", "Kitap okuma takibi", "Gerçek kitabını kronometreyle oku, sayfa sayısını gir: gerçek hayattaki okuma hızın ve okuduğun sayfalar kaydedilsin."],
            ["🔤", "Okuma ayarları", "Lexend ve kitap yazı tipleri, büyük yazı, geniş satır aralığı ve satır geçişini kolaylaştıran renkli satırlar."],
            ["👀", "Göz molası", "Her 4 egzersizde bir 20 saniyelik 20-20-20 molası: uzağa bak, gözlerini dinlendir."],
            ["🌙", "Koyu mod", "Akşam çalışmaları için göz yormayan koyu tema; tek dokunuşla ya da cihaz ayarına göre."],
            ["🖨️", "Rapor & dışa aktarma", "Öğrenci gelişim raporu yazdırılabilir / PDF; eğitmen tüm sınıfı tek tıkla Excel (CSV) olarak indirir."],
          ].map(([e, t, d]) => (
            <div key={t} className="flex gap-4 rounded-[26px] border border-line bg-surface p-5 shadow-card">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-2xl">{e}</span>
              <div>
                <h3 className="font-extrabold">{t}</h3>
                <p className="text-sm font-semibold text-slate">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= EXERCISES ================= */}
      <section id="egzersizler" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-24 sm:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Egzersiz kütüphanesi</span>
          <h2 className="mt-2 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">{GAMES.length} egzersiz, tek bir akıllı program</h2>
          <p className="mt-3 text-lg font-medium text-slate">Her egzersiz başlamadan önce ne yapılacağını ve neden işe yaradığını anlatır; seviyeye göre kendiliğinden zorlaşır.</p>
        </div>
        <ExerciseShowcase />
      </section>

      {/* ================= SCIENCE ================= */}
      <section id="bilim" className="scroll-mt-10 bg-deep-3 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-extrabold uppercase tracking-widest text-logo">Abartı yok, ölçüm var</span>
            <h2 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">Anlamadan okunan kelime, okunmuş sayılmaz.</h2>
            <p className="text-lg font-medium leading-relaxed text-white/75">
              Araştırmalar hız ile anlama arasında bir denge olduğunu gösteriyor. Bu yüzden Tavşan, sayfayı ne kadar hızlı çevirdiğini değil,
              <b className="text-logo"> Etkili Okuma Hızını</b> (kelime/dk × anlama oranı) takip eder ve hızını yalnızca anlaman korunduğunda artırır.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Anlama ≥ %80 → antrenman hızı +%4 · %60–80 → +%1,5 · < %60 → −%6 (en fazla ölçülen hızın 1,6 katı)",
                "Uyarlamalı merdiven yöntemiyle her öğrenci için ~%75 başarı eşiği",
                "Haftalık ölçüm: farklı metinle hız ve anlama yeniden ölçülür",
                "Geri dönüşleri azaltan hız rehberi ve kelime grubu (öbek) okuma",
              ].map((x) => (
                <li key={x} className="flex gap-3 font-semibold text-white/85">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-logo text-sm text-night">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-extrabold uppercase tracking-widest text-white/60">Formüller</div>
              <div className="mt-4 flex flex-col gap-3 font-mono text-sm">
                <div className="rounded-2xl bg-black/30 p-3">Etkili hız = kelime/dk × anlama</div>
                <div className="rounded-2xl bg-black/30 p-3">Tepki indeksi = 1 / (ort. doğru tepki ÷ doğruluk)</div>
                <div className="rounded-2xl bg-black/30 p-3">Gelişim % = ort(son 3) ÷ ort(ilk 2) − 1</div>
                <div className="rounded-2xl bg-black/30 p-3">Alan % = Σ ağırlık·güven·gelişim ÷ Σ ağırlık·güven</div>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm font-semibold text-white/70">
              <div className="mb-2 text-sm font-extrabold uppercase tracking-widest text-white/60">Dayandığımız çalışmalar</div>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Rayner, Schotter, Masson, Potter & Treiman (2016). So much to read, so little time. <i>Psychological Science in the Public Interest</i>.</li>
                <li>Eriksen & Eriksen (1974) – Flanker görevi · Stroop (1935) – renk-kelime etkisi.</li>
                <li>Corsi (1972) – blok dokunma · Kirchner (1958) – n-geri görevi.</li>
                <li>Townsend & Ashby (1983) – ters verim skoru (IES).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TEACHER ================= */}
      <section id="egitmen" className="mx-auto max-w-6xl scroll-mt-10 px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Eğitmen paneli</span>
            <h2 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">Her öğrenci tek bakışta.</h2>
            <p className="text-lg font-medium leading-relaxed text-slate">
              Öğrenci hesaplarını oluşturun, hepsi otomatik olarak size bağlansın. Başlangıç ve güncel okuma hızını, anlama oranını, dört bilişsel alandaki gelişimi ve günlük
              programın ne kadarının yapıldığını görün. Tek tıkla yeni etkinlik atayın.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Öğrenci ekleme", "Etkinlik atama", "Haftalık ölçüm", "Oturum geçmişi", "% gelişim raporu"].map((x) => (
                <span key={x} className="rounded-full bg-surface px-3 py-1.5 text-sm font-extrabold ring-1 ring-line">{x}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-line bg-surface p-5 shadow-lift">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-peach text-2xl">🐰</span>
              <div>
                <div className="font-extrabold">Deniz Y. · 7. sınıf</div>
                <div className="text-xs font-bold text-slate">🔥 12 gün · 148 egzersiz</div>
              </div>
              <span className="ml-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">Bugün aktif</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-bg p-3 text-center">
              {[["Başlangıç", "172"], ["Güncel", "236"], ["Değişim", "+%37"]].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[10.5px] font-bold text-muted">{l}</div>
                  <div className="text-xl font-extrabold">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {[["⚡", "+%14"], ["🎯", "+%22"], ["🧠", "+%17"], ["➗", "+%25"]].map(([e, v]) => (
                <div key={e} className="rounded-xl border border-line py-2 text-center">
                  <div className="text-sm">{e}</div>
                  <div className="text-sm font-extrabold">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] font-bold text-muted">Örnek görünüm</p>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="mb-8 text-center text-4xl font-extrabold tracking-tight">Sık sorulanlar</h2>
          <div className="flex flex-col gap-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-[22px] border border-line bg-bg p-5 open:bg-surface open:shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold">
                  {q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-brand-dark dark:text-logo ring-1 ring-line transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 font-medium leading-relaxed text-slate">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-5 py-20 sm:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[40px] bg-gradient-to-br from-deep-2 to-deep-3 px-6 py-16 text-center text-white shadow-lift">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center gap-5">
            <span className="text-6xl" style={{ animation: "float 3s ease-in-out infinite" }}>🐰</span>
            <h2 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">Hazırsan, ilk ölçümle başlayalım.</h2>
            <p className="max-w-xl text-lg font-medium text-white/70">Hesabınız eğitmeniniz tarafından oluşturulur. Giriş yaptıktan sonra program sizi adım adım yönlendirir.</p>
            <Link href={cta.href} className="btn-3d rounded-[20px] bg-carrot px-9 py-4 text-lg font-extrabold text-night shadow-[0_6px_0_#E07B00]">
              {cta.label} →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <Logo height={28} />
          <p className="text-sm font-bold text-muted">© {new Date().getFullYear()} Tavşan · Hızlı Okuma Akademisi · Anlayarak hızlı okuma ve bilişsel gelişim</p>
        </div>
      </footer>
    </div>
  );
}
