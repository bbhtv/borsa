"use client";

import { useState } from "react";

export function LoginForm() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
          const d = await res.json();
          if (!res.ok) throw new Error(d.error || "Giriş yapılamadı");
          window.location.href = d.redirect;
        } catch (e) {
          setErr((e as Error).message);
          setBusy(false);
        }
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-extrabold text-slate">Kullanıcı adı</span>
        <input
          autoComplete="username"
          autoCapitalize="none"
          required
          value={username}
          onChange={(e) => setU(e.target.value)}
          className="rounded-2xl border-2 border-line bg-bg px-4 py-3.5 text-lg font-bold outline-none transition focus:border-brand focus:bg-surface"
          placeholder="ör. ogrenci"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-extrabold text-slate">Şifre</span>
        <span className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setP(e.target.value)}
            className="w-full rounded-2xl border-2 border-line bg-bg px-4 py-3.5 pr-20 text-lg font-bold outline-none transition focus:border-brand focus:bg-surface"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-extrabold text-slate hover:bg-bg">
            {show ? "Gizle" : "Göster"}
          </button>
        </span>
      </label>
      {err && <p className="rounded-xl bg-rose-50 dark:bg-rose-500/15 px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-500/40">{err}</p>}
      <button disabled={busy} className="btn-3d mt-2 rounded-[20px] bg-brand py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#07879B] disabled:opacity-60">
        {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
      <p className="text-center text-xs font-semibold text-muted">Hesabın yok mu? Öğrenci hesapları eğitmen tarafından oluşturulur.</p>
    </form>
  );
}
