import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

// One shared pipeline: HTML fragment → hast → mdast (GFM-aware) → markdown.
// `bullet: '-'` matches the toolbar's list style.
const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, { bullet: '-', fence: '`', rule: '-' })

/**
 * Serializes an edited block's live DOM back to markdown. The preview renders
 * non-content UI inside a block (the code-copy control, decorative SVGs) -
 * those are stripped from a clone first so only real content round-trips.
 */
export function blockToMarkdown(element: Element): string {
  const clone = element.cloneNode(true) as Element
  for (const junk of clone.querySelectorAll('.code-copy, button, svg')) junk.remove()
  return String(processor.processSync(clone.innerHTML)).trimEnd()
}
