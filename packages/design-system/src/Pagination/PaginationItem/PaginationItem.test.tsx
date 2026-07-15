import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { ThemeProvider } from '../../ThemeProvider'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { createTheme, baseTheme, type Theme } from '../../themes'
import { PaginationItem, type PaginationItemProps } from './PaginationItem'

describe('PaginationItem', () => {
  it('renders a page number as a button', () => {
    renderWithTheme(<PaginationItem page={3} />)
    const button = screen.getByRole('button', { name: '3' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('marks the selected page with aria-current and the palette color', () => {
    renderWithTheme(<PaginationItem page={2} isSelected data-testid="item" />)
    const item = screen.getByTestId('item')
    expect(item).toHaveAttribute('aria-current', 'page')
    expect(item).toHaveStyle({ backgroundColor: baseTheme.palette.primary.main })
  })

  it('does not set aria-current on unselected pages', () => {
    renderWithTheme(<PaginationItem page={2} data-testid="item" />)
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-current')
  })

  it.each(['first', 'previous', 'next', 'last'] as const)(
    'renders the %s nav control with its icon',
    (type) => {
      const { container } = renderWithTheme(<PaginationItem type={type} data-testid="item" />)
      expect(screen.getByTestId('item').tagName).toBe('BUTTON')
      expect(container.querySelector('svg')).toBeInTheDocument()
    }
  )

  it.each(['start-ellipsis', 'end-ellipsis'] as const)(
    'renders %s as a non-interactive span',
    (type) => {
      renderWithTheme(<PaginationItem type={type} data-testid="item" />)
      const item = screen.getByTestId('item')
      expect(item.tagName).toBe('SPAN')
      expect(item).toHaveTextContent('…')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    }
  )

  it('resolves the selected color against the palette', () => {
    renderWithTheme(<PaginationItem page={1} isSelected color="secondary" data-testid="item" />)
    expect(screen.getByTestId('item')).toHaveStyle({
      backgroundColor: baseTheme.palette.secondary.main,
    })
  })

  it('applies the outlined variant border', () => {
    renderWithTheme(<PaginationItem page={1} variant="outlined" data-testid="item" />)
    expect(screen.getByTestId('item')).toHaveStyle({ borderStyle: 'solid' })
  })

  it('uses the palette color for the border when selected and outlined', () => {
    renderWithTheme(<PaginationItem page={1} isSelected variant="outlined" data-testid="item" />)
    expect(screen.getByTestId('item')).toHaveStyle({
      borderColor: baseTheme.palette.primary.main,
    })
  })

  it('applies shape tokens', () => {
    renderWithTheme(<PaginationItem page={1} shape="rounded" data-testid="item" />)
    expect(screen.getByTestId('item')).toHaveStyle({ borderRadius: baseTheme.radii.md })

    renderWithTheme(<PaginationItem page={1} shape="circular" data-testid="circular" />)
    expect(screen.getByTestId('circular')).toHaveStyle({ borderRadius: '9999px' })
  })

  it('falls back to md dimensions for an augmented size without entries', () => {
    // Simulates a consumer-augmented theme: `sizes.xl` exists on the theme, but the
    // component's static dimension map only knows sm/md/lg.
    const augmented = createTheme(baseTheme, {
      sizes: { xl: { ...baseTheme.sizes.lg } } as Partial<Theme['sizes']>,
    })
    renderWithTheme(
      <PaginationItem page={1} size={'xl' as PaginationItemProps['size']} data-testid="item" />,
      { wrapper: ({ children }) => <ThemeProvider theme={augmented}>{children}</ThemeProvider> }
    )
    expect(screen.getByTestId('item')).toHaveStyle({ minWidth: '2rem', height: '2rem' })
  })

  it('applies size dimensions', () => {
    renderWithTheme(<PaginationItem page={1} size="lg" data-testid="item" />)
    expect(screen.getByTestId('item')).toHaveStyle({ minWidth: '2.5rem', height: '2.5rem' })
  })

  it('forwards onClick and disabled', () => {
    const onClick = vi.fn()
    renderWithTheme(<PaginationItem page={1} onClick={onClick} data-testid="item" />)
    fireEvent.click(screen.getByTestId('item'))
    expect(onClick).toHaveBeenCalledTimes(1)

    renderWithTheme(<PaginationItem page={2} disabled data-testid="disabled" />)
    expect(screen.getByTestId('disabled')).toBeDisabled()
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<PaginationItem page={1} as="a" data-testid="item" />)
    const item = screen.getByTestId('item')
    expect(item.tagName).toBe('A')
    expect(item).not.toHaveAttribute('type')
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderWithTheme(
      <PaginationItem page={1} isSelected aria-label="Go to page 1" data-testid="item" />
    )
    const item = screen.getByTestId('item')
    expect(item).toHaveAttribute('aria-label', 'Go to page 1')
    expect(item).not.toHaveAttribute('isSelected')
    expect(item).not.toHaveAttribute('shape')
  })
})
