"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./Theme";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export interface ShellUser {
  name: string;
  sub?: string;
  emoji: string;
  profileHref: string;
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}

export function AppShell({
  nav,
  title,
  subtitle,
  user,
  badges,
  children,
}: {
  nav: NavItem[];
  title: string;
  subtitle?: string;
  user: ShellUser;
  badges?: React.ReactNode;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const active = (n: NavItem) => (n.exact ? path === n.href : path === n.href || path.startsWith(n.href + "/"));
  return (
    <div className="flex min-h-dvh bg-bg">
      {/* desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href={nav[0].href} className="self-start px-2">
          <Logo height={38} />
        </Link>
        <nav className="flex flex-col gap-1.5">
          {nav.map((n) => {
            const a = active(n);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-2xl border-2 px-3.5 py-2.5 text-[14.5px] font-extrabold transition hover:translate-x-0.5 ${
                  a ? "border-brand bg-brand-soft text-ink" : "border-transparent text-slate hover:bg-bg"
                }`}
              >
                <span className={a ? "text-brand-dark dark:text-logo" : "text-muted"}>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* user chip – bottom left */}
        <div className="mt-auto flex flex-col gap-2 rounded-[20px] border border-line bg-bg p-2.5">
          <Link href={user.profileHref} className="flex items-center gap-2.5 rounded-2xl p-1 hover:bg-surface">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach text-2xl">{user.emoji}</span>
            <span className="min-w-0">
              <span className="block text-[15px] font-extrabold leading-tight [overflow-wrap:anywhere]">{user.name}</span>
              {user.sub && <span className="block truncate text-[11.5px] font-bold text-muted">{user.sub}</span>}
            </span>
          </Link>
          <div className="grid grid-cols-[1fr_auto] gap-1.5">
            <ThemeToggle withLabel className="bg-surface text-slate ring-1 ring-line hover:text-ink" />
            <button
              type="button"
              onClick={logout}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-surface px-3 text-[13px] font-extrabold text-slate ring-1 ring-line transition hover:bg-rose-500 hover:text-white"
              aria-label="Çıkış yap"
              title="Çıkış yap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              Çıkış
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* header */}
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:border-none lg:px-8 lg:py-5">
          <Link href={nav[0].href} className="shrink-0 lg:hidden">
            <Logo height={22} sub={false} />
          </Link>
          <div className="min-w-0">
            {subtitle && <p className="truncate text-[11.5px] font-extrabold text-muted lg:text-[13px]">{subtitle}</p>}
            <h1 className="truncate text-base font-extrabold leading-tight lg:text-[28px]">{title}</h1>
          </div>
          <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 lg:gap-2">
            {badges}
            <ThemeToggle className="bg-surface text-slate shadow-card ring-1 ring-line lg:hidden" />
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-10">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav
        className="no-print fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-surface px-1.5 pt-2 lg:hidden"
        style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0,1fr))`, paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
      >
        {nav.map((n) => {
          const a = active(n);
          return (
            <Link key={n.href} href={n.href} className="flex flex-col items-center gap-1 py-0.5">
              <span className={`flex items-center justify-center rounded-full border-2 px-3.5 py-1 transition ${a ? "border-brand bg-brand-soft text-brand-dark dark:text-logo" : "border-transparent text-muted"}`}>
                {n.icon}
              </span>
              <span className={`text-[11px] ${a ? "font-extrabold text-ink" : "font-bold text-slate"}`}>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Badge({ children, tone = "white" }: { children: React.ReactNode; tone?: "white" | "peach" | "cyan" | "deep" }) {
  const cls = { white: "bg-surface", peach: "bg-peach", cyan: "bg-brand-soft", deep: "bg-deep text-white" }[tone];
  return <span className={`whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-extrabold shadow-card lg:px-3 lg:py-2 lg:text-[13.5px] ${cls}`}>{children}</span>;
}

export const Icon = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  zap: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>,
  user: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  book: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>,
};
