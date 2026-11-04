import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny key-value abstraction with three interchangeable drivers:
 *  1. Upstash Redis REST  (KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + _TOKEN)
 *  2. Redis over TCP      (REDIS_URL)
 *  3. JSON file           (local development; /tmp on serverless – NOT persistent)
 */
export interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  /** prepend to a list and keep at most `max` items */
  lpush(key: string, value: unknown, max: number): Promise<void>;
  lrange<T>(key: string, start: number, stop: number): Promise<T[]>;
  driver: "upstash" | "redis" | "file";
}

const PREFIX = "tvs:";

/* ---------------- Upstash REST ---------------- */
function upstash(url: string, token: string): KV {
  async function cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KV ${args[0]} failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { result: T; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result;
  }
  async function pipeline(cmds: (string | number)[][]) {
    const res = await fetch(url.replace(/\/$/, "") + "/pipeline", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KV pipeline failed: ${res.status}`);
  }
  return {
    driver: "upstash",
    async get<T>(key: string) {
      const v = await cmd<string | null>("GET", PREFIX + key);
      return v == null ? null : (JSON.parse(v) as T);
    },
    async set(key, value) {
      await cmd("SET", PREFIX + key, JSON.stringify(value));
    },
    async del(key) {
      await cmd("DEL", PREFIX + key);
    },
    async lpush(key, value, max) {
      await pipeline([
        ["LPUSH", PREFIX + key, JSON.stringify(value)],
        ["LTRIM", PREFIX + key, 0, max - 1],
      ]);
    },
    async lrange<T>(key: string, start: number, stop: number) {
      const arr = await cmd<string[]>("LRANGE", PREFIX + key, start, stop);
      return (arr || []).map((s) => JSON.parse(s) as T);
    },
  };
}

/* ---------------- Redis TCP ---------------- */
function redisTcp(url: string): KV {
  type Client = {
    get(k: string): Promise<string | null>;
    set(k: string, v: string): Promise<unknown>;
    del(k: string): Promise<unknown>;
    lPush(k: string, v: string): Promise<unknown>;
    lTrim(k: string, a: number, b: number): Promise<unknown>;
    lRange(k: string, a: number, b: number): Promise<string[]>;
    connect(): Promise<unknown>;
    isOpen: boolean;
  };
  const g = globalThis as unknown as { __tvsRedis?: Promise<Client> };
  async function client(): Promise<Client> {
    if (!g.__tvsRedis) {
      g.__tvsRedis = (async () => {
        const { createClient } = await import("redis");
        const c = createClient({ url }) as unknown as Client;
        await c.connect();
        return c;
      })();
    }
    return g.__tvsRedis;
  }
  return {
    driver: "redis",
    async get<T>(key: string) {
      const v = await (await client()).get(PREFIX + key);
      return v == null ? null : (JSON.parse(v) as T);
    },
    async set(key, value) {
      await (await client()).set(PREFIX + key, JSON.stringify(value));
    },
    async del(key) {
      await (await client()).del(PREFIX + key);
    },
    async lpush(key, value, max) {
      const c = await client();
      await c.lPush(PREFIX + key, JSON.stringify(value));
      await c.lTrim(PREFIX + key, 0, max - 1);
    },
    async lrange<T>(key: string, start: number, stop: number) {
      const arr = await (await client()).lRange(PREFIX + key, start, stop);
      return arr.map((s) => JSON.parse(s) as T);
    },
  };
}

/* ---------------- JSON file ---------------- */
function fileKv(): KV {
  const dir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
  const file = path.join(dir, "tavsan-db.json");
  const g = globalThis as unknown as { __tvsFile?: { data: Record<string, unknown>; loaded: boolean } };
  if (!g.__tvsFile) g.__tvsFile = { data: {}, loaded: false };
  const store = g.__tvsFile;
  let writing: Promise<void> = Promise.resolve();

  async function load() {
    if (store.loaded) return;
    try {
      store.data = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      store.data = {};
    }
    store.loaded = true;
  }
  function persist() {
    writing = writing.then(async () => {
      await fs.mkdir(dir, { recursive: true });
      const tmp = file + ".tmp";
      await fs.writeFile(tmp, JSON.stringify(store.data));
      await fs.rename(tmp, file);
    }).catch(() => {});
    return writing;
  }
  const clone = <T>(v: unknown) => (v == null ? null : (JSON.parse(JSON.stringify(v)) as T));
  return {
    driver: "file",
    async get<T>(key: string) {
      await load();
      return clone<T>(store.data[key]);
    },
    async set(key, value) {
      await load();
      store.data[key] = clone(value);
      await persist();
    },
    async del(key) {
      await load();
      delete store.data[key];
      await persist();
    },
    async lpush(key, value, max) {
      await load();
      const arr = (store.data[key] as unknown[]) || [];
      arr.unshift(clone(value));
      store.data[key] = arr.slice(0, max);
      await persist();
    },
    async lrange<T>(key: string, start: number, stop: number) {
      await load();
      const arr = (store.data[key] as T[]) || [];
      return clone<T[]>(arr.slice(start, stop < 0 ? undefined : stop + 1)) || [];
    },
  };
}

let instance: KV | null = null;
export function kv(): KV {
  if (instance) return instance;
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) instance = upstash(restUrl, restToken);
  else if (process.env.REDIS_URL) instance = redisTcp(process.env.REDIS_URL);
  else instance = fileKv();
  return instance;
}

export function storageIsPersistent(): boolean {
  const d = kv().driver;
  return d !== "file" || !process.env.VERCEL;
}
