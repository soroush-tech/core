import type { Config } from 'vike/types'

export default {
  title: 'ai-watermark-guard',
  description:
    'A Rust binary that finds the characters marking text as machine-written - em dashes, curly quotes, ellipses - plus invisible characters and mojibake. A 1,600-file repository in about 100ms, across files and commit messages.',
} satisfies Config
