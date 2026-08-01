export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => `"${c.label}"`).join(',');

  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const value = row[c.key];
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  return `${header}\n${body}`;
}