import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeed, getUserByUsername, publicUser } from "@/lib/db";
import { fail, json, readJson } from "@/lib/api";

export async function POST(req: Request) {
  await ensureSeed();
  const body = await readJson<{ username?: string; password?: string }>(req);
  if (!body?.username || !body?.password) return fail("Kullanıcı adı ve şifre gerekli.");
  const u = await getUserByUsername(body.username);
  if (!u || !verifyPassword(body.password, u.passwordHash)) return fail("Kullanıcı adı veya şifre hatalı.", 401);
  await createSession({ uid: u.id, role: u.role });
  return json({ user: publicUser(u), redirect: u.role === "teacher" ? "/egitmen" : "/ogrenci" });
}
