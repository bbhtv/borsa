import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { ensureSeed, getUser } from "./db";
import type { Role, User } from "./types";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function requireUser(role?: Role): Promise<User | NextResponse> {
  await ensureSeed();
  const s = await getSession();
  if (!s) return fail("Oturum bulunamadı. Lütfen tekrar giriş yap.", 401);
  const u = await getUser(s.uid);
  if (!u) return fail("Kullanıcı bulunamadı.", 401);
  if (role && u.role !== role) return fail("Bu işlem için yetkin yok.", 403);
  return u;
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
