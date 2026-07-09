import { useState } from 'react'

export type PaginationItemType =
  'page' | 'first' | 'previous' | 'next' | 'last' | 'start-ellipsis' | 'end-ellipsis'

/** One renderable pagination item — `Pagination` maps these onto `PaginationItem`s. */
export interface UsePaginationItem {
  type: PaginationItemType
  /** Target page for actionable items; `null` for ellipses. */
  page: number | null
  isSelected: boolean
  isDisabled: boolean
  onClick?: () => void
}

export interface UsePaginationProps {
  /** Total number of pages. */
  count: number
  /** Controlled current page (1-based). */
  page?: number
  /** Uncontrolled initial page. Default: `1`. */
  defaultPage?: number
  /** Pages always visible either side of the current page. Default: `1`. */
  siblingCount?: number
  /** Pages always visible at the start and end. Default: `1`. */
  boundaryCount?: number
  /** Disables every item. Default: `false`. */
  disabled?: boolean
  shouldShowFirstButton?: boolean
  shouldShowLastButton?: boolean
  shouldHidePrevButton?: boolean
  shouldHideNextButton?: boolean
  /** Fired with the target page (1-based). */
  onChange?: (page: number) => void
}

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i)

/**
 * Headless pagination model — computes the item list (nav buttons, page numbers,
 * ellipses) with selection, boundary disabling, and controlled/uncontrolled paging.
 */
export function usePagination({
  count,
  page: pageProp,
  defaultPage = 1,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  shouldShowFirstButton = false,
  shouldShowLastButton = false,
  shouldHidePrevButton = false,
  shouldHideNextButton = false,
  onChange,
}: UsePaginationProps): { items: UsePaginationItem[] } {
  const [pageState, setPageState] = useState(defaultPage)
  const page = pageProp ?? pageState

  const handleClick = (value: number) => {
    if (pageProp === undefined) setPageState(value)
    onChange?.(value)
  }

  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  )
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  )

  // Page items are raw numbers here; the string members are only nav/ellipsis
  // types, so `'page'` never appears — excluding it lets `navTargets[item]` narrow.
  const startEllipsisFallback: Array<Exclude<PaginationItemType, 'page'> | number> =
    boundaryCount + 1 < count - boundaryCount ? [boundaryCount + 1] : []
  const endEllipsisFallback: Array<Exclude<PaginationItemType, 'page'> | number> =
    count - boundaryCount > boundaryCount ? [count - boundaryCount] : []
  const itemList: Array<Exclude<PaginationItemType, 'page'> | number> = [
    ...(shouldShowFirstButton ? (['first'] as const) : []),
    ...(shouldHidePrevButton ? [] : (['previous'] as const)),
    ...startPages,
    ...(siblingsStart > boundaryCount + 2 ? (['start-ellipsis'] as const) : startEllipsisFallback),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (['end-ellipsis'] as const)
      : endEllipsisFallback),
    ...endPages,
    ...(shouldHideNextButton ? [] : (['next'] as const)),
    ...(shouldShowLastButton ? (['last'] as const) : []),
  ]

  const navTargets: Record<'first' | 'previous' | 'next' | 'last', number> = {
    first: 1,
    previous: page - 1,
    next: page + 1,
    last: count,
  }

  const items = itemList.map((item): UsePaginationItem => {
    if (typeof item === 'number') {
      return {
        type: 'page',
        page: item,
        isSelected: item === page,
        isDisabled: disabled,
        onClick: () => handleClick(item),
      }
    }
    if (item === 'start-ellipsis' || item === 'end-ellipsis') {
      return { type: item, page: null, isSelected: false, isDisabled: true }
    }
    const target = navTargets[item]
    const isBackward = item === 'first' || item === 'previous'
    return {
      type: item,
      page: target,
      isSelected: false,
      isDisabled: disabled || (isBackward ? page <= 1 : page >= count),
      onClick: () => handleClick(target),
    }
  })

  return { items }
}
