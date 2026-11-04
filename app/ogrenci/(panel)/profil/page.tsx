"use client";

import { useState } from "react";
import { useStudent } from "@/components/student/StudentContext";
import { PasswordForm, LogoutButton } from "@/components/ui/Account";

export default function Profile() {
  const { data, reload } = useStudent();
  const [saving, setSaving] = useState(false);
  if (!data) return null;
  async function toggleSound() {
    setSaving(true);
    await fetch("/api/student/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sound: !data!.profile.sound }) });
    await reload();
    setSaving(false);
  }
  return (
    <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
      <section className="flex flex-col gap-3 rounded-[26px] border border-line bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-peach text-3xl">🐰</span>
          <div>
            <div className="text-xl font-extrabold">{data.user.name}</div>
            <div className="text-sm font-bold text-slate">@{data.user.username} {data.user.grade ? `· ${data.user.grade}` : ""}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-bg p-3 text-sm font-bold text-slate">Eğitmenin: <span className="text-ink">{data.teacherName || "–"}</span></div>
        <div className="rounded-2xl bg-bg p-3 text-sm font-bold text-slate">
          Okuma hızın tamamen otomatik ayarlanır. Haftada bir yapılan ölçüm ve egzersizlerdeki anlama başarın hızını belirler.
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={toggleSound}
          className="flex items-center justify-between rounded-2xl border-2 border-line px-4 py-3 font-extrabold"
        >
          <span>🔊 Ses efektleri & metronom</span>
          <span className={`relative h-7 w-12 rounded-full transition ${data.profile.sound ? "bg-brand" : "bg-line"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${data.profile.sound ? "left-6" : "left-1"}`} />
          </span>
        </button>
        <LogoutButton />
      </section>
      <PasswordForm />
    </div>
  );
}
