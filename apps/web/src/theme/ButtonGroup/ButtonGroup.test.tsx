import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from 'src/theme/themes'
import { Button } from 'src/theme/Button'
import { ButtonGroup } from './ButtonGroup'

describe('ButtonGroup', () => {
  it('renders a labelled group of buttons', () => {
    renderWithTheme(
      <ButtonGroup aria-label="Basic button group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole('group', { name: 'Basic button group' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('broadcasts variant and color to child buttons', () => {
    renderWithTheme(
      <ButtonGroup variant="contained" color="secondary" aria-label="group">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: dark.palette.secondary.main,
    })
  })

  it('defaults child buttons to the outlined variant', () => {
    renderWithTheme(
      <ButtonGroup aria-label="group">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: dark.palette.primary.main,
    })
  })

  it('broadcasts size to child buttons', () => {
    renderWithTheme(
      <ButtonGroup size="lg" aria-label="group">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole('button')).toHaveStyle({
      paddingTop: dark.space[dark.sizes.lg.paddingTop],
    })
  })

  it('lets explicit child props override the group', () => {
    renderWithTheme(
      <ButtonGroup variant="outlined" color="primary" disabled aria-label="group">
        <Button variant="contained" color="secondary" disabled={false}>
          Override
        </Button>
      </ButtonGroup>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: dark.palette.secondary.main })
    expect(button).not.toBeDisabled()
  })

  it('disables all child buttons', () => {
    renderWithTheme(
      <ButtonGroup disabled aria-label="group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('lays out horizontally by default and vertically via orientation', () => {
    renderWithTheme(
      <ButtonGroup aria-label="horizontal" data-testid="horizontal">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('horizontal')).toHaveStyle({ flexDirection: 'row' })

    renderWithTheme(
      <ButtonGroup orientation="vertical" aria-label="vertical" data-testid="vertical">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('vertical')).toHaveStyle({ flexDirection: 'column' })
  })

  it('collapses adjacent borders via a stylesheet rule', () => {
    renderWithTheme(
      <ButtonGroup aria-label="group" data-testid="group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    const groupClasses = Array.from(screen.getByTestId('group').classList)
    const allRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
    const hasMergeRule = allRules.some(
      (rule) =>
        groupClasses.some((cls) => rule.cssText.includes(cls)) &&
        rule.cssText.includes(':not(:first-of-type)') &&
        rule.cssText.includes('margin-left')
    )
    expect(hasMergeRule).toBe(true)
  })

  // Corner rules live on descendant selectors (`.group > *:first-of-type`), which
  // jsdom doesn't apply to elements — assert them by scanning the stylesheet.
  const groupRule = (testid: string, selectorFragment: string) => {
    const groupClasses = Array.from(screen.getByTestId(testid).classList)
    const allRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
    return allRules.find(
      (rule) =>
        groupClasses.some((cls) => rule.cssText.includes(cls)) &&
        rule.cssText.includes(selectorFragment)
    )?.cssText
  }

  it('rounds the group outer corners and squares the inner ones (horizontal)', () => {
    renderWithTheme(
      <ButtonGroup borderRadius="md" aria-label="group" data-testid="group">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    )
    const r = dark.radii.md

    const first = groupRule('group', '*:first-of-type')
    expect(first).toContain(`border-top-left-radius: ${r}`)
    expect(first).toContain(`border-bottom-left-radius: ${r}`)
    expect(first).toContain('border-top-right-radius: 0')

    const last = groupRule('group', '*:last-of-type')
    expect(last).toContain(`border-top-right-radius: ${r}`)
    expect(last).toContain(`border-bottom-right-radius: ${r}`)
    expect(last).toContain('border-top-left-radius: 0')

    const middle = groupRule('group', ':not(:first-of-type):not(:last-of-type)')
    expect(middle).toContain('border-radius: 0')
  })

  it('keeps the full radius on a single-button group via :only-child', () => {
    renderWithTheme(
      <ButtonGroup borderRadius="lg" aria-label="group" data-testid="group">
        <Button>Only</Button>
      </ButtonGroup>
    )
    const only = groupRule('group', ':only-child')
    expect(only).toContain(`border-radius: ${dark.radii.lg}`)
  })

  it('rounds the top/bottom outer corners when vertical', () => {
    renderWithTheme(
      <ButtonGroup orientation="vertical" borderRadius="sm" aria-label="group" data-testid="group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    const r = dark.radii.sm
    const first = groupRule('group', '*:first-of-type')
    expect(first).toContain(`border-top-left-radius: ${r}`)
    expect(first).toContain(`border-top-right-radius: ${r}`)
    expect(first).toContain('border-bottom-left-radius: 0')

    const last = groupRule('group', '*:last-of-type')
    expect(last).toContain(`border-bottom-left-radius: ${r}`)
    expect(last).toContain('border-top-left-radius: 0')
  })

  it('draws an opaque divider between contained buttons', () => {
    renderWithTheme(
      <ButtonGroup variant="contained" aria-label="group" data-testid="group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    // trailing buttons get a leading-edge divider in the color's dark shade (opaque)
    const divider = groupRule('group', 'border-left-color')
    expect(divider).toContain(':not(:first-of-type)')
    expect(divider).toMatch(/border-left-color: rgb\(/)
    expect(divider).not.toContain('rgba')
  })

  it('draws a translucent divider between text buttons', () => {
    renderWithTheme(
      <ButtonGroup variant="text" aria-label="group" data-testid="group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    const divider = groupRule('group', 'border-left-color')
    expect(divider).toContain(':not(:first-of-type)')
    expect(divider).toMatch(/border-left-color: rgba\([^)]*, 0\.5\)/)
  })

  it('collapses the outlined seam to a single border by hiding the trailing leading edge', () => {
    renderWithTheme(
      <ButtonGroup variant="outlined" aria-label="group" data-testid="group">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    // width is kept (no layout shift); only the color goes transparent
    const seam = groupRule('group', 'border-left-color')
    expect(seam).toContain(':not(:first-of-type)')
    expect(seam).toMatch(/border-left-color: (transparent|rgba\(0, 0, 0, 0\))/)
  })

  it('draws the divider on the top edge when vertical', () => {
    renderWithTheme(
      <ButtonGroup
        variant="contained"
        orientation="vertical"
        aria-label="group"
        data-testid="group"
      >
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    const divider = groupRule('group', 'border-top-color')
    expect(divider).toContain(':not(:first-of-type)')
    expect(divider).toMatch(/border-top-color: rgb\(/)
  })

  it('stretches to full width with children sharing it', () => {
    renderWithTheme(
      <ButtonGroup fullWidth aria-label="group" data-testid="group">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('group')).toHaveStyle({ width: '100%' })
  })

  it('overrides the root element via as', () => {
    renderWithTheme(
      <ButtonGroup as="section" aria-label="group" data-testid="group">
        <Button>One</Button>
      </ButtonGroup>
    )
    expect(screen.getByTestId('group').tagName).toBe('SECTION')
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderWithTheme(
      <ButtonGroup fullWidth orientation="vertical" aria-label="group" data-testid="group">
        <Button>One</Button>
      </ButtonGroup>
    )
    const group = screen.getByTestId('group')
    expect(group).not.toHaveAttribute('fullWidth')
    expect(group).not.toHaveAttribute('orientation')
  })
})
