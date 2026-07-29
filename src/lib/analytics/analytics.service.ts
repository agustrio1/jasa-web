import { getAnalyticsClient } from './ga-client';

export async function getVisitorsSummary(days: number = 7) {
  const analytics = await getAnalyticsClient();
  if (!analytics) return null;

  const { client, propertyId } = analytics;

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });

  return response.rows?.map((row) => ({
    date: row.dimensionValues?.[0].value,
    activeUsers: Number(row.metricValues?.[0].value ?? 0),
    pageViews: Number(row.metricValues?.[1].value ?? 0),
  })) ?? [];
}

export async function getTopPages(days: number = 7, limit: number = 10) {
  const analytics = await getAnalyticsClient();
  if (!analytics) return null;

  const { client, propertyId } = analytics;

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit,
  });

  return response.rows?.map((row) => ({
    path: row.dimensionValues?.[0].value,
    views: Number(row.metricValues?.[0].value ?? 0),
  })) ?? [];
}