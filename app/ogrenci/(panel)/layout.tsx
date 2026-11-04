"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Badge, Icon } from "@/components/ui/AppShell";
import { useStudent } from "@/components/student/StudentContext";
import { levelName, xpForLevel } from "@/lib/engine";
import { Logo } from "@/components/ui/Logo";

const TITLES: Record<string, string> = {
  "/ogrenci": "Antrenmanım",
  "/ogrenci/egzersizler": "Egzersiz Kütüphanesi",
  "/ogrenci/gelisim": "Gelişim & Analiz",
  "/ogrenci/profil": "Profil & Ayarlar",
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { data, error, reload } = useStudent();
  const path = usePathname();

  if (error && !data)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-bold text-slate">{error}</p>
        <button onClick={reload} className="rounded-xl bg-brand px-4 py-2 font-extrabold text-white">Tekrar dene</button>
      </div>
    );
  if (!data)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3" style={{ animation: "float 2s ease-in-out infinite" }}>
          <Logo height={40} />
          <span className="text-sm font-bold text-muted">Yükleniyor…</span>
        </div>
      </div>
    );

  if (!data.profile.placementDone) return <Welcome name={data.user.name} teacher={data.teacherName} />;

  const p = data.profile;
  const need = xpForLevel(p.level);
  const card = (
    <div className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-cream p-3.5 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-peach text-2xl">🐰</span>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-extrabold">{data.user.name}</div>
          <div className="text-xs font-bold text-slate">Seviye {p.level} · {levelName(p.level)}</div>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-line bg-white">
        <div className="h-full bg-brand transition-all" style={{ width: `${(p.xp / need) * 100}%` }} />
      </div>
      <span className="text-[11px] font-extrabold text-slate">{p.xp} / {need} XP · sonraki seviyeye</span>
    </div>
  );
  const aside = (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-[24px] bg-deep p-4 text-white shadow-card">
      <span className="absolute -right-2 -top-3 text-6xl">🥕</span>
      <span className="max-w-[170px] text-lg font-extrabold leading-tight">
        Bugün <span className="text-carrot">{data.today.done}/{data.today.total}</span> egzersiz
      </span>
      {data.teacherName && <span className="text-xs font-semibold text-white/70">Eğitmenin: {data.teacherName}</span>}
      <Link href="/ogrenci/calis?mod=gunluk" className="btn-3d mt-1 rounded-2xl bg-carrot py-2.5 text-center text-sm font-extrabold text-ink shadow-[0_4px_0_#E07B00]">
        Antrenmana devam ⚡
      </Link>
    </div>
  );
  return (
    <AppShell
      title={TITLES[path] || "Tavşan"}
      subtitle={`Hoş geldin, ${data.user.name.split(" ")[0]} 👋`}
      card={card}
      aside={aside}
      badges={
        <>
          <Badge tone="peach">🔥 {p.streak} gün</Badge>
          <Badge tone="cyan">⚡ {data.reading.currentWpm ?? "–"} k/dk</Badge>
        </>
      }
      nav={[
        { href: "/ogrenci", label: "Ana Sayfa", icon: Icon.home, exact: true },
        { href: "/ogrenci/egzersizler", label: "Egzersizler", icon: Icon.zap },
        { href: "/ogrenci/gelisim", label: "Gelişim", icon: Icon.chart },
        { href: "/ogrenci/profil", label: "Profil", icon: Icon.user },
      ]}
    >
      {!data.persistent && (
        <div className="mb-4 rounded-2xl bg-peach px-4 py-3 text-sm font-bold text-ink ring-1 ring-carrot/40">
          ⚠️ Kalıcı veritabanı bağlı değil – veriler sunucu yeniden başlatıldığında silinebilir. (Vercel’de Upstash Redis ekleyin.)
        </div>
      )}
      {children}
    </AppShell>
  );
}

function Welcome({ name, teacher }: { name: string; teacher: string | null }) {
  return (
    <div className="stage-dark relative min-h-dvh overflow-hidden text-white">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <Logo white height={44} />
        <div className="text-7xl" style={{ animation: "float 3s ease-in-out infinite" }}>🐰</div>
        <h1 className="text-balance text-4xl font-extrabold sm:text-5xl">Merhaba {name.split(" ")[0]}! Önce seni tanıyalım.</h1>
        <p className="max-w-xl text-lg font-medium text-white/75">
          Programın tamamen sana özel çalışır: kelime hızını sen ayarlamazsın, biz ölçeriz. Önce kısa bir <b className="text-logo">okuma testi</b> yapacaksın,
          ardından tepki, dikkat, hafıza ve matematik için 4 mini ölçüm gelecek. Tüm egzersizler bu sonuçlara göre otomatik ayarlanır.
        </p>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["📄", "Okuma testi", "~3 dk"],
            ["🥕", "Tepki", "45 sn"],
            ["🏹", "Dikkat", "60 sn"],
            ["🔟", "Hafıza", "~1 dk"],
            ["🧮", "Matematik", "60 sn"],
          ].map(([e, t, d]) => (
            <div key={t} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <div className="text-3xl">{e}</div>
              <div className="text-sm font-extrabold">{t}</div>
              <div className="text-xs font-bold text-white/60">{d}</div>
            </div>
          ))}
        </div>
        <Link href="/ogrenci/calis?mod=olcum" className="btn-3d mt-2 rounded-[22px] bg-brand px-10 py-5 text-xl font-extrabold text-white shadow-[0_7px_0_#07879B]" style={{ animation: "pulseRing 1.8s infinite" }}>
          Ölçüme Başla →
        </Link>
        {teacher && <p className="text-sm font-semibold text-white/60">Eğitmenin {teacher} sonuçlarını panelinden takip edecek.</p>}
      </div>
    </div>
  );
}
