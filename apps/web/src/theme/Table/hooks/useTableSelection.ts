import { useMemo, useState } from 'react'

/** Header select-all state — spreads directly onto `Checkbox`. */
export interface TableSelectionAllProps {
  checked: boolean
  indeterminate: boolean
  /** All selected → clears; otherwise selects every key. */
  onChange: () => void
}

/** One row's selection state — spreads directly onto `Checkbox`. */
export interface TableSelectionRowProps {
  checked: boolean
  /** Toggles this key in and out of the selection. */
  onChange: () => void
}

export interface TableSelection<K extends string | number> {
  /** Currently selected keys. */
  selected: K[]
  isSelected: (key: K) => boolean
  /** Spread onto the header select-all `Checkbox`. */
  all: TableSelectionAllProps
  /** Spread onto a row's `Checkbox`. */
  row: (key: K) => TableSelectionRowProps
  clear: () => void
}

/**
 * Key-based row selection that survives paging and re-sorting — selection is
 * stored as row identities, and the select-all/indeterminate state is computed
 * against the full `keys` list rather than the visible slice.
 *
 * ```tsx
 * const selection = useTableSelection(services.map((s) => s.service))
 * <Checkbox {...selection.all} aria-label="Select all" />
 * <Checkbox {...selection.row(row.service)} aria-label={`Select ${row.service}`} />
 * <TableRow isSelected={selection.isSelected(row.service)}>…</TableRow>
 * ```
 */
export function useTableSelection<K extends string | number>(
  keys: readonly K[],
  onChange?: (selected: K[]) => void
): TableSelection<K> {
  const [selected, setSelected] = useState<K[]>([])

  // Join is a stable identity for inline key arrays across renders.
  const keysKey = keys.join('')

  return useMemo(() => {
    const selectedSet = new Set(selected)
    // Computed against `keys`, so selected keys no longer present don't
    // distort the header state.
    const isAllSelected = keys.length > 0 && keys.every((key) => selectedSet.has(key))
    const isSomeSelected = !isAllSelected && keys.some((key) => selectedSet.has(key))

    const update = (next: K[]) => {
      setSelected(next)
      onChange?.(next)
    }

    return {
      selected,
      isSelected: (key: K) => selectedSet.has(key),
      all: {
        checked: isAllSelected,
        indeterminate: isSomeSelected,
        onChange: () => update(isAllSelected ? [] : [...keys]),
      },
      row: (key: K) => ({
        checked: selectedSet.has(key),
        onChange: () =>
          update(
            selectedSet.has(key) ? selected.filter((item) => item !== key) : [...selected, key]
          ),
      }),
      clear: () => update([]),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keysKey stands in for the keys array identity
  }, [selected, keysKey, onChange])
}
