"use client";

import { useState } from "react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
      className="rounded-2xl bg-ink px-4 py-3 font-extrabold text-white hover:bg-deep"
    >
      Çıkış yap
    </button>
  );
}

export function PasswordForm() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        const res = await fetch("/api/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: cur, next }) });
        const d = await res.json();
        setMsg(res.ok ? { ok: true, t: "Şifren güncellendi." } : { ok: false, t: d.error });
        if (res.ok) {
          setCur("");
          setNext("");
        }
      }}
      className="flex flex-col gap-3 rounded-[26px] border border-line bg-white p-5 shadow-card"
    >
      <h3 className="text-lg font-extrabold">Şifre değiştir</h3>
      <input type="password" required value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Mevcut şifre" className="rounded-2xl border-2 border-line px-4 py-3 font-bold outline-none focus:border-brand" />
      <input type="password" required minLength={6} value={next} onChange={(e) => setNext(e.target.value)} placeholder="Yeni şifre (en az 6 karakter)" className="rounded-2xl border-2 border-line px-4 py-3 font-bold outline-none focus:border-brand" />
      {msg && <p className={`text-sm font-bold ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.t}</p>}
      <button className="rounded-2xl bg-brand px-4 py-3 font-extrabold text-white">Kaydet</button>
    </form>
  );
}
