import { type ReactNode } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent, screen } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { Flex } from './Flex'
import { Grid } from './Grid'
import { View } from './View'
import { createTheme, baseTheme, type ThemeComponents } from './themes'
import { AppBar } from './AppBar'
import { Avatar } from './Avatar'
import { Backdrop } from './Backdrop'
import { Button } from './Button'
import { ButtonGroup } from './ButtonGroup'
import { Checkbox } from './Checkbox'
import { CircularProgress } from './CircularProgress'
import { Drawer } from './Drawer'
import { FormControl } from './FormControl'
import { FormHelperText } from './FormHelperText'
import { FormLabel } from './FormLabel'
import { Icon } from './Icon'
import { Image } from './Image'
import { LinearProgress } from './LinearProgress'
import { Link } from './Link'
import { MenuItem } from './MenuItem'
import { Modal } from './Modal'
import { NativeSelect } from './NativeSelect'
import { Pagination } from './Pagination'
import { Paper } from './Paper'
import { Popover } from './Popover'
import { Quote } from './Quote'
import { Radio } from './Radio'
import { Select } from './Select'
import { Skeleton } from './Skeleton'
import { Switch } from './Switch'
import { Table } from './Table/Table'
import { TableBody } from './Table/TableBody'
import { TableCell } from './Table/TableCell'
import { TableContainer } from './Table/TableContainer'
import { TableFooter } from './Table/TableFooter'
import { TableHead } from './Table/TableHead'
import { TablePagination } from './Table/TablePagination'
import { TableRow } from './Table/TableRow'
import { TableSortLabel } from './Table/TableSortLabel'
import { TextInput } from './TextInput'
import { ToggleButton } from './ToggleButton/ToggleButton'
import { ToggleButtonGroup } from './ToggleButton/ToggleButtonGroup'
import { Typography } from './Typography'

afterEach(cleanup)

// A declaration no component sets on its own, so a match proves the override applied.
const MARKER = { textIndent: '7px' }

/**
 * Finds the rendered element whose emotion class carries the given styled
 * `label` — works across portals since it scans the whole document.
 */
function byLabel(label: string): HTMLElement {
  const matcher = new RegExp(`(^|\\s)css-[^ ]+-${label}(\\s|$)`)
  const match = Array.from(document.body.querySelectorAll<HTMLElement>('*')).find((element) =>
    matcher.test(element.getAttribute('class') ?? '')
  )
  if (!match) throw new Error(`no element rendered with emotion label "${label}"`)
  return match
}

function makeAnchor() {
  const anchor = document.createElement('button')
  anchor.getBoundingClientRect = () =>
    ({ top: 100, left: 40, width: 120, height: 30, bottom: 130, right: 160 }) as DOMRect
  document.body.appendChild(anchor)
  return anchor
}

interface Case {
  /** `theme.components` key receiving the styleOverrides. */
  name: keyof ThemeComponents
  /** The `styleOverrides` slot under test. */
  slot: string
  /** Emotion `label` of the styled element the override must land on. */
  label: string
  ui: ReactNode
  /** Post-render interaction that mounts the slot's element (e.g. opening a menu). */
  open?: () => void
}

const table = (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>h</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>c</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell>f</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
)

const tablePagination = (
  <table>
    <tfoot>
      <tr>
        <TablePagination count={100} page={2} rowsPerPage={10} onPageChange={() => {}} />
      </tr>
    </tfoot>
  </table>
)

const cases: Case[] = [
  { name: 'AppBar', slot: 'root', label: 'AppBar', ui: <AppBar>x</AppBar> },
  { name: 'Avatar', slot: 'root', label: 'avatar', ui: <Avatar>A</Avatar> },
  { name: 'Backdrop', slot: 'root', label: 'Backdrop', ui: <Backdrop /> },
  {
    name: 'ButtonGroup',
    slot: 'root',
    label: 'ButtonGroup',
    ui: (
      <ButtonGroup>
        <Button>a</Button>
      </ButtonGroup>
    ),
  },
  { name: 'Checkbox', slot: 'root', label: 'Checkbox', ui: <Checkbox /> },
  {
    name: 'CircularProgress',
    slot: 'root',
    label: 'CircularProgress',
    ui: <CircularProgress />,
  },
  { name: 'Drawer', slot: 'root', label: 'Drawer', ui: <Drawer isOpen>x</Drawer> },
  { name: 'FormControl', slot: 'root', label: 'FormControl', ui: <FormControl>x</FormControl> },
  {
    name: 'FormHelperText',
    slot: 'root',
    label: 'FormHelperText',
    ui: <FormHelperText>h</FormHelperText>,
  },
  { name: 'FormLabel', slot: 'root', label: 'FormLabel', ui: <FormLabel>l</FormLabel> },
  { name: 'Icon', slot: 'root', label: 'icon', ui: <Icon name="external_link" /> },
  { name: 'Image', slot: 'root', label: 'image', ui: <Image src="p.jpg" alt="t" /> },
  { name: 'LinearProgress', slot: 'root', label: 'LinearProgress', ui: <LinearProgress /> },
  { name: 'Link', slot: 'root', label: 'Link', ui: <Link href="/">x</Link> },
  { name: 'MenuItem', slot: 'root', label: 'MenuItem', ui: <MenuItem value="a">A</MenuItem> },
  {
    name: 'Modal',
    slot: 'root',
    label: 'Modal',
    ui: (
      <Modal isOpen>
        <div>x</div>
      </Modal>
    ),
  },
  {
    name: 'NativeSelect',
    slot: 'root',
    label: 'NativeSelect',
    ui: <NativeSelect options={[{ label: 'Ten', value: 10 }]} defaultValue={10} />,
  },
  { name: 'Pagination', slot: 'root', label: 'PaginationNav', ui: <Pagination count={3} /> },
  { name: 'Pagination', slot: 'list', label: 'Pagination', ui: <Pagination count={3} /> },
  {
    name: 'PaginationItem',
    slot: 'root',
    label: 'PaginationItem',
    ui: <Pagination count={3} />,
  },
  {
    name: 'PaginationItem',
    slot: 'ellipsis',
    label: 'PaginationEllipsis',
    ui: <Pagination count={20} />,
  },
  { name: 'Paper', slot: 'root', label: 'paper', ui: <Paper>x</Paper> },
  {
    name: 'Popover',
    slot: 'root',
    label: 'Popover',
    ui: (
      <Popover open anchorEl={makeAnchor()}>
        <p>P</p>
      </Popover>
    ),
  },
  { name: 'Quote', slot: 'root', label: 'Quote', ui: <Quote>q</Quote> },
  { name: 'Radio', slot: 'root', label: 'Radio', ui: <Radio /> },
  {
    name: 'Select',
    slot: 'root',
    label: 'Select',
    ui: (
      <Select defaultValue={1}>
        <MenuItem value={1}>One</MenuItem>
      </Select>
    ),
  },
  { name: 'Skeleton', slot: 'root', label: 'skeleton', ui: <Skeleton /> },
  { name: 'Switch', slot: 'root', label: 'Switch', ui: <Switch /> },
  { name: 'Table', slot: 'root', label: 'Table', ui: table },
  { name: 'TableBody', slot: 'root', label: 'TableBody', ui: table },
  { name: 'TableCell', slot: 'root', label: 'TableCell', ui: table },
  {
    name: 'TableContainer',
    slot: 'root',
    label: 'TableContainer',
    ui: <TableContainer>x</TableContainer>,
  },
  { name: 'TableFooter', slot: 'root', label: 'TableFooter', ui: table },
  { name: 'TableHead', slot: 'root', label: 'TableHead', ui: table },
  {
    name: 'TablePagination',
    slot: 'root',
    label: 'TablePaginationToolbar',
    ui: tablePagination,
  },
  {
    name: 'TablePaginationActions',
    slot: 'root',
    label: 'TablePaginationActions',
    ui: tablePagination,
  },
  { name: 'TableRow', slot: 'root', label: 'TableRow', ui: table },
  {
    name: 'TableSortLabel',
    slot: 'root',
    label: 'TableSortLabel',
    ui: <TableSortLabel>Name</TableSortLabel>,
  },
  { name: 'TextInput', slot: 'root', label: 'TextInput', ui: <TextInput /> },
  {
    name: 'ToggleButton',
    slot: 'root',
    label: 'ToggleButton',
    ui: <ToggleButton value="b">B</ToggleButton>,
  },
  {
    name: 'ToggleButtonGroup',
    slot: 'root',
    label: 'ToggleButtonGroup',
    ui: (
      <ToggleButtonGroup aria-label="g" value="b" onChange={() => {}}>
        <ToggleButton value="b">B</ToggleButton>
      </ToggleButtonGroup>
    ),
  },
  { name: 'Typography', slot: 'root', label: 'Typography', ui: <Typography>t</Typography> },
  { name: 'View', slot: 'root', label: 'View', ui: <View>v</View> },
  { name: 'Flex', slot: 'root', label: 'flex', ui: <Flex>f</Flex> },
  { name: 'Grid', slot: 'root', label: 'grid', ui: <Grid>g</Grid> },
  { name: 'Avatar', slot: 'img', label: 'AvatarImg', ui: <Avatar src="p.jpg" alt="a" /> },
  {
    name: 'Button',
    slot: 'loader',
    label: 'ButtonLoader',
    ui: (
      <Button loading loadingPosition="center">
        x
      </Button>
    ),
  },
  { name: 'Checkbox', slot: 'input', label: 'CheckboxInput', ui: <Checkbox /> },
  { name: 'Checkbox', slot: 'icon', label: 'CheckboxIcon', ui: <Checkbox /> },
  {
    name: 'CircularProgress',
    slot: 'track',
    label: 'CircularProgressTrack',
    ui: <CircularProgress showTrack />,
  },
  {
    name: 'CircularProgress',
    slot: 'circle',
    label: 'CircularProgressCircle',
    ui: <CircularProgress />,
  },
  {
    name: 'LinearProgress',
    slot: 'track',
    label: 'LinearProgressTrack',
    ui: <LinearProgress />,
  },
  {
    name: 'LinearProgress',
    slot: 'dash',
    label: 'LinearProgressDash',
    ui: <LinearProgress variant="determinate" buffer value={30} valueBuffer={50} />,
  },
  {
    name: 'LinearProgress',
    slot: 'bar',
    label: 'LinearProgressBar',
    ui: <LinearProgress variant="determinate" value={40} />,
  },
  {
    name: 'LinearProgress',
    slot: 'traveler',
    label: 'LinearProgressTraveler',
    ui: <LinearProgress variant="determinate" value={40} spinning />,
  },
  {
    name: 'LinearProgress',
    slot: 'segment',
    label: 'LinearProgressSegment',
    ui: <LinearProgress variant="determinate" value={40} spinning />,
  },
  {
    name: 'LinearProgress',
    slot: 'secondaryBar',
    label: 'LinearProgressBarSecondary',
    ui: <LinearProgress />,
  },
  {
    name: 'MenuItem',
    slot: 'check',
    label: 'MenuItemCheck',
    ui: (
      <MenuItem multiple value="a">
        A
      </MenuItem>
    ),
  },
  {
    name: 'NativeSelect',
    slot: 'select',
    label: 'NativeSelectSelect',
    ui: <NativeSelect options={[{ label: 'Ten', value: 10 }]} defaultValue={10} />,
  },
  {
    name: 'NativeSelect',
    slot: 'icon',
    label: 'NativeSelectIcon',
    ui: <NativeSelect options={[{ label: 'Ten', value: 10 }]} defaultValue={10} />,
  },
  {
    name: 'Popover',
    slot: 'positioner',
    label: 'PopoverPositioner',
    ui: (
      <Popover open anchorEl={makeAnchor()}>
        <p>P</p>
      </Popover>
    ),
  },
  { name: 'Radio', slot: 'input', label: 'RadioInput', ui: <Radio /> },
  { name: 'Radio', slot: 'icon', label: 'RadioIcon', ui: <Radio /> },
  {
    name: 'Select',
    slot: 'value',
    label: 'SelectValue',
    ui: (
      <Select defaultValue={1}>
        <MenuItem value={1}>One</MenuItem>
      </Select>
    ),
  },
  {
    name: 'Select',
    slot: 'valueArea',
    label: 'SelectValueArea',
    ui: (
      <Select defaultValue={1}>
        <MenuItem value={1}>One</MenuItem>
      </Select>
    ),
  },
  {
    name: 'Select',
    slot: 'valueGhost',
    label: 'SelectValueGhost',
    ui: (
      <Select defaultValue={1}>
        <MenuItem value={1}>One</MenuItem>
      </Select>
    ),
  },
  {
    name: 'Select',
    slot: 'listbox',
    label: 'SelectListbox',
    ui: (
      <Select defaultValue={1}>
        <MenuItem value={1}>One</MenuItem>
      </Select>
    ),
    open: () => fireEvent.click(screen.getByRole('combobox')),
  },
  { name: 'Skeleton', slot: 'content', label: 'SkeletonContent', ui: <Skeleton>t</Skeleton> },
  { name: 'Switch', slot: 'input', label: 'SwitchInput', ui: <Switch /> },
  { name: 'Switch', slot: 'track', label: 'SwitchTrack', ui: <Switch /> },
  { name: 'Switch', slot: 'thumb', label: 'SwitchThumb', ui: <Switch /> },
  {
    name: 'TableSortLabel',
    slot: 'icon',
    label: 'TableSortLabelIcon',
    ui: <TableSortLabel>Name</TableSortLabel>,
  },
  { name: 'TextInput', slot: 'input', label: 'TextInputInput', ui: <TextInput /> },
]

describe('theme.components styleOverrides', () => {
  it.each(cases)('$name applies styleOverrides.$slot', ({ name, slot, label, ui, open }) => {
    const theme = createTheme(baseTheme, {
      components: { [name]: { styleOverrides: { [slot]: MARKER } } },
    })
    render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
    open?.()
    expect(byLabel(label)).toHaveStyle(MARKER)
  })
})
