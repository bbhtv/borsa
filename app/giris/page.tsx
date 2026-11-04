import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Giriş Yap – Tavşan · Hızlı Okuma Akademisi" };

export default async function LoginPage() {
  const s = await getSession();
  if (s) redirect(s.role === "teacher" ? "/egitmen" : "/ogrenci");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-deep-3 p-12 text-white lg:flex lg:flex-col">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand/30 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-grape/30 blur-[120px]" />
        <Link href="/" className="relative self-start">
          <Logo white height={40} />
        </Link>
        <div className="relative my-auto flex max-w-lg flex-col gap-6">
          <span className="text-7xl" style={{ animation: "float 3s ease-in-out infinite" }}>🐰</span>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight">
            Bugünün antrenmanı
            <br />
            <span className="text-logo">seni bekliyor.</span>
          </h1>
          <p className="text-lg font-medium text-white/70">Göz ısınması, rehberli okuma ve beyin oyunları – hepsi senin ölçülen hızına göre ayarlandı.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["⚡", "Tepki"],
              ["🎯", "Dikkat"],
              ["🧠", "Hafıza"],
              ["➗", "Matematik"],
            ].map(([e, t]) => (
              <div key={t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 font-extrabold backdrop-blur">
                <span className="text-2xl">{e}</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center gap-8 bg-bg px-5 py-12">
        <Link href="/" className="lg:hidden">
          <Logo height={40} />
        </Link>
        <div className="w-full max-w-md rounded-[32px] border border-line bg-surface p-7 shadow-lift sm:p-9" style={{ animation: "fadeUp .5s both" }}>
          <h2 className="text-3xl font-extrabold">Giriş Yap</h2>
          <p className="mt-1 font-semibold text-slate">Öğrenci ve eğitmen hesapları aynı ekrandan giriş yapar.</p>
          <LoginForm />
        </div>
        <Link href="/" className="text-sm font-extrabold text-slate hover:text-ink">← Ana sayfaya dön</Link>
      </main>
    </div>
  );
}
