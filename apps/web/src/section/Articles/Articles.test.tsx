import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'

vi.mock('src/hooks/useGists', () => ({
  useGists: vi.fn(() => ({
    data: [
      {
        id: '1',
        description: 'First Post',
        created_at: '2021-03-15T10:00:00Z',
        owner: { login: 'alice', avatar_url: 'https://avatars.test/alice.png' },
        files: { 'en.md': { size: 2650 } }, // 530 words → 2 min
      },
      {
        id: '2',
        description: 'Second Post',
        created_at: '2022-07-20T10:00:00Z',
        owner: { login: 'bob', avatar_url: 'https://avatars.test/bob.png' },
        files: { 'en.md': { size: 1325 } }, // 265 words → 1 min
      },
    ],
  })),
}))
vi.mock('src/common/NavLink', () => ({
  NavLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { Articles } from './Articles'
import { useGists } from 'src/hooks/useGists'
import { formatDate } from './utils'

describe('Articles', () => {
  it('renders a link for each gist', () => {
    renderWithTheme(<Articles />)
    expect(screen.getByRole('link', { name: 'First Post' })).toHaveAttribute('href', '/article/1/')
    expect(screen.getByRole('link', { name: 'Second Post' })).toHaveAttribute('href', '/article/2/')
  })

  it('renders the owner avatar for each gist', () => {
    renderWithTheme(<Articles />)
    expect(screen.getByRole('img', { name: 'alice' })).toHaveAttribute(
      'src',
      'https://avatars.test/alice.png'
    )
    expect(screen.getByRole('img', { name: 'bob' })).toHaveAttribute(
      'src',
      'https://avatars.test/bob.png'
    )
  })

  it('renders the author name for each gist', () => {
    renderWithTheme(<Articles />)
    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('bob')).toBeInTheDocument()
  })

  it('maps a known login to its display name', () => {
    vi.mocked(useGists).mockReturnValueOnce({
      data: [
        {
          id: '3',
          description: 'Mapped Post',
          created_at: '2023-01-01T10:00:00Z',
          owner: { login: 'soroushm', avatar_url: 'https://avatars.test/soroushm.png' },
          files: { 'en.md': { size: 1325 } },
        },
      ],
    } as unknown as ReturnType<typeof useGists>)
    renderWithTheme(<Articles />)
    expect(screen.getByText('Masoud Soroush')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Masoud Soroush' })).toBeInTheDocument()
  })

  it('renders the estimated read time from the gist file sizes', () => {
    renderWithTheme(<Articles />)
    expect(screen.getByText('2 min read')).toBeInTheDocument()
    expect(screen.getByText('1 min read')).toBeInTheDocument()
  })

  it('renders the created date as a local date inside a <time> element with the raw ISO value', () => {
    renderWithTheme(<Articles />)
    const time = screen.getByText(formatDate('2021-03-15T10:00:00Z'))
    expect(time.tagName.toLowerCase()).toBe('time')
    expect(time).toHaveAttribute('datetime', '2021-03-15T10:00:00Z')
    expect(screen.getByText(formatDate('2022-07-20T10:00:00Z'))).toBeInTheDocument()
  })

  it('renders nothing when there are no gists', () => {
    vi.mocked(useGists).mockReturnValueOnce({ data: [] } as unknown as ReturnType<typeof useGists>)
    renderWithTheme(<Articles />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
