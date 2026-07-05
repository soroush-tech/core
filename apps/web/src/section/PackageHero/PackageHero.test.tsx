import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { PackageHero } from './PackageHero'

const props = {
  name: '@soroush.tech/vite-plugin-msw-server',
  tagline: 'Run an msw/node mock server during dev and SSG/SSR builds.',
  install: 'npm i -D @soroush.tech/vite-plugin-msw-server msw',
  npmUrl: 'https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server',
  repoUrl: 'https://github.com/soroush-tech/core/tree/main/packages/vite-plugin-msw-server',
}

describe('PackageHero', () => {
  it('renders as a section element', () => {
    renderWithTheme(<PackageHero {...props} />)
    expect(document.querySelector('section')).toBeInTheDocument()
  })

  it('renders the package name as the h1', () => {
    renderWithTheme(<PackageHero {...props} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(props.name)
  })

  it('renders the tagline', () => {
    renderWithTheme(<PackageHero {...props} />)
    expect(screen.getByText(props.tagline)).toBeInTheDocument()
  })

  it('renders the install command', () => {
    renderWithTheme(<PackageHero {...props} />)
    expect(screen.getByText(props.install)).toBeInTheDocument()
  })

  it('links VIEW_ON_NPM to the npm page in a new tab', () => {
    renderWithTheme(<PackageHero {...props} />)
    const link = screen.getByRole('link', { name: 'VIEW_ON_NPM' })
    expect(link).toHaveAttribute('href', props.npmUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('links SOURCE to the package source', () => {
    renderWithTheme(<PackageHero {...props} />)
    expect(screen.getByRole('link', { name: 'SOURCE' })).toHaveAttribute('href', props.repoUrl)
  })
})
