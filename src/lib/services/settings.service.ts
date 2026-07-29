import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema/settings';
import { encrypt, decrypt } from '@/lib/crypto/encryption';

const ENCRYPTED_KEYS = new Set(['ga_service_account_json']);

export async function getSettings(keys: string[]) {
  const rows = await db.query.settings.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const result: Record<string, string> = {};
  for (const key of keys) {
    const raw = map.get(key) ?? '';
    result[key] = raw && ENCRYPTED_KEYS.has(key) ? await decrypt(raw) : raw;
  }
  return result;
}

export async function updateSettings(values: Record<string, string>) {
  // Ganti db.transaction dengan pemrosesan array Promise secara paralel
  const promises = Object.entries(values).map(async ([key, value]) => {
    const storedValue = value && ENCRYPTED_KEYS.has(key) ? await encrypt(value) : value;

    return db
      .insert(settings)
      .values({ key, value: storedValue, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: storedValue, updatedAt: new Date() },
      });
  });

  // Tunggu hingga semua request HTTP ke Neon selesai dijalankan
  await Promise.all(promises);
}
