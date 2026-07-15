import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../themes'
import { FormControl } from '../FormControl'
import { Form } from '../Form'
import { FormLabel } from './FormLabel'

describe('FormLabel', () => {
  it('renders a label element with its text', () => {
    renderWithTheme(<FormLabel>Email</FormLabel>)
    const label = screen.getByText('Email')
    expect(label.tagName.toLowerCase()).toBe('label')
  })

  it('links htmlFor to the FormControl id', () => {
    renderWithTheme(
      <FormControl id="email">
        <FormLabel>Email</FormLabel>
      </FormControl>
    )
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })

  it('uses an explicit htmlFor over context', () => {
    renderWithTheme(
      <FormControl id="ctx">
        <FormLabel htmlFor="explicit">Email</FormLabel>
      </FormControl>
    )
    expect(screen.getByText('Email')).toHaveAttribute('for', 'explicit')
  })

  it('appends a required indicator from context', () => {
    renderWithTheme(
      <FormControl required>
        <FormLabel>Email</FormLabel>
      </FormControl>
    )
    expect(screen.getByText('Email *')).toBeInTheDocument()
  })

  it('appends a required indicator from an explicit prop', () => {
    renderWithTheme(<FormLabel required>Email</FormLabel>)
    expect(screen.getByText('Email *')).toBeInTheDocument()
  })

  it('renders without htmlFor or indicator outside a FormControl', () => {
    renderWithTheme(<FormLabel>Email</FormLabel>)
    const label = screen.getByText('Email')
    expect(label).not.toHaveAttribute('for')
  })

  it('forwards Typography props', () => {
    renderWithTheme(
      <FormLabel className="my-label" textTransform="uppercase">
        Email
      </FormLabel>
    )
    const label = screen.getByText('Email')
    expect(label).toHaveClass('my-label')
    expect(label).toHaveStyle({ textTransform: 'uppercase' })
  })

  describe('textColor', () => {
    it('inherits textColor from FormControl', () => {
      renderWithTheme(
        <FormControl textColor="success">
          <FormLabel>Email</FormLabel>
        </FormControl>
      )
      expect(screen.getByText('Email')).toHaveStyle({ color: baseTheme.text.success })
    })

    it('inherits textColor from a parent Form', () => {
      renderWithTheme(
        <Form textColor="info">
          <FormLabel>Email</FormLabel>
        </Form>
      )
      expect(screen.getByText('Email')).toHaveStyle({ color: baseTheme.text.info })
    })

    it('lets an explicit color win over context textColor', () => {
      renderWithTheme(
        <FormControl textColor="success">
          <FormLabel color="error">Email</FormLabel>
        </FormControl>
      )
      expect(screen.getByText('Email')).toHaveStyle({ color: baseTheme.text.error })
    })
  })
})
