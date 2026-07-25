import { describe, expect, it } from 'vitest'
import { blockToMarkdown } from './blockToMarkdown'

const toElement = (html: string): Element => {
  const element = document.createElement('div')
  element.innerHTML = html
  return element
}

describe('blockToMarkdown', () => {
  it('serializes headings, emphasis, links, and inline code', () => {
    expect(blockToMarkdown(toElement('<h2>A <strong>bold</strong> plan</h2>'))).toBe(
      '## A **bold** plan'
    )
    expect(
      blockToMarkdown(
        toElement('<p><em>soft</em> <a href="https://example.com">link</a> and <code>x</code></p>')
      )
    ).toBe('*soft* [link](https://example.com) and `x`')
  })

  it('serializes lists, task items, and blockquotes', () => {
    expect(blockToMarkdown(toElement('<ul><li>one</li><li>two</li></ul>'))).toBe('- one\n- two')
    expect(
      blockToMarkdown(
        toElement(
          '<ul><li><input type="checkbox" checked>done</li><li><input type="checkbox">open</li></ul>'
        )
      )
    ).toBe('- [x] done\n- [ ] open')
    expect(blockToMarkdown(toElement('<blockquote><p>quoted</p></blockquote>'))).toBe('> quoted')
  })

  it('serializes GFM tables', () => {
    const html =
      '<table><thead><tr><th>Name</th><th>Role</th></tr></thead>' +
      '<tbody><tr><td>Ada</td><td>Dev</td></tr></tbody></table>'
    expect(blockToMarkdown(toElement(html))).toBe(
      '| Name | Role |\n| ---- | ---- |\n| Ada  | Dev  |'
    )
  })

  it('keeps the fence language and drops highlight spans', () => {
    const html =
      '<pre><code class="hljs language-js"><span class="hljs-keyword">const</span> a = 1</code></pre>'
    expect(blockToMarkdown(toElement(html))).toBe('```js\nconst a = 1\n```')
  })

  it('strips the copy control and decorative UI before serializing', () => {
    const html =
      '<div><div class="code-copy"><button>Copy</button></div>' +
      '<pre><code class="language-ts">let x</code></pre></div>' +
      '<svg><title>decoration</title></svg>'
    expect(blockToMarkdown(toElement(html))).toBe('```ts\nlet x\n```')
  })

  it('turns paragraph splits into blank-line separated markdown', () => {
    expect(blockToMarkdown(toElement('<p>first</p><p>second</p>'))).toBe('first\n\nsecond')
  })

  it('serializes plain text nodes typed into an empty block', () => {
    expect(blockToMarkdown(toElement('hello world'))).toBe('hello world')
  })
})
