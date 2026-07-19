import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import type { Gist } from 'src/types/github'

const markdownMock = vi.fn(({ children }: { children: string }) => (
  <div data-testid="markdown">{children}</div>
))
vi.mock('@soroush.tech/markdown', () => ({
  Preview: (props: { children: string }) => markdownMock(props),
}))

import { Article } from './Article'

const data = {
  description: 'My Test Article',
  files: { 'en.md': { content: '# Hello World' } },
} as unknown as Gist

describe('Article', () => {
  it('passes the gist markdown to the Markdown component', () => {
    renderWithTheme(<Article data={data} />)
    expect(screen.getByTestId('markdown')).toHaveTextContent('# Hello World')
    expect(markdownMock).toHaveBeenCalledWith(
      expect.objectContaining({ children: '# Hello World' })
    )
  })
})
