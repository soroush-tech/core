import { expect, it } from 'vitest'
import { typography } from './typography'

it('resolves the font-size scale and passes raw props through', () => {
  expect(
    typography({
      fontSize: 2,
      fontStyle: 'italic',
      textTransform: 'uppercase',
      theme: { fontSizes: [12, 14, 16] },
    })
  ).toEqual({ fontSize: 16, fontStyle: 'italic', textTransform: 'uppercase' })
})

it('passes text-decoration props through and resolves textDecorationColor from the colors scale', () => {
  expect(
    typography({
      textAlignLast: 'center',
      textDecoration: 'underline dotted',
      textDecorationLine: 'underline',
      textDecorationStyle: 'wavy',
      textDecorationThickness: '2px',
      textDecorationColor: 'brand',
      theme: { colors: { brand: '#0af' } },
    })
  ).toEqual({
    textAlignLast: 'center',
    textDecoration: 'underline dotted',
    textDecorationLine: 'underline',
    textDecorationStyle: 'wavy',
    textDecorationThickness: '2px',
    textDecorationColor: '#0af',
  })
})

it('passes the text-flow props through and supports responsive values', () => {
  expect(
    typography({
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      theme: {},
    })
  ).toEqual({ whiteSpace: 'nowrap', textOverflow: 'ellipsis' })

  expect(
    typography({
      whiteSpace: ['normal', 'nowrap'],
      theme: { breakpoints: ['40em'] },
    })
  ).toEqual({
    whiteSpace: 'normal',
    '@media screen and (min-width: 40em)': { whiteSpace: 'nowrap' },
  })
})
