import { type IconName } from '@soroush.tech/design-system/Icon'

export const domains: Array<{ icon: IconName; title: string; body: string; stack: string }> = [
  {
    icon: 'language',
    title: 'WEB ECOSYSTEM',
    body: 'High-performance SSR applications using Next.js and optimized hydration strategies for sub-second LCP.',
    stack: 'Stack: React, Nest.js, Tailwind, WASM',
  },
  {
    icon: 'smartphone',
    title: 'MOBILE',
    body: 'Complex React Native deployments with bridge-less architecture and shared native modules for performance.',
    stack: 'Stack: React Native, Expo',
  },
  {
    icon: 'desktop_windows',
    title: 'DESKTOP RUNTIME',
    body: 'Electron and Tauri wrappers for deep OS integration while maintaining consistency with shared business logic.',
    stack: 'Stack: React, Electron, Node.js / Tauri, Rust',
  },
]
