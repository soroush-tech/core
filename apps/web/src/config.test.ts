import { describe, it, expect, vi, afterEach } from 'vitest'

describe('config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  describe('BASE_URL', () => {
    it('uses VITE_BASE_URL when defined', async () => {
      vi.stubEnv('VITE_BASE_URL', 'https://api.example.com/')
      vi.resetModules()
      const { BASE_URL } = await import('./config')
      expect(BASE_URL).toBe('https://api.example.com/')
    })

    it('falls back to empty string when VITE_BASE_URL is not defined', async () => {
      const env = import.meta.env as Record<string, unknown>
      const saved = env.VITE_BASE_URL
      delete env.VITE_BASE_URL
      vi.resetModules()
      const { BASE_URL } = await import('./config')
      expect(BASE_URL).toBe('')
      env.VITE_BASE_URL = saved
    })
  })

  describe('API_URL', () => {
    it('uses VITE_API_URL when defined', async () => {
      vi.stubEnv('VITE_API_URL', 'http://localhost:8787/v1')
      vi.resetModules()
      const { API_URL } = await import('./config')
      expect(API_URL).toBe('http://localhost:8787/v1')
    })

    it('falls back to empty string when VITE_API_URL is not defined', async () => {
      const env = import.meta.env as Record<string, unknown>
      const saved = env.VITE_API_URL
      delete env.VITE_API_URL
      vi.resetModules()
      const { API_URL } = await import('./config')
      expect(API_URL).toBe('')
      env.VITE_API_URL = saved
    })
  })

  describe('GITHUB_KEY', () => {
    it('exposes the token to server-side code', async () => {
      vi.stubEnv('SSR', true)
      vi.stubEnv('VITE_GITHUB_KEY', 'token ghp_test')
      vi.resetModules()
      const { GITHUB_KEY } = await import('./config')
      expect(GITHUB_KEY).toBe('token ghp_test')
    })

    it('falls back to empty string when VITE_GITHUB_KEY is not defined', async () => {
      vi.stubEnv('SSR', true)
      const env = import.meta.env as Record<string, unknown>
      const saved = env.VITE_GITHUB_KEY
      delete env.VITE_GITHUB_KEY
      vi.resetModules()
      const { GITHUB_KEY } = await import('./config')
      expect(GITHUB_KEY).toBe('')
      env.VITE_GITHUB_KEY = saved
    })

    it('is empty in the client bundle so the token can never ship to visitors', async () => {
      vi.stubEnv('SSR', false)
      vi.stubEnv('VITE_GITHUB_KEY', 'token ghp_test')
      vi.resetModules()
      const { GITHUB_KEY } = await import('./config')
      expect(GITHUB_KEY).toBe('')
    })
  })
})
