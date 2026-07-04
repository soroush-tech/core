import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { PackageReadme } from './PackageReadme'

const readme = [
  '# @soroush.tech/pkg',
  '',
  '[![npm version](https://img/v.svg)](https://npm)',
  '',
  'Intro paragraph.',
  '',
  '## Install',
].join('\n')

describe('PackageReadme', () => {
  it('renders as a section element', () => {
    renderWithTheme(<PackageReadme readme={readme} />)
    expect(document.querySelector('section')).toBeInTheDocument()
  })

  it('renders the README body headings', () => {
    renderWithTheme(<PackageReadme readme={readme} />)
    expect(screen.getByRole('heading', { name: 'Install' })).toBeInTheDocument()
  })

  it('renders the README body prose', () => {
    renderWithTheme(<PackageReadme readme={readme} />)
    expect(screen.getByText('Intro paragraph.')).toBeInTheDocument()
  })

  it('strips the leading title and badges', () => {
    renderWithTheme(<PackageReadme readme={readme} />)
    expect(screen.queryByRole('heading', { name: '@soroush.tech/pkg' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
