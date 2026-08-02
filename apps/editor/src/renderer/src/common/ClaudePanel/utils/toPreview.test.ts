import { PREVIEW_LIMIT, toPreview } from './toPreview'

describe('toPreview', () => {
  it('shows short text as it is', () => {
    expect(toPreview('# A heading')).toBe('# A heading')
  })

  it('flattens the markdown onto one line', () => {
    expect(toPreview('# A heading\n\n    indented\tbody')).toBe('# A heading indented body')
  })

  it('cuts off anything longer, marking that it goes on', () => {
    expect(toPreview('x'.repeat(PREVIEW_LIMIT + 30))).toBe(`${'x'.repeat(PREVIEW_LIMIT)}…`)
  })

  it.each([
    ['nothing at all', ''],
    ['only whitespace', '  \n\t '],
  ])('has nothing to show for %s', (_name, text) => {
    expect(toPreview(text)).toBe('')
  })
})
