import { verifyPassword } from "@/lib/auth";
import { setPassword } from "@/lib/db";
import { fail, json, readJson, requireUser } from "@/lib/api";

export async function POST(req: Request) {
  const u = await requireUser();
  if (u instanceof Response) return u;
  const body = await readJson<{ current?: string; next?: string }>(req);
  if (!body?.current || !body?.next) return fail("Mevcut ve yeni şifre gerekli.");
  if (!verifyPassword(body.current, u.passwordHash)) return fail("Mevcut şifre hatalı.");
  try {
    await setPassword(u.id, body.next);
  } catch (e) {
    return fail((e as Error).message);
  }
  return json({ ok: true });
}
