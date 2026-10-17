import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from 'src/test/mocks/server'
import { installPopover } from 'src/test/utils/popover'

installPopover()

beforeAll(() => {
  server.listen()
  vi.clearAllMocks()
  vi.resetModules()
})

afterAll(() => {
  server.close()
  vi.resetModules()
  vi.restoreAllMocks()
})

afterEach(() => {
  server.resetHandlers()
})
