import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '@soroush.tech/design-system/utils/test/renderWithTheme'
import { baseTheme } from '@soroush.tech/design-system/theme'
import { Sidebar } from '../Sidebar'
import { SidebarItem } from './SidebarItem'

const renderItem = (
  ui: React.ReactNode,
  { isOpen = true, anchor }: { isOpen?: boolean; anchor?: 'left' | 'right' } = {}
) =>
  renderWithTheme(
    <Sidebar aria-label="Panels" isOpen={isOpen} anchor={anchor}>
      {ui}
    </Sidebar>
  )

describe('SidebarItem', () => {
  it('fires onSelect and keeps the label as the accessible name while collapsed', () => {
    const onSelect = vi.fn()
    renderItem(<SidebarItem icon="terminal" label="Terminal console" onSelect={onSelect} />, {
      isOpen: false,
    })
    const item = screen.getByRole('button', { name: 'Terminal console' })
    fireEvent.click(item)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('exposes selection through aria-pressed', () => {
    renderItem(<SidebarItem icon="history" label="Gist history" isSelected />)
    expect(screen.getByRole('button', { name: 'Gist history' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('renders custom children instead of the label text while open', () => {
    renderItem(
      <SidebarItem icon="edit_note" label="Drafts">
        <span>Drafts (3)</span>
      </SidebarItem>
    )
    expect(screen.getByText('Drafts (3)')).toBeInTheDocument()
    expect(screen.queryByText('Drafts', { exact: true })).not.toBeInTheDocument()
    // The accessible name stays the label.
    expect(screen.getByRole('button', { name: 'Drafts' })).toBeInTheDocument()
  })

  it('pins content to the anchored edge so the icon holds its position', () => {
    renderItem(<SidebarItem icon="edit_note" label="Drafts" />, { anchor: 'right' })
    const item = screen.getByRole('button', { name: 'Drafts' })
    expect(item).toHaveStyle({ justifyContent: 'flex-end' })
    expect(screen.getByText('Drafts').parentElement).toHaveStyle({ flexDirection: 'row-reverse' })
  })

  it('lays out left-anchored items icon-first', () => {
    renderItem(<SidebarItem icon="edit_note" label="Drafts" />, { anchor: 'left' })
    const item = screen.getByRole('button', { name: 'Drafts' })
    expect(item).toHaveStyle({ justifyContent: 'flex-start' })
    expect(screen.getByText('Drafts').parentElement).toHaveStyle({ flexDirection: 'row' })
  })

  it('never wraps or shrinks, so an opening rail cannot shift the rows', () => {
    renderItem(<SidebarItem icon="folder" label="A label long enough to wrap" />)
    const item = screen.getByRole('button', { name: 'A label long enough to wrap' })
    // Without these the label breaks onto a second line while the rail is still
    // narrow, doubling the row height and shifting every row below it.
    expect(item).toHaveStyle({ whiteSpace: 'nowrap' })
    expect(screen.getByText('A label long enough to wrap').parentElement).toHaveStyle({
      flexShrink: '0',
    })
  })

  it('is borderless by default and bordered with the outlined variant', () => {
    renderItem(
      <>
        <SidebarItem icon="folder" label="Directory" isSelected />
        <SidebarItem icon="account_tree" label="GitHub" variant="outlined" isSelected />
      </>
    )
    // Outlined selection carries the accent border; the default text variant doesn't.
    expect(screen.getByRole('button', { name: 'GitHub' })).toHaveStyle({
      borderColor: baseTheme.palette.primary.main,
    })
    expect(screen.getByRole('button', { name: 'Directory' })).not.toHaveStyle({
      borderColor: baseTheme.palette.primary.main,
    })
  })

  it('carries selection in the text color alone on the plain variant', () => {
    renderItem(
      <>
        <SidebarItem icon="folder" label="Directory" variant="plain" isSelected />
        <SidebarItem icon="account_tree" label="GitHub" variant="plain" />
      </>
    )
    // No fill either way — only the text color moves.
    expect(screen.getByRole('button', { name: 'Directory' })).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: baseTheme.palette.primary.main,
    })
    expect(screen.getByRole('button', { name: 'GitHub' })).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: baseTheme.text.primary,
    })
  })

  it('applies the density scale, defaulting to sm', () => {
    renderItem(
      <>
        <SidebarItem icon="folder" label="Directory" />
        <SidebarItem icon="account_tree" label="GitHub" size="lg" />
      </>
    )
    expect(screen.getByRole('button', { name: 'Directory' })).toHaveStyle({
      paddingTop: baseTheme.space[baseTheme.sizes.sm.paddingTop],
    })
    expect(screen.getByRole('button', { name: 'GitHub' })).toHaveStyle({
      paddingTop: baseTheme.space[baseTheme.sizes.lg.paddingTop],
    })
  })

  it('renders the label as plain text, not a button’s uppercase', () => {
    renderItem(<SidebarItem icon="folder" label="Directory" />)
    expect(screen.getByRole('button', { name: 'Directory' })).not.toHaveStyle({
      textTransform: 'uppercase',
    })
  })

  it('chains a consumer onClick with onSelect', () => {
    const onClick = vi.fn()
    const onSelect = vi.fn()
    renderItem(
      <SidebarItem icon="folder" label="Directory" onClick={onClick} onSelect={onSelect} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Directory' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('blocks activation while disabled', () => {
    const onSelect = vi.fn()
    renderItem(<SidebarItem icon="folder" label="Directory" disabled onSelect={onSelect} />)
    const item = screen.getByRole('button', { name: 'Directory' })
    // Pressable renders a non-form element, so disabled reads through ARIA.
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(item).toHaveAttribute('tabindex', '-1')
    fireEvent.click(item)
    fireEvent.keyDown(item, { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('keeps the selected fill while disabled, dimmed rather than dropped', () => {
    renderItem(<SidebarItem icon="folder" label="Directory" isSelected disabled />)
    const item = screen.getByRole('button', { name: 'Directory' })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(item).toHaveStyle({ color: baseTheme.palette.primary.main })
  })

  it('activates from the keyboard', () => {
    const onSelect = vi.fn()
    renderItem(<SidebarItem icon="folder" label="Directory" onSelect={onSelect} />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Directory' }), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('tolerates activation without an onSelect handler', () => {
    renderItem(<SidebarItem icon="account_tree" label="GitHub" />)
    fireEvent.click(screen.getByRole('button', { name: 'GitHub' }))
  })
})
