"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Assignment, DailyPlan, GameResult, StudentSummary } from "@/lib/types";

export interface StudentState extends StudentSummary {
  plan: DailyPlan | null;
  teacherName: string | null;
  assignments: Assignment[];
  results: GameResult[];
  persistent: boolean;
}

interface Ctx {
  data: StudentState | null;
  error: string | null;
  reload: () => Promise<void>;
}

const C = createContext<Ctx>({ data: null, error: null, reload: async () => {} });

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StudentState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/student/state", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/giris";
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Veriler alınamadı");
      setData(json);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return <C.Provider value={{ data, error, reload }}>{children}</C.Provider>;
}

export function useStudent() {
  return useContext(C);
}
