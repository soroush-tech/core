import schemaTemplate from 'src/db/contacts.schema.sql'

/**
 * Contact submissions are partitioned into one table per month, `contacts_YYYY_MM`. This module
 * owns that table's name and the helpers used by both the write path (create-on-first-write) and
 * the monthly maintenance cron (provision + archive/drop). The table's schema lives in the
 * versioned `contacts.schema.sql` (a `__TABLE__` template), not here.
 */

/** A row read back from a `contacts_YYYY_MM` table (column → value). */
export type ContactRow = Record<string, string | number | null | undefined>

/** `contacts_2026_06` for the month containing `when` (UTC). */
export const monthTableName = (when: number | Date): string => {
  const d = typeof when === 'number' ? new Date(when) : when
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `contacts_${year}_${month}`
}

/** `CREATE TABLE IF NOT EXISTS` for a month table, from the versioned schema template. */
export const createTableStatement = (table: string): string =>
  schemaTemplate.replaceAll('__TABLE__', table).trim()

/** Parse a `contacts_YYYY_MM` table name; returns null for anything that doesn't match. */
export const parseMonthTable = (name: string): { year: number; month: number } | null => {
  const match = /^contacts_(\d{4})_(\d{2})$/.exec(name)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]) }
}

/**
 * True when `name`'s month is at least `retentionMonths` behind the month of `now` - i.e. due to
 * be archived and dropped. Non-month-table names and future months are never expired.
 */
export const isExpired = (name: string, now: number | Date, retentionMonths: number): boolean => {
  const parsed = parseMonthTable(name)
  if (!parsed) return false
  const d = typeof now === 'number' ? new Date(now) : now
  const nowIndex = d.getUTCFullYear() * 12 + d.getUTCMonth()
  const tableIndex = parsed.year * 12 + (parsed.month - 1)
  return nowIndex - tableIndex >= retentionMonths
}

/** SQL literal for a value in a dump: NULL, raw number, or single-quote-escaped string. */
const sqlLiteral = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(value)
  return `'${String(value).replaceAll("'", "''")}'`
}

/**
 * Render a month table's rows as a restorable `.sql` dump: the `CREATE TABLE` followed by one
 * `INSERT` per row. Re-importable with `wrangler d1 execute DB --file`.
 */
export const rowsToSqlDump = (table: string, rows: ContactRow[]): string => {
  const lines = [`${createTableStatement(table)};`]
  for (const row of rows) {
    const cols = Object.keys(row)
    const values = cols.map((col) => sqlLiteral(row[col]))
    lines.push(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${values.join(', ')});`)
  }
  return `${lines.join('\n')}\n`
}
