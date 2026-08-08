import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'

vi.mock('src/common/Header', () => ({
  Header: () => <header data-testid="header" />,
}))

vi.mock('src/common/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}))

vi.mock('src/common/CookieNotice', () => ({
  CookieNotice: () => <div data-testid="cookie-notice" />,
}))

import { Layout } from './Layout'

describe('Layout', () => {
  it.each(['header', 'footer', 'cookie-notice'])('renders the default %s', (testId) => {
    renderWithTheme(<Layout>content</Layout>)
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('renders children inside Blueprint', () => {
    renderWithTheme(
      <Layout>
        <div data-testid="child" />
      </Layout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders a custom header', () => {
    renderWithTheme(<Layout header={<header data-testid="custom-header" />}>content</Layout>)
    expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    expect(screen.queryByTestId('header')).not.toBeInTheDocument()
  })

  it('renders a custom footer', () => {
    renderWithTheme(<Layout footer={<footer data-testid="custom-footer" />}>content</Layout>)
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument()
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
  })

  it('suppresses header when header={null}', () => {
    renderWithTheme(<Layout header={null}>content</Layout>)
    expect(screen.queryByTestId('header')).not.toBeInTheDocument()
  })

  it('suppresses footer when footer={null}', () => {
    renderWithTheme(<Layout footer={null}>content</Layout>)
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
  })

  describe('loading', () => {
    it('renders children inside the Suspense boundary when loading is provided', () => {
      renderWithTheme(
        <Layout loading={<div data-testid="fallback" />}>
          <div data-testid="child" />
        </Layout>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('shows the loading fallback while a child suspends', () => {
      function Suspending(): never {
        throw new Promise<void>(() => {})
      }
      renderWithTheme(
        <Layout loading={<div data-testid="fallback" />}>
          <Suspending />
        </Layout>
      )
      expect(screen.getByTestId('fallback')).toBeInTheDocument()
    })

    it('shows a centered CircularProgress when loading is true and a child suspends', () => {
      function Suspending(): never {
        throw new Promise<void>(() => {})
      }
      renderWithTheme(
        <Layout loading>
          <Suspending />
        </Layout>
      )
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })
})
