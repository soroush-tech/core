import { describe, it, expect } from 'vitest'
import type { InsertAction, LinePrefixAction, WrapAction } from '../const'
import { codeBlockAction } from '../const'
import { applyAction } from './applyAction'

const bold: WrapAction = {
  id: 'bold',
  label: 'B',
  ariaLabel: 'Bold',
  kind: 'wrap',
  prefix: '**',
  suffix: '**',
  placeholder: 'bold text',
}

const bullet: LinePrefixAction = {
  id: 'ul',
  label: 'List',
  ariaLabel: 'Bulleted list',
  kind: 'linePrefix',
  linePrefix: '- ',
}

const rule: InsertAction = {
  id: 'hr',
  label: 'HR',
  ariaLabel: 'Horizontal rule',
  kind: 'insert',
  snippet: '---',
}

describe('applyAction', () => {
  describe('wrap', () => {
    it('wraps the current selection and keeps it selected', () => {
      const result = applyAction(bold, { value: 'hello world', selectionStart: 0, selectionEnd: 5 })
      expect(result).toEqual({ value: '**hello** world', selectionStart: 2, selectionEnd: 7 })
    })

    it('inserts the placeholder when nothing is selected', () => {
      const result = applyAction(bold, { value: '', selectionStart: 0, selectionEnd: 0 })
      expect(result).toEqual({ value: '**bold text**', selectionStart: 2, selectionEnd: 11 })
    })

    it('moves the selection padding outside the markers so they hug the text', () => {
      const result = applyAction(bold, { value: 'Cell ', selectionStart: 0, selectionEnd: 5 })
      expect(result).toEqual({ value: '**Cell** ', selectionStart: 2, selectionEnd: 6 })
    })

    it('keeps a multi-space leading pad outside the markers', () => {
      const result = applyAction(bold, { value: '  hi', selectionStart: 0, selectionEnd: 4 })
      expect(result).toEqual({ value: '  **hi**', selectionStart: 4, selectionEnd: 6 })
    })

    it('inserts separating spaces when the token butts against neighbouring text', () => {
      const result = applyAction(bold, { value: 'aCellb', selectionStart: 1, selectionEnd: 5 })
      expect(result).toEqual({ value: 'a **Cell** b', selectionStart: 4, selectionEnd: 8 })
    })

    it('does not add a space where the neighbour is already whitespace', () => {
      const result = applyAction(bold, { value: 'a hi', selectionStart: 2, selectionEnd: 4 })
      expect(result).toEqual({ value: 'a **hi**', selectionStart: 4, selectionEnd: 6 })
    })

    it('nests inside another mark without inserting separating spaces', () => {
      const italic: WrapAction = { ...bold, prefix: '_', suffix: '_' }
      const result = applyAction(italic, { value: '**text**', selectionStart: 2, selectionEnd: 6 })
      expect(result).toEqual({ value: '**_text_**', selectionStart: 3, selectionEnd: 7 })
    })
  })

  describe('wrap toggle', () => {
    it('removes the markers when they are inside the selection', () => {
      const result = applyAction(bold, { value: '**bold**', selectionStart: 0, selectionEnd: 8 })
      expect(result).toEqual({ value: 'bold', selectionStart: 0, selectionEnd: 4 })
    })

    it('removes the markers when they sit just outside the selection', () => {
      const result = applyAction(bold, { value: '**bold**', selectionStart: 2, selectionEnd: 6 })
      expect(result).toEqual({ value: 'bold', selectionStart: 0, selectionEnd: 4 })
    })

    it('drops an untouched placeholder entirely when toggled from inside the selection', () => {
      const result = applyAction(bold, {
        value: '**bold text**',
        selectionStart: 0,
        selectionEnd: 13,
      })
      expect(result).toEqual({ value: '', selectionStart: 0, selectionEnd: 0 })
    })

    it('drops an untouched placeholder entirely when toggled from outside the selection', () => {
      const result = applyAction(bold, {
        value: '**bold text**',
        selectionStart: 2,
        selectionEnd: 11,
      })
      expect(result).toEqual({ value: '', selectionStart: 0, selectionEnd: 0 })
    })

    it('wraps (does not toggle) when only the opening marker is present', () => {
      const result = applyAction(bold, { value: '**hi', selectionStart: 0, selectionEnd: 4 })
      expect(result).toEqual({ value: '****hi**', selectionStart: 2, selectionEnd: 6 })
    })

    it('wraps (does not toggle) when the trailing marker is missing outside', () => {
      const result = applyAction(bold, { value: '**ab', selectionStart: 2, selectionEnd: 4 })
      expect(result).toEqual({ value: '****ab**', selectionStart: 4, selectionEnd: 6 })
    })
  })

  describe('code block', () => {
    const code = codeBlockAction('html')

    it('inserts a fenced block with the placeholder at the document edge', () => {
      const result = applyAction(code, { value: '', selectionStart: 0, selectionEnd: 0 })
      expect(result).toEqual({ value: '```html\ncode\n```', selectionStart: 8, selectionEnd: 12 })
    })

    it('adds a line break on both sides when inserted mid-text', () => {
      const result = applyAction(code, { value: 'ab', selectionStart: 1, selectionEnd: 1 })
      expect(result.value).toBe('a\n```html\ncode\n```\nb')
    })

    it('does not add a leading break when the previous character is already a newline', () => {
      const result = applyAction(code, { value: 'a\nx', selectionStart: 2, selectionEnd: 3 })
      expect(result.value).toBe('a\n```html\nx\n```')
    })

    it('does not add a trailing break when the next character is already a newline', () => {
      const result = applyAction(code, { value: 'x\ny', selectionStart: 0, selectionEnd: 1 })
      expect(result.value).toBe('```html\nx\n```\ny')
    })
  })

  describe('linePrefix', () => {
    it('prefixes a single line and selects it', () => {
      const result = applyAction(bullet, { value: 'hello', selectionStart: 0, selectionEnd: 0 })
      expect(result).toEqual({ value: '- hello', selectionStart: 0, selectionEnd: 7 })
    })

    it('prefixes every line the selection spans', () => {
      const result = applyAction(bullet, { value: 'a\nb', selectionStart: 0, selectionEnd: 3 })
      expect(result).toEqual({ value: '- a\n- b', selectionStart: 0, selectionEnd: 7 })
    })

    it('only prefixes the caret line when the selection ends mid-document', () => {
      const result = applyAction(bullet, { value: 'a\nb', selectionStart: 0, selectionEnd: 0 })
      expect(result).toEqual({ value: '- a\nb', selectionStart: 0, selectionEnd: 3 })
    })

    it('prefixes the empty first line when the document starts with a newline', () => {
      const result = applyAction(bullet, { value: '\nfoo', selectionStart: 0, selectionEnd: 0 })
      expect(result).toEqual({ value: '- \nfoo', selectionStart: 0, selectionEnd: 2 })
    })

    it('prefixes only the second line when the caret sits on it', () => {
      const result = applyAction(bullet, { value: 'a\nb', selectionStart: 2, selectionEnd: 3 })
      expect(result).toEqual({ value: 'a\n- b', selectionStart: 2, selectionEnd: 5 })
    })
  })

  describe('linePrefix family (toggle / replace)', () => {
    const LIST = /^(?:- \[[ xX]\] |- |\d+\. )/
    const listBullet: LinePrefixAction = { ...bullet, family: LIST }
    const listOrdered: LinePrefixAction = {
      id: 'ol',
      label: 'O',
      ariaLabel: 'Numbered list',
      kind: 'linePrefix',
      linePrefix: '1. ',
      family: LIST,
    }
    const at = (value: string) => ({ value, selectionStart: 0, selectionEnd: 0 })

    it('adds its marker to a plain line', () => {
      expect(applyAction(listBullet, at('text')).value).toBe('- text')
    })

    it('toggles its own marker off', () => {
      expect(applyAction(listBullet, at('- text')).value).toBe('text')
    })

    it('replaces a sibling marker (bullet → ordered)', () => {
      expect(applyAction(listOrdered, at('- text')).value).toBe('1. text')
    })

    it('replaces a numbered marker (ordered → bullet)', () => {
      expect(applyAction(listBullet, at('1. text')).value).toBe('- text')
    })

    it('recognises a task marker as a sibling', () => {
      expect(applyAction(listBullet, at('- [ ] text')).value).toBe('- text')
    })

    it('applies per line across a multi-line selection', () => {
      const result = applyAction(listBullet, {
        value: '- a\n- b',
        selectionStart: 0,
        selectionEnd: 7,
      })
      expect(result.value).toBe('a\nb')
    })
  })

  describe('linePrefix replace-only family (headings)', () => {
    const HEADING = /^#{1,6} /
    const h2: LinePrefixAction = {
      id: 'h2',
      label: 'H2',
      ariaLabel: 'Heading 2',
      kind: 'linePrefix',
      linePrefix: '## ',
      family: HEADING,
      toggle: false,
    }
    const h4: LinePrefixAction = { ...h2, id: 'h4', linePrefix: '#### ' }
    const at = (value: string) => ({ value, selectionStart: 0, selectionEnd: 0 })

    it('replaces a different heading level', () => {
      expect(applyAction(h4, at('## title')).value).toBe('#### title')
    })

    it('keeps (does not toggle off) when the same level is re-applied', () => {
      expect(applyAction(h2, at('## title')).value).toBe('## title')
    })
  })

  describe('insert', () => {
    it('inserts the snippet at the caret', () => {
      const result = applyAction(rule, { value: 'ab', selectionStart: 1, selectionEnd: 1 })
      expect(result).toEqual({ value: 'a---b', selectionStart: 4, selectionEnd: 4 })
    })

    it('replaces the selection with the snippet', () => {
      const result = applyAction(rule, { value: 'ab', selectionStart: 0, selectionEnd: 2 })
      expect(result).toEqual({ value: '---', selectionStart: 3, selectionEnd: 3 })
    })

    it('inserts after the enclosing code fence instead of nesting inside it', () => {
      // Caret sits inside the `graph TD` line of a mermaid fence.
      const value = '```mermaid\ngraph TD\n```'
      const result = applyAction(rule, { value, selectionStart: 15, selectionEnd: 15 })
      expect(result).toEqual({
        value: '```mermaid\ngraph TD\n```---',
        selectionStart: 26,
        selectionEnd: 26,
      })
    })

    it('inserts at the caret when it sits outside any fence', () => {
      // A fence exists earlier, but the caret is in the text after it.
      const value = '```js\nx\n```\nafter'
      const result = applyAction(rule, { value, selectionStart: 14, selectionEnd: 14 })
      expect(result.value).toBe('```js\nx\n```\naf---ter')
    })
  })
})
