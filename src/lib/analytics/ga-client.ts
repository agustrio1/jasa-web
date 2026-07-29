import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema/settings';
import { decrypt } from '@/lib/crypto/encryption'; // 1. Impor fungsi decrypt

const ENCRYPTED_KEYS = new Set(['ga_service_account_json']);

async function getSetting(key: string) {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  if (!row?.value) return '';

  // 2. Dekripsi nilai jika key terdaftar sebagai data terenkripsi
  return ENCRYPTED_KEYS.has(key) ? await decrypt(row.value) : row.value;
}

export async function getAnalyticsClient() {
  const credentialsJson = await getSetting('ga_service_account_json');
  const propertyId = await getSetting('ga_property_id');

  if (!credentialsJson || !propertyId) return null;

  try {
    // 3. Sekarang credentialsJson sudah berupa string JSON asli yang valid
    const credentials = JSON.parse(credentialsJson);
    const client = new BetaAnalyticsDataClient({ credentials });

    return { client, propertyId };
  } catch (error) {
    console.error('Failed to parse GA Kredensial JSON:', error);
    return null;
  }
}
