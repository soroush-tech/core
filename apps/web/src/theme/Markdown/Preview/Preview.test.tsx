import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Preview } from './Preview'

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
  '- [ ] unchecked task',
  '- [x] checked task',
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

const renderPreview = () => renderWithTheme(<Preview>{content}</Preview>)

describe('Preview', () => {
  it('maps headings to styled Typography elements', () => {
    renderPreview()
    for (let level = 1; level <= 6; level++) {
      expect(screen.getByRole('heading', { level, name: `Heading ${level}` })).toBeInTheDocument()
    }
  })

  it('maps inline elements: paragraph, bold, italic and link', () => {
    renderPreview()
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByText('italic').tagName).toBe('EM')
    const link = screen.getByRole('link', { name: 'link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('maps unordered and ordered lists', () => {
    renderPreview()
    expect(screen.getByText('bullet one').closest('ul')).toBeInTheDocument()
    expect(screen.getByText('number one').closest('ol')).toBeInTheDocument()
  })

  it('renders GFM task-list items as checkboxes reflecting their state', () => {
    renderPreview()
    const checkboxes = screen.getAllByRole('checkbox', { name: 'Task item' })
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).not.toBeChecked()
    expect(checkboxes[1]).toBeChecked()
    expect(screen.getByText('unchecked task')).toBeInTheDocument()
    expect(screen.getByText('checked task')).toBeInTheDocument()
  })

  it('maps blockquotes', () => {
    renderPreview()
    expect(screen.getByText('a quoted line').closest('blockquote')).toBeInTheDocument()
  })

  it('maps inline code and highlighted fenced code blocks', () => {
    const { container } = renderPreview()
    expect(screen.getByText('inline code').tagName).toBe('CODE')

    // rehype-highlight tokenises the block into <span class="hljs-*"> children,
    // so assert on the reassembled text plus a highlighted token.
    const pre = container.querySelector('pre')
    expect(pre).toBeInTheDocument()
    expect(pre).toHaveTextContent('const block = true')
    expect(pre?.querySelector('.hljs-keyword')).toHaveTextContent('const')
  })

  it('maps GFM tables with aligned cells', () => {
    renderPreview()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    // the `----:` column is right-aligned via an inline style
    expect(screen.getByRole('columnheader', { name: 'Role' })).toHaveStyle({ textAlign: 'right' })
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Dev' })).toHaveStyle({ textAlign: 'right' })
  })

  it('maps horizontal rules and images', () => {
    renderPreview()
    expect(document.querySelector('hr')).toBeInTheDocument()
    expect(screen.getByAltText('alt text')).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('merges slotProps over an element’s default props', () => {
    const { container } = renderWithTheme(
      <Preview slotProps={{ p: { className: 'custom-para', color: 'primary' } }}>
        {'a paragraph'}
      </Preview>
    )
    expect(container.querySelector('.custom-para')).toHaveTextContent('a paragraph')
  })

  it('keeps the rendered DOM nodes when slotProps changes identity', () => {
    const { rerender } = renderWithTheme(
      <Preview slotProps={{ p: { color: 'primary' } }}>{'a paragraph'}</Preview>
    )
    const paragraph = screen.getByText('a paragraph')
    // A new inline slotProps object must not remount the tree — same node, updated props.
    rerender(<Preview slotProps={{ p: { color: 'secondary' } }}>{'a paragraph'}</Preview>)
    expect(screen.getByText('a paragraph')).toBe(paragraph)
  })
})
