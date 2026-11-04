"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Badge, Icon } from "@/components/ui/AppShell";
import { useStudent } from "@/components/student/StudentContext";
import { Logo } from "@/components/ui/Logo";

const TITLES: Record<string, string> = {
  "/ogrenci": "Antrenmanım",
  "/ogrenci/egzersizler": "Egzersiz Kütüphanesi",
  "/ogrenci/gelisim": "Gelişim & Analiz",
  "/ogrenci/okuma-odasi": "Okuma Odası",
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
  return (
    <AppShell
      title={TITLES[path] || "Tavşan"}
      subtitle={`Hoş geldin, ${data.user.name.split(" ")[0]} 👋`}
      user={{ name: data.user.name, sub: [data.user.grade, data.teacherName ? `Eğitmen: ${data.teacherName}` : null].filter(Boolean).join(" · ") || "Öğrenci", emoji: "🐰", profileHref: "/ogrenci/profil" }}
      badges={
        <>
          <Badge tone="peach">🔥 {p.streak} gün</Badge>
          <Badge tone="cyan">⚡ {data.reading.currentWpm ?? "–"} k/dk</Badge>
        </>
      }
      nav={[
        { href: "/ogrenci", label: "Ana Sayfa", icon: Icon.home, exact: true },
        { href: "/ogrenci/egzersizler", label: "Egzersizler", icon: Icon.zap },
        { href: "/ogrenci/okuma-odasi", label: "Okuma Odası", icon: Icon.book },
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
