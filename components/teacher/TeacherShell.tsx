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
      user={{ name, sub: "Eğitmen hesabı", emoji: "👩‍🏫", profileHref: "/egitmen/profil" }}
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
