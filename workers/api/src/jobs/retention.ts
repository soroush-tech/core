import type { Env } from 'src/env'
import {
  monthTableName,
  createTableStatement,
  isExpired,
  rowsToSqlDump,
  type ContactRow,
} from 'src/utils/tables'

/** Months of submissions kept live before a month table is archived and dropped. */
const DEFAULT_RETENTION_MONTHS = 6

/** Create this month's and next month's tables if absent (idempotent - present ones are skipped). */
export const provisionMonthTables = async (env: Env, now: number): Promise<void> => {
  const d = new Date(now)
  const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
  for (const table of [monthTableName(now), monthTableName(nextMonth)]) {
    await env.DB.prepare(createTableStatement(table)).run()
  }
}

/**
 * Archive then drop every `contacts_YYYY_MM` table older than the retention window. Each expired
 * table is dumped to R2 as `contacts_YYYY_MM.sql` (skipped when empty) *before* it is dropped, so
 * no un-backed-up data is ever purged. Returns the number of tables dropped.
 */
export const archiveExpiredTables = async (
  env: Env,
  now: number,
  retentionMonths: number
): Promise<number> => {
  const { results } = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'contacts_%'"
  ).all<{ name: string }>()

  let dropped = 0
  for (const { name } of results) {
    if (!isExpired(name, now, retentionMonths)) continue
    const { results: rows } = await env.DB.prepare(`SELECT * FROM ${name}`).all<ContactRow>()
    if (rows.length) {
      await env.BACKUPS.put(`${name}.sql`, rowsToSqlDump(name, rows))
    }
    await env.DB.prepare(`DROP TABLE ${name}`).run()
    dropped++
  }
  return dropped
}

/**
 * Monthly cron entrypoint: provision the upcoming month tables, then archive+drop expired ones.
 * `now` is injectable for tests.
 */
export const runMonthlyMaintenance = async (env: Env, now = Date.now()): Promise<void> => {
  await provisionMonthTables(env, now)
  await archiveExpiredTables(env, now, Number(env.RETENTION_MONTHS) || DEFAULT_RETENTION_MONTHS)
}
