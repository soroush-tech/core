import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    space: 'src/space/index.ts',
    color: 'src/color/index.ts',
    layout: 'src/layout/index.ts',
    typography: 'src/typography/index.ts',
    flexbox: 'src/flexbox/index.ts',
    grid: 'src/grid/index.ts',
    background: 'src/background/index.ts',
    border: 'src/border/index.ts',
    position: 'src/position/index.ts',
    shadow: 'src/shadow/index.ts',
    variant: 'src/variant/index.ts',
    css: 'src/css/index.ts',
    'theme-get': 'src/theme-get/index.ts',
    props: 'src/props/index.ts',
    'prop-types': 'src/prop-types/index.ts',
    'should-forward-prop': 'src/should-forward-prop/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
