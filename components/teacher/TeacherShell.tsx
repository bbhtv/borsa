"use client";

import { usePathname } from "next/navigation";
import { AppShell, Badge, Icon } from "@/components/ui/AppShell";

export function TeacherShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const title = path.startsWith("/egitmen/ogrenci/") ? "Öğrenci Detayı" : path === "/egitmen/egzersizler" ? "Egzersiz Kütüphanesi" : path === "/egitmen/profil" ? "Profil" : "Öğrencilerim";
  return (
    <AppShell
      title={title}
      subtitle={`Eğitmen paneli · ${name}`}
      badges={<Badge tone="deep">👩‍🏫 Eğitmen</Badge>}
      card={
        <div className="flex items-center gap-2.5 rounded-[22px] border border-line bg-cream p-3.5 shadow-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-peach text-2xl">👩‍🏫</span>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-extrabold">{name}</div>
            <div className="text-xs font-bold text-slate">Eğitmen hesabı</div>
          </div>
        </div>
      }
      aside={
        <div className="rounded-[24px] bg-deep p-4 text-sm font-semibold text-white/80 shadow-card">
          <div className="mb-1 text-base font-extrabold text-white">🧪 Bilimsel takip</div>
          Okuma hızı + anlama (etkili okuma hızı) ve 4 bilişsel alanın başlangıca göre % değişimi otomatik hesaplanır.
        </div>
      }
      nav={[
        { href: "/egitmen", label: "Öğrencilerim", icon: Icon.users, exact: true },
        { href: "/egitmen/egzersizler", label: "Egzersizler", icon: Icon.zap },
        { href: "/egitmen/profil", label: "Profil", icon: Icon.user },
      ]}
    >
      {children}
    </AppShell>
  );
}
