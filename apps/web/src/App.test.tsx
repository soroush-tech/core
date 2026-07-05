import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import App from './App'

describe('App', () => {
  it('renders the site name heading', () => {
    renderWithTheme(<App />)
    expect(screen.getByRole('heading', { name: 'SOROUSH™' })).toBeInTheDocument()
  })

  it('renders the coming soon text', () => {
    renderWithTheme(<App />)
    expect(screen.getByText('Coming soon.')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    renderWithTheme(<App />)
    expect(screen.getByText('Under construction, but worth the wait.')).toBeInTheDocument()
  })

  it('renders the logo image', () => {
    renderWithTheme(<App />)
    expect(screen.getByAltText('Soroush logo')).toBeInTheDocument()
  })

  it('renders the email link', () => {
    renderWithTheme(<App />)
    expect(screen.getByAltText('Soroush Email').closest('a')).toHaveAttribute(
      'href',
      'mailto:masoud@soroush.tech'
    )
  })

  it('renders the LinkedIn link', () => {
    renderWithTheme(<App />)
    expect(screen.getByAltText('Soroush LinkedIn').closest('a')).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/masoud-soroush-4139b152'
    )
  })

  it('renders the GitHub link', () => {
    renderWithTheme(<App />)
    expect(screen.getByAltText('Soroush GitHub').closest('a')).toHaveAttribute(
      'href',
      'https://github.com/soroush-tech/core'
    )
  })
})
