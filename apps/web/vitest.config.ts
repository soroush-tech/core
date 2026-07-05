// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Stub `*.svg?react` / `*.svg` and imagetools `?as=picture` imports so component
// tests don't need the real svgr/imagetools transforms. Shared by every project
// that renders components outside Storybook (jsdom `unit` and real-browser `unit-browser`).
const mockPlugins = [
  {
    name: 'svg-mock',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (/\.svg\?react/.test(id)) return '\0virtual:svg-react-mock'
      if (/\.svg(\?|$)/.test(id)) return '\0virtual:svg-mock'
    },
    load(id: string) {
      if (id === '\0virtual:svg-react-mock')
        return 'import React from "react"; export default (props) => React.createElement("svg", props)'
      if (id === '\0virtual:svg-mock') return 'export default "/mock.svg"'
    },
  },
  {
    // vite-imagetools isn't run in unit tests, so mock its `as=picture` output
    // ({ sources, img }) — otherwise the import resolves to a bare URL string.
    name: 'imagetools-mock',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (/[?&]as=picture/.test(id)) return '\0virtual:imagetools-picture-mock'
    },
    load(id: string) {
      if (id === '\0virtual:imagetools-picture-mock')
        return 'export default { sources: { avif: "/mock.avif", webp: "/mock.webp" }, img: { src: "/mock.png", w: 1, h: 1 } }'
    },
  },
]

export default defineConfig({
  resolve: {
    alias: [
      { find: /^msw$/, replacement: resolve(__dirname, 'node_modules/msw') },
      { find: 'src', replacement: resolve(__dirname, './src') },
      { find: 'packages', replacement: resolve(__dirname, '../../packages') },
    ],
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/*.stories.*',
        '**/*.mdx',
        'src/assets/**/*',
        'build/**/*',
        'dist/**/*',
        'public/**/*',
        '.storybook/**/*',
        'storybook-static/**/*',
        '.claude/**/*',
        '**/__mocks__/**',
        '**/*.e2e.{ts,tsx}',
        'src/test/e2e/**',
        'src/pages/**/+Page.{ts,tsx,js,jsx}',
        'src/pages/**/+config.{ts,tsx,js,jsx}',
      ],
    },
    projects: [
      {
        resolve: {
          alias: [
            { find: /^msw$/, replacement: resolve(__dirname, 'node_modules/msw') },
            { find: 'src', replacement: resolve(__dirname, './src') },
            { find: 'packages', replacement: resolve(__dirname, '../../packages') },
          ],
        },
        plugins: mockPlugins,
        test: {
          globals: true,
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/setupTests.ts'],
          include: ['**/*.{test,spec}.@(js|jsx|ts|tsx)'],
          exclude: [
            '**/*.stories.*',
            '**/*.mdx',
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/public/**',
            '**/e2e/**',
            // Browser-mode specs run in the `unit-browser` project, not jsdom
            '**/*.browser.test.*',
            '.claude/**',
          ],
        },
      },
      {
        // Real-browser tier: specs that need a layout engine and real pointer
        // events jsdom can't provide (e.g. the imperative D3 graph). Only
        // *.browser.test.* files run here, in headless Chromium.
        extends: true,
        plugins: mockPlugins,
        test: {
          name: 'unit-browser',
          setupFiles: ['./src/setupTests.browser.ts'],
          include: ['**/*.browser.test.@(ts|tsx)'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: resolve(__dirname, '.storybook'),
            ...(process.env.SB_URL ? { storybookUrl: process.env.SB_URL } : {}),
          }),
        ],
        optimizeDeps: {
          include: ['@tanstack/react-query'],
        },
        test: {
          name: 'storybook',
          setupFiles: ['.storybook/vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
})
