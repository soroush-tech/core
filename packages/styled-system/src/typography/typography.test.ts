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
