import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Markdown } from './Markdown'

const content = [
  '# Heading 1',
  '## Heading 2',
  '### Heading 3',
  '#### Heading 4',
  '##### Heading 5',
  '###### Heading 6',
  '',
  'A paragraph with **bold**, *italic*, `inline code` and a [link](https://example.com).',
  '',
  '- bullet one',
  '- bullet two',
  '',
  '1. number one',
  '2. number two',
  '',
  '> a quoted line',
  '',
  '```js',
  'const block = true',
  '```',
  '',
  '| Name | Role  |',
  '| :--- | ----: |',
  '| Ada  | Dev   |',
  '',
  '---',
  '',
  '![alt text](https://example.com/img.png)',
].join('\n')

const renderMarkdown = () => renderWithTheme(<Markdown>{content}</Markdown>)

describe('Markdown', () => {
  it('maps headings to styled Typography elements', () => {
    renderMarkdown()
    for (let level = 1; level <= 6; level++) {
      expect(screen.getByRole('heading', { level, name: `Heading ${level}` })).toBeInTheDocument()
    }
  })

  it('maps inline elements: paragraph, bold, italic and link', () => {
    renderMarkdown()
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByText('italic').tagName).toBe('EM')
    const link = screen.getByRole('link', { name: 'link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('maps unordered and ordered lists', () => {
    renderMarkdown()
    expect(screen.getByText('bullet one').closest('ul')).toBeInTheDocument()
    expect(screen.getByText('number one').closest('ol')).toBeInTheDocument()
  })

  it('maps blockquotes', () => {
    renderMarkdown()
    expect(screen.getByText('a quoted line').closest('blockquote')).toBeInTheDocument()
  })

  it('maps inline code and highlighted fenced code blocks', () => {
    const { container } = renderMarkdown()
    expect(screen.getByText('inline code').tagName).toBe('CODE')

    // rehype-highlight tokenises the block into <span class="hljs-*"> children,
    // so assert on the reassembled text plus a highlighted token.
    const pre = container.querySelector('pre')
    expect(pre).toBeInTheDocument()
    expect(pre).toHaveTextContent('const block = true')
    expect(pre?.querySelector('.hljs-keyword')).toHaveTextContent('const')
  })

  it('maps GFM tables with aligned cells', () => {
    renderMarkdown()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    // the `----:` column is right-aligned via an inline style
    expect(screen.getByRole('columnheader', { name: 'Role' })).toHaveStyle({ textAlign: 'right' })
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Dev' })).toHaveStyle({ textAlign: 'right' })
  })

  it('maps horizontal rules and images', () => {
    renderMarkdown()
    expect(document.querySelector('hr')).toBeInTheDocument()
    expect(screen.getByAltText('alt text')).toHaveAttribute('src', 'https://example.com/img.png')
  })
})
