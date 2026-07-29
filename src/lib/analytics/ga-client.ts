import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema/settings';

async function getSetting(key: string) {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value;
}

export async function getAnalyticsClient() {
  const credentialsJson = await getSetting('ga_service_account_json');
  const propertyId = await getSetting('ga_property_id');

  if (!credentialsJson || !propertyId) return null;

  const credentials = JSON.parse(credentialsJson);
  const client = new BetaAnalyticsDataClient({ credentials });

  return { client, propertyId };
}