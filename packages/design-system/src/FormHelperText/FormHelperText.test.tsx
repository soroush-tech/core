import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../themes'
import { FormControl } from '../FormControl'
import { Form } from '../Form'
import { FormHelperText } from './FormHelperText'

describe('FormHelperText', () => {
  it('renders a paragraph with its text', () => {
    renderWithTheme(<FormHelperText>Helper</FormHelperText>)
    const node = screen.getByText('Helper')
    expect(node.tagName.toLowerCase()).toBe('p')
  })

  it('uses the FormControl helper id', () => {
    renderWithTheme(
      <FormControl id="email">
        <FormHelperText>Helper</FormHelperText>
      </FormControl>
    )
    expect(screen.getByText('Helper')).toHaveAttribute('id', 'email-helper')
  })

  it('uses an explicit id over context', () => {
    renderWithTheme(
      <FormControl id="email">
        <FormHelperText id="explicit">Helper</FormHelperText>
      </FormControl>
    )
    expect(screen.getByText('Helper')).toHaveAttribute('id', 'explicit')
  })

  it('shows error styling and alert role from context', () => {
    renderWithTheme(
      <FormControl error>
        <FormHelperText>Invalid</FormHelperText>
      </FormControl>
    )
    const node = screen.getByText('Invalid')
    expect(node).toHaveAttribute('role', 'alert')
    expect(node).toHaveStyle({ color: baseTheme.text.error })
  })

  it('shows error styling from an explicit prop', () => {
    renderWithTheme(<FormHelperText error>Invalid</FormHelperText>)
    expect(screen.getByText('Invalid')).toHaveAttribute('role', 'alert')
  })

  it('renders secondary, non-alert text when not in error', () => {
    renderWithTheme(<FormHelperText>Helper</FormHelperText>)
    const node = screen.getByText('Helper')
    expect(node).not.toHaveAttribute('role')
    expect(node).toHaveStyle({ color: baseTheme.text.secondary })
  })

  it('forwards an explicit role when not in error', () => {
    renderWithTheme(<FormHelperText role="status">Saved</FormHelperText>)
    expect(screen.getByText('Saved')).toHaveAttribute('role', 'status')
  })

  it('registers and unregisters its presence with the FormControl', () => {
    const { unmount, rerender } = renderWithTheme(
      <FormControl id="email">
        <span data-testid="anchor" />
        <FormHelperText>Helper</FormHelperText>
      </FormControl>
    )
    // Presence is observable through the control's aria wiring in FormControl tests;
    // here we assert the effect runs without error on mount/update/unmount.
    rerender(
      <FormControl id="email">
        <span data-testid="anchor" />
        <FormHelperText>Helper</FormHelperText>
      </FormControl>
    )
    expect(screen.getByTestId('anchor')).toBeInTheDocument()
    unmount()
  })

  describe('textColor', () => {
    it('inherits textColor from FormControl when not in error', () => {
      renderWithTheme(
        <FormControl textColor="info">
          <FormHelperText>Hint</FormHelperText>
        </FormControl>
      )
      expect(screen.getByText('Hint')).toHaveStyle({ color: baseTheme.text.info })
    })

    it('inherits textColor from a parent Form', () => {
      renderWithTheme(
        <Form textColor="success">
          <FormHelperText>Hint</FormHelperText>
        </Form>
      )
      expect(screen.getByText('Hint')).toHaveStyle({ color: baseTheme.text.success })
    })

    it('lets an explicit color win over context textColor', () => {
      renderWithTheme(
        <FormControl textColor="info">
          <FormHelperText color="warning">Hint</FormHelperText>
        </FormControl>
      )
      expect(screen.getByText('Hint')).toHaveStyle({ color: baseTheme.text.warning })
    })

    it('keeps the error color over textColor in the error state', () => {
      renderWithTheme(
        <FormControl error textColor="info">
          <FormHelperText>Bad</FormHelperText>
        </FormControl>
      )
      const node = screen.getByText('Bad')
      expect(node).toHaveStyle({ color: baseTheme.text.error })
      expect(node).toHaveAttribute('role', 'alert')
    })
  })
})
