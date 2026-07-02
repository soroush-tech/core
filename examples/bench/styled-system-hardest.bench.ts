// The hardest path styled-system runs: compose EVERY category parser and apply
// it to a maximal, fully-responsive props object. Array values force each parser
// to emit per-breakpoint media queries, and composing all ten categories makes
// every prop resolve against the theme in a single pass — the heaviest realistic
// call the library performs.
//
// Both sides come from npm (installed under aliases inside the sandbox), so the
// comparison is like-for-like prebuilt dist:
//
//   @soroush.tech/styled-system@5.2.0  vs  styled-system@5.1.5
//
//   soroush-bench ./examples/bench/styled-system-hardest.bench.ts
import defineBench from '@soroush.tech/bench'

// A theme rich enough that every category has real tokens to look up.
const theme = {
  breakpoints: ['40em', '52em', '64em'],
  space: [0, 4, 8, 16, 32, 64, 128, 256],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  sizes: [16, 32, 64, 128, 256, 512],
  colors: {
    primary: '#0070f3',
    secondary: '#7928ca',
    muted: '#f6f6f6',
    text: '#111111',
    background: '#ffffff',
  },
  fonts: { body: 'system-ui, sans-serif', heading: 'Georgia, serif' },
  fontWeights: { body: 400, heading: 700 },
  lineHeights: { body: 1.5, heading: 1.25 },
  letterSpacings: { normal: 'normal', caps: '0.2em' },
  borders: [0, '1px solid', '2px solid'],
  borderWidths: [0, 1, 2, 4],
  radii: [0, 2, 4, 8, 16],
  shadows: { small: '0 1px 2px rgba(0,0,0,.2)', large: '0 8px 24px rgba(0,0,0,.3)' },
  zIndices: [0, 10, 100, 1000],
}

// One prop from (nearly) every category, most as responsive arrays so each
// breakpoint multiplies the work.
const props = {
  theme,
  // space
  m: [1, 2, 3, 4],
  mt: [0, 1, 2],
  mx: [2, 3],
  p: [4, 3, 2, 1],
  py: [1, 2, 3],
  // color
  color: ['text', 'primary', 'secondary'],
  bg: ['background', 'muted'],
  opacity: [1, 0.9, 0.8],
  // layout
  width: [1, 1 / 2, 1 / 3, 1 / 4],
  height: [64, 128, 256],
  display: ['block', 'flex'],
  minWidth: [16, 32],
  maxWidth: [256, 512],
  overflow: ['hidden', 'auto'],
  // typography
  fontSize: [0, 1, 2, 3],
  fontWeight: ['body', 'heading'],
  lineHeight: ['body', 'heading'],
  fontFamily: 'body',
  letterSpacing: ['normal', 'caps'],
  textAlign: ['left', 'center'],
  // flexbox
  alignItems: ['flex-start', 'center'],
  justifyContent: ['space-between', 'center'],
  flexDirection: ['row', 'column'],
  flexWrap: 'wrap',
  flex: ['1 1 auto', 'none'],
  // grid
  gridGap: [1, 2, 3],
  gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr 1fr'],
  gridAutoFlow: 'row',
  // background
  backgroundImage: 'url(x.png)',
  backgroundSize: ['cover', 'contain'],
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  // border
  border: [1, 2],
  borderColor: ['primary', 'secondary'],
  borderRadius: [1, 2, 3],
  borderWidth: [1, 2],
  // position
  position: ['relative', 'absolute'],
  top: [0, 1],
  left: [0, 1],
  zIndex: [1, 2, 3],
  // shadow
  boxShadow: ['small', 'large'],
  textShadow: 'small',
}

// Every category styled-system v5 exposes as a composable parser.
const CATEGORIES = [
  'space',
  'color',
  'layout',
  'typography',
  'flexbox',
  'grid',
  'background',
  'border',
  'position',
  'shadow',
]

// Build the composed parser once per module (compose() cost is setup, not the
// job under test); each measured call is a single parse of the maximal props.
const cache = new WeakMap()
const hardestParser = (mod) => {
  let parser = cache.get(mod)
  if (!parser) {
    const fns = CATEGORIES.map((name) => mod[name]).filter((fn) => typeof fn === 'function')
    parser = mod.compose(...fns)
    cache.set(mod, parser)
  }
  return parser
}

export default defineBench({
  name: 'styled-system',
  packages: {
    soroush: '@soroush.tech/styled-system@5.2.0',
    jxnblk: 'styled-system@5.1.5',
  },
  cases: {
    'TS styled 5.2.0 new': ({ modules }) => hardestParser(modules.soroush)(props),
    'JS styled 5.1.5 leg': ({ modules }) => hardestParser(modules.jxnblk)(props),
  },
  // Baked-in run defaults (any CLI flag still overrides these):
  //   gc('inner') → per-iter GC-timing row · rounds → median-of-N · warmup → JIT.
  options: {
    gc: 'inner',
    rounds: 1,
    warmup: 1000,
  },
})
