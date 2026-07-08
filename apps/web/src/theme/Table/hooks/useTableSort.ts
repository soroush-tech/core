import { useMemo, useState } from 'react'
import { type TableSortLabelDirection } from 'src/theme/Table/TableSortLabel'

/** One column's sort state — spreads directly onto `TableSortLabel`. */
export interface TableSortEntry {
  isActive: boolean
  direction: TableSortLabelDirection
  /** Activates the column and flips its stored direction. */
  onClick: () => void
}

export type TableSortMap<K extends string = string> = Record<K, TableSortEntry>

/**
 * Column-keyed sort state for sortable tables. Each column remembers its own
 * direction (initially `'asc'`); clicking a column activates it AND flips its
 * stored direction — so the first click on a column sorts `'desc'`.
 * `keys` is read once on mount.
 *
 * ```tsx
 * const sort = useTableSort(['name', 'latency'])
 * <TableSortLabel {...sort.name}>Service</TableSortLabel>
 * <TableControl data={rows} sort={sort}>{(row) => …}</TableControl>
 * ```
 */
export function useTableSort<K extends string>(
  keys: readonly K[],
  onChange?: (key: K, direction: TableSortLabelDirection) => void
): TableSortMap<K> {
  const [activeKey, setActiveKey] = useState<K | null>(null)
  const [directions, setDirections] = useState<Record<K, TableSortLabelDirection>>(
    () => Object.fromEntries(keys.map((key) => [key, 'asc'])) as Record<K, TableSortLabelDirection>
  )

  return useMemo(() => {
    const entries = (Object.keys(directions) as K[]).map((key): [K, TableSortEntry] => [
      key,
      {
        isActive: activeKey === key,
        direction: directions[key],
        onClick: () => {
          const direction: TableSortLabelDirection = directions[key] === 'asc' ? 'desc' : 'asc'
          setActiveKey(key)
          setDirections({ ...directions, [key]: direction })
          onChange?.(key, direction)
        },
      },
    ])
    return Object.fromEntries(entries) as TableSortMap<K>
  }, [activeKey, directions, onChange])
}
