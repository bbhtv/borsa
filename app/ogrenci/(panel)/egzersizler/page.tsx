"use client";

import Link from "next/link";
import { useStudent } from "@/components/student/StudentContext";
import { ExerciseLibrary } from "@/components/ui/ExerciseLibrary";

export default function Library() {
  const { data } = useStudent();
  if (!data) return null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold text-slate">Bir karta dokun, egzersiz tam ekran açılsın. Serbest egzersizler de gelişim puanına sayılır.</p>
      <ExerciseLibrary
        stats={data.profile.games}
        render={(id, card) => (
          <Link key={id} href={`/ogrenci/calis?oyun=${id}`} className="block">
            {card}
          </Link>
        )}
      />
    </div>
  );
}
