import { describe, expect, it } from 'vitest'
import { css, get, responsive } from './css'

describe('css get', () => {
  it('reads dotted paths and falls back', () => {
    expect(get({ a: { b: 2 } }, 'a.b')).toBe(2)
    expect(get({ a: null }, 'a.b', 'x')).toBe('x')
  })
})

describe('responsive', () => {
  it('maps arrays to media queries, resolves functions, skips nulls and reuses blocks', () => {
    const out = responsive({
      color: ['red', null],
      margin: [0, 4],
      fn: (t) => t.color,
      skip: null,
      raw: 'static',
    })({ color: 'blue' })
    expect(out).toEqual({
      color: 'red',
      margin: 0,
      fn: 'blue',
      raw: 'static',
      '@media screen and (min-width: 40em)': { margin: 4 },
    })
  })
})

describe('css', () => {
  it('resolves aliases, scales, multiples and raw props', () => {
    const theme = { colors: { primary: '#0cf' }, space: [0, 4, 8, 16] }
    expect(css({ color: 'primary', mx: 2, p: 'auto', display: 'flex' })(theme)).toEqual({
      color: '#0cf',
      marginLeft: 8,
      marginRight: 8,
      padding: 'auto',
      display: 'flex',
    })
  })

  it('handles negative margins against numeric and string scales', () => {
    expect(css({ mt: -1, mb: 'auto' })({ space: [0, '2rem'] })).toEqual({
      marginTop: '-2rem',
      marginBottom: 'auto',
    })
    expect(css({ ml: -2 })({ space: [0, 4, 8] })).toEqual({ marginLeft: -8 })
  })

  it('resolves variant keys, nested objects, function args and props.theme', () => {
    const theme = {
      colors: { primary: '#0cf' },
      buttons: { primary: { color: 'primary', '&:hover': { color: 'primary' } } },
    }
    expect(css(() => ({ variant: 'buttons.primary', bg: 'primary' }))({ theme })).toEqual({
      color: '#0cf',
      '&:hover': { color: '#0cf' },
      backgroundColor: '#0cf',
    })
  })

  it('resolves nested function values', () => {
    expect(css({ width: () => () => '50%' })({})).toEqual({ width: '50%' })
  })

  it('resolves textDecorationColor through the colors scale', () => {
    expect(css({ textDecorationColor: 'primary' })({ colors: { primary: '#0cf' } })).toEqual({
      textDecorationColor: '#0cf',
    })
  })
})
