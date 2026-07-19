import { useState, type MouseEvent } from 'react'
import { styled, type Theme } from '@soroush.tech/design-system'
import { themeDefault } from '@soroush.tech/design-system/theme'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Popover } from '@soroush.tech/design-system/Popover'
import { Typography } from '@soroush.tech/design-system/Typography'

/** Smallest grid shown, and the hard cap it grows to as the hover nears the edge. */
const MIN_EXTENT = 8
const MAX_EXTENT = 20

const DEFAULT_EXTENT = { rows: MIN_EXTENT, cols: MIN_EXTENT }

// Grow one axis to one past the hovered index, but never below its current size — the grid only
// expands while open (it doesn't shrink back), and is reset to the default when closed.
const growExtent = (current: number, hovered: number) =>
  Math.min(MAX_EXTENT, Math.max(current, hovered + 1))

export interface TablePickerProps {
  /** Fired with the chosen (rows, cols) when a grid cell is picked. */
  onSelect: (rows: number, cols: number) => void
}

// Small square cell whose fill flags whether it falls inside the hovered rectangle.
const Cell = styled('button', {
  name: 'MarkdownToolbar',
  slot: 'tablePickerCell',
  label: 'MarkdownEditorTableCell',
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }: { theme: Theme; isActive: boolean }) => ({
  width: 16,
  height: 16,
  padding: 0,
  margin: 0,
  appearance: 'none' as const,
  cursor: 'pointer',
  borderRadius: theme.radii.sm,
  border: `${theme.borderWidths.thin} solid ${theme.border.light}`,
  backgroundColor: isActive
    ? theme.palette[themeDefault(theme, 'color', 'primary')].main
    : theme.background[themeDefault(theme, 'inputBg', 'terminal')],
}))

/** A "Table" trigger that opens a hover grid for choosing table dimensions. */
export function TablePicker({ onSelect }: Readonly<TablePickerProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [hover, setHover] = useState({ rows: 0, cols: 0 })
  const [extent, setExtent] = useState(DEFAULT_EXTENT)
  const open = anchorEl !== null

  const close = () => {
    setAnchorEl(null)
    setHover({ rows: 0, cols: 0 })
    setExtent(DEFAULT_EXTENT)
  }

  const hoverCell = (rows: number, cols: number) => {
    setHover({ rows, cols })
    setExtent((prev) => ({ rows: growExtent(prev.rows, rows), cols: growExtent(prev.cols, cols) }))
  }

  const pick = (rows: number, cols: number) => {
    onSelect(rows, cols)
    close()
  }

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        size="sm"
        aria-label="Table"
        aria-haspopup="grid"
        aria-expanded={open}
        onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)}
      >
        <Icon name="table" size="1.1rem" />
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // The popover is portalled, so focus must be pulled into the grid — otherwise keyboard
        // users tab straight past it. The default auto-focus lands on the first cell.
        disableAriaHidden
      >
        <Flex flexDirection="column" gap={2} p={2}>
          <Flex flexDirection="column" gap={1} role="grid" aria-label="Table size">
            {Array.from({ length: extent.rows }, (_, r) => (
              <Flex key={r} flexDirection="row" gap={1} role="row">
                {Array.from({ length: extent.cols }, (_, c) => {
                  const rows = r + 1
                  const cols = c + 1
                  return (
                    <Cell
                      key={c}
                      type="button"
                      role="gridcell"
                      isActive={rows <= hover.rows && cols <= hover.cols}
                      aria-label={`${rows} by ${cols}`}
                      onMouseEnter={() => hoverCell(rows, cols)}
                      onFocus={() => hoverCell(rows, cols)}
                      onClick={() => pick(rows, cols)}
                    />
                  )
                })}
              </Flex>
            ))}
          </Flex>
          <Typography variant="caption" color="secondary" align="center" m={0}>
            {hover.rows > 0 ? `${hover.rows} × ${hover.cols}` : 'Select size'}
          </Typography>
        </Flex>
      </Popover>
    </>
  )
}
