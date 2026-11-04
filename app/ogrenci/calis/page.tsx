"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudent } from "@/components/student/StudentContext";
import { Player, type PlayerItem } from "@/components/player/Player";
import { GAME_MAP } from "@/lib/catalog";
import { ONBOARDING } from "@/lib/plan";
import { Logo } from "@/components/ui/Logo";

function Inner() {
  const { data, reload } = useStudent();
  const sp = useSearchParams();
  const router = useRouter();
  const mod = sp.get("mod");
  const oyun = sp.get("oyun");
  const iParam = sp.get("i");

  // freeze the session items on first load so the player keeps its own state
  const setup = useMemo(() => {
    if (!data) return null;
    if (mod === "olcum") {
      const items: PlayerItem[] = (data.profile.placementDone ? ONBOARDING.slice(1) : ONBOARDING).map((g) => ({ gameId: g, source: g === "okuma-testi" ? "test" : "auto" }));
      return { mode: "onboarding" as const, items, start: 0 };
    }
    if (oyun && GAME_MAP[oyun]) return { mode: "single" as const, items: [{ gameId: oyun, source: "free" as const }], start: 0 };
    if (!data.profile.placementDone) return { mode: "onboarding" as const, items: ONBOARDING.map((g) => ({ gameId: g, source: (g === "okuma-testi" ? "test" : "auto") as PlayerItem["source"] })), start: 0 };
    const plan = data.plan?.items || [];
    const items: PlayerItem[] = plan.map((it, k) => ({ gameId: it.gameId, planIndex: k, source: it.source, done: it.done, score: it.score }));
    if (!items.length) return null;
    const requested = iParam != null ? parseInt(iParam, 10) : NaN;
    const firstOpen = items.findIndex((x) => !x.done);
    const start = !isNaN(requested) && items[requested] ? requested : firstOpen === -1 ? 0 : firstOpen;
    return { mode: "daily" as const, items, start };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!data]);

  if (!data || !setup)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-deep">
        <Logo white height={40} />
      </div>
    );

  return (
    <Player
      items={setup.items}
      startIndex={setup.start}
      mode={setup.mode}
      profile={data.profile}
      onExit={async () => {
        await reload();
        router.push(setup.mode === "single" ? "/ogrenci/egzersizler" : "/ogrenci");
      }}
    />
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
