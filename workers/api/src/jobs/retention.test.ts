import { describe, it, expect } from 'vitest'
import { runMonthlyMaintenance } from './retention'
import { monthTableName } from 'src/utils/tables'
import worker from 'src/index'
import type { Env } from 'src/env'

const JUNE_2026 = Date.UTC(2026, 5, 15)

/**
 * Fake D1/R2 over an in-memory `tables` map (name → rows). Records the operation order in `calls`:
 * `create:<t>`, `select-master`, `select:<t>`, `put:<key>`, `drop:<t>`. `CREATE` adds the table;
 * `DROP` removes it.
 */
const makeEnv = (tables: Record<string, Record<string, unknown>[]>, retentionMonths?: string) => {
  const calls: string[] = []
  const puts: Array<{ key: string; body: string }> = []
  const env = {
    RETENTION_MONTHS: retentionMonths,
    DB: {
      prepare: (sql: string) => ({
        run: async () => {
          if (sql.includes('CREATE TABLE')) {
            const name = /IF NOT EXISTS (\w+)/.exec(sql)?.[1] ?? ''
            calls.push(`create:${name}`)
            if (!(name in tables)) tables[name] = []
          } else if (sql.startsWith('DROP TABLE')) {
            const name = sql.replace('DROP TABLE ', '').trim()
            calls.push(`drop:${name}`)
            delete tables[name]
          }
          return {}
        },
        all: async () => {
          if (sql.includes('sqlite_master')) {
            calls.push('select-master')
            return { results: Object.keys(tables).map((name) => ({ name })) }
          }
          const name = sql.replace('SELECT * FROM ', '').trim()
          calls.push(`select:${name}`)
          return { results: tables[name] ?? [] }
        },
      }),
    },
    BACKUPS: {
      put: async (key: string, body: string) => {
        calls.push(`put:${key}`)
        puts.push({ key, body })
      },
    },
  } as unknown as Env
  return { env, calls, puts, tables }
}

describe('runMonthlyMaintenance', () => {
  it('provisions this and next month, then leaves in-window tables alone', async () => {
    const { env, calls, puts } = makeEnv({ contacts_2026_05: [{ id: 'recent' }] })
    await runMonthlyMaintenance(env, JUNE_2026)

    expect(calls.slice(0, 3)).toEqual([
      'create:contacts_2026_06',
      'create:contacts_2026_07',
      'select-master',
    ])
    expect(calls).not.toContain('drop:contacts_2026_05')
    expect(puts).toHaveLength(0)
  })

  it('archives an expired table to R2 (.sql) before dropping it', async () => {
    const { env, calls, puts, tables } = makeEnv({
      contacts_2020_01: [{ id: 'a', email: "o'brien@example.com" }],
      contacts_2026_05: [{ id: 'recent' }],
    })
    await runMonthlyMaintenance(env, JUNE_2026)

    expect(calls).toEqual([
      'create:contacts_2026_06',
      'create:contacts_2026_07',
      'select-master',
      'select:contacts_2020_01',
      'put:contacts_2020_01.sql',
      'drop:contacts_2020_01',
    ])
    expect(puts[0].key).toBe('contacts_2020_01.sql')
    expect(puts[0].body).toContain("'o''brien@example.com'")
    expect(tables.contacts_2026_05).toBeDefined()
    expect(tables.contacts_2020_01).toBeUndefined()
  })

  it('drops an empty expired table without writing an archive', async () => {
    const { env, calls, puts } = makeEnv({ contacts_2019_01: [] })
    await runMonthlyMaintenance(env, JUNE_2026)

    expect(calls).toContain('drop:contacts_2019_01')
    expect(calls).not.toContain('put:contacts_2019_01.sql')
    expect(puts).toHaveLength(0)
  })

  it('honours a RETENTION_MONTHS override', async () => {
    const { env, calls, tables } = makeEnv({ contacts_2025_12: [{ id: 'x' }] }, '12')
    await runMonthlyMaintenance(env, JUNE_2026)

    // 6 months old - expired at the default 6, but kept under a 12-month window.
    expect(calls).not.toContain('drop:contacts_2025_12')
    expect(tables.contacts_2025_12).toBeDefined()
  })
})

describe('scheduled handler', () => {
  it('runs monthly maintenance via the execution context', async () => {
    const { env, calls } = makeEnv({})
    const waited: Promise<unknown>[] = []
    const ctx = {
      waitUntil: (p: Promise<unknown>) => waited.push(p),
    } as unknown as ExecutionContext

    worker.scheduled({} as unknown as ScheduledController, env, ctx)
    await Promise.all(waited)

    expect(calls).toContain(`create:${monthTableName(Date.now())}`)
  })
})
