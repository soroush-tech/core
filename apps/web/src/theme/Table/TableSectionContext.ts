import { createContext } from 'react'

/** The table section a cell lives in — drives `TableCell`'s th/td element resolution. */
export type TableSection = 'head' | 'body' | 'footer'

export const TableSectionContext = createContext<TableSection | undefined>(undefined)
