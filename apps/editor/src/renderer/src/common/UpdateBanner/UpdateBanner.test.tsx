import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { UpdateBanner } from './UpdateBanner'

let downloadedListener: ((version: string) => void) | undefined
const unsubscribe = vi.fn()
const updateApi = {
  onDownloaded: vi.fn((callback: (version: string) => void) => {
    downloadedListener = callback
    return unsubscribe
  }),
  install: vi.fn().mockResolvedValue({ success: true, data: null }),
}

vi.stubGlobal('editorAPI', { update: updateApi })

const renderBanner = () =>
  render(
    <ThemeProvider theme={editorTheme}>
      <UpdateBanner />
    </ThemeProvider>
  )

/** Delivers the word from main that a version finished downloading. */
const downloadFinishes = (version: string) => act(() => downloadedListener!(version))

beforeEach(() => {
  vi.clearAllMocks()
  downloadedListener = undefined
})

describe('UpdateBanner', () => {
  it('renders nothing until an update has been downloaded', () => {
    renderBanner()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('announces the downloaded version with an Update button', () => {
    renderBanner()

    downloadFinishes('0.4.0')

    expect(screen.getByRole('status')).toHaveTextContent(
      'A new update is available - version 0.4.0 is ready to install.'
    )
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('asks main to install when Update is pressed', async () => {
    renderBanner()
    downloadFinishes('0.4.0')

    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(updateApi.install).toHaveBeenCalledTimes(1)
  })

  it('hides when dismissed, and returns for the next download', async () => {
    renderBanner()
    downloadFinishes('0.4.0')

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(updateApi.install).not.toHaveBeenCalled()

    // A newer version finishing its download is fresh news, not the dismissed one.
    downloadFinishes('0.5.0')
    expect(screen.getByRole('status')).toHaveTextContent('0.5.0')
  })

  it('stops listening when unmounted', () => {
    const { unmount } = renderBanner()

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
