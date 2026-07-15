import { createContext, useContext, type ReactNode } from 'react'
import ReactMarkdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { styled } from '../../index'
import { Quote, type QuoteProps } from '../../Quote'
import { Checkbox, type CheckboxProps } from '../../Checkbox'
import { Image, type ImageProps } from '../../Image'
import { Link, type LinkProps } from '../../Link'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  type TableBodyProps,
  type TableCellProps,
  type TableHeadProps,
  type TableProps,
  type TableRowProps,
} from '../../Table'
import { Typography, type TypographyProps } from '../../Typography'
import { View, type ViewProps } from '../../View'
import { CodeBlock, type CodeBlockProps } from '../../CodeBlock'

const remarkPlugins: Options['remarkPlugins'] = [remarkGfm]
// `ignoreMissing` keeps unknown fence languages from throwing — they render unhighlighted.
const rehypePlugins: Options['rehypePlugins'] = [[rehypeHighlight, { ignoreMissing: true }]]

// Keeps the content within its (flex-item) column on narrow viewports: shrink to fit,
// never exceed the container, and break long URLs/tokens instead of overflowing. Wide
// code blocks and tables keep their own horizontal scroll.
const PreviewRoot = styled(View, { name: 'MarkdownPreview', label: 'MarkdownPreview' })({
  minWidth: 0,
  maxWidth: '100%',
  overflowWrap: 'break-word',
})

/**
 * Per-element prop overrides, merged over the design-system defaults (the caller's props win).
 * Keyed by markdown element — e.g. `slotProps={{ p: { color: 'primary' }, h1: { variant: 'h2' } }}`.
 */
export interface PreviewSlotProps {
  h1?: TypographyProps
  h2?: TypographyProps
  h3?: TypographyProps
  h4?: TypographyProps
  h5?: TypographyProps
  h6?: TypographyProps
  p?: TypographyProps
  strong?: TypographyProps
  em?: TypographyProps
  li?: TypographyProps
  code?: TypographyProps
  a?: LinkProps
  ul?: ViewProps
  ol?: ViewProps
  hr?: ViewProps
  blockquote?: QuoteProps
  img?: ImageProps
  th?: TableCellProps
  td?: TableCellProps
  pre?: CodeBlockProps
  input?: CheckboxProps
  table?: TableProps
  thead?: TableHeadProps
  tbody?: TableBodyProps
  tr?: TableRowProps
}

const EMPTY_SLOT_PROPS: PreviewSlotProps = {}

// react-markdown treats a new component reference as a new element type and remounts the whole
// subtree, so the `components` map must be module-static. Each element therefore reads the
// current slotProps from context instead of closing over a per-render object.
const SlotPropsContext = createContext<PreviewSlotProps>(EMPTY_SLOT_PROPS)

function slotted<P>(render: (slotProps: PreviewSlotProps, props: P) => ReactNode) {
  function Slotted(props: P) {
    return render(useContext(SlotPropsContext), props)
  }
  return Slotted
}

const components: Components = {
  h1: slotted(({ h1 }, { children }) => (
    <Typography mt={2} variant="h1" color="primary" gutterBottom {...h1}>
      {children}
    </Typography>
  )),
  h2: slotted(({ h2 }, { children }) => (
    <Typography mt={2} variant="h2" color="primary" gutterBottom {...h2}>
      {children}
    </Typography>
  )),
  h3: slotted(({ h3 }, { children }) => (
    <Typography mt={2} variant="h3" color="primary" gutterBottom {...h3}>
      {children}
    </Typography>
  )),
  h4: slotted(({ h4 }, { children }) => (
    <Typography mt={2} variant="h4" gutterBottom {...h4}>
      {children}
    </Typography>
  )),
  h5: slotted(({ h5 }, { children }) => (
    <Typography mt={2} variant="h5" gutterBottom {...h5}>
      {children}
    </Typography>
  )),
  h6: slotted(({ h6 }, { children }) => (
    <Typography mt={2} variant="h6" gutterBottom {...h6}>
      {children}
    </Typography>
  )),
  p: slotted(({ p }, { children }) => (
    <Typography variant="body1" color="secondary" mb={2} lineHeight="relaxed" {...p}>
      {children}
    </Typography>
  )),
  a: slotted(({ a }, { href, children }) => (
    <Link href={href} underline="hover" {...a}>
      {children}
    </Link>
  )),
  strong: slotted(({ strong }, { children }) => (
    <Typography as="strong" variant="inherit" fontWeight="extraBold" {...strong}>
      {children}
    </Typography>
  )),
  em: slotted(({ em }, { children }) => (
    <Typography as="em" variant="inherit" fontStyle="italic" {...em}>
      {children}
    </Typography>
  )),
  ul: slotted(({ ul }, { children }) => (
    <View as="ul" pl={3} mb={2} {...ul}>
      {children}
    </View>
  )),
  ol: slotted(({ ol }, { children }) => (
    <View as="ol" pl={3} mb={2} {...ol}>
      {children}
    </View>
  )),
  li: slotted(({ li }, { children, className }) => (
    <Typography
      as="li"
      color="secondary"
      lineHeight="base"
      variant="body1"
      gutterBottom
      // GFM task-list items carry their own checkbox, so drop the list marker.
      style={className?.includes('task-list-item') ? { listStyleType: 'none' } : undefined}
      {...li}
    >
      {children}
    </Typography>
  )),
  // GFM task-list checkbox — the theme Checkbox, read-only (disabled) and brand-coloured.
  input: slotted(({ input }, { checked }) => (
    <Checkbox
      checked={Boolean(checked)}
      disabled
      color="primary"
      size="sm"
      aria-label="Task item"
      mr={1}
      {...input}
    />
  )),
  blockquote: slotted(({ blockquote }, { children }) => (
    <Quote as="blockquote" pl={3} py={1} my={2} {...blockquote}>
      {children}
    </Quote>
  )),
  code: slotted(({ code }, { className, children }) => {
    const isBlock = (className ?? '').includes('language-')
    return (
      <Typography
        as="code"
        color="initial"
        variant="inherit"
        fontFamily="mono"
        display={isBlock ? 'block' : 'inline'}
        bg={isBlock ? 'transparent' : 'paper'}
        px={isBlock ? 0 : 1}
        borderRadius="sm"
        {...code}
      >
        {children}
      </Typography>
    )
  }),
  pre: slotted(({ pre }, { children }) => <CodeBlock {...pre}>{children}</CodeBlock>),
  table: slotted(({ table }, { children }) => (
    <TableContainer my={2}>
      <Table bg="terminal" borderRadius="md" {...table}>
        {children}
      </Table>
    </TableContainer>
  )),
  thead: slotted(({ thead }, { children }) => (
    <TableHead bg="grid" color="primary" {...thead}>
      {children}
    </TableHead>
  )),
  tbody: slotted(({ tbody }, { children }) => <TableBody {...tbody}>{children}</TableBody>),
  tr: slotted(({ tr }, { children }) => (
    <TableRow isHoverable {...tr}>
      {children}
    </TableRow>
  )),
  // th vs td is resolved from the enclosing section via TableSectionContext; the
  // GFM column alignment arrives as an inline `style` and overrides the default.
  th: slotted(({ th }, { children, style }) => (
    <TableCell style={style} {...th}>
      {children}
    </TableCell>
  )),
  td: slotted(({ td }, { children, style }) => (
    <TableCell style={style} {...td}>
      {children}
    </TableCell>
  )),
  hr: slotted(({ hr }) => (
    <View as="hr" my={2} height="1px" bg="grid" width="100%" border="none" {...hr} />
  )),
  img: slotted(({ img }, { src, alt }) => <Image src={src} alt={alt} maxWidth="100%" {...img} />),
}

export interface PreviewProps {
  /** The markdown source to render. */
  children: string
  /** Per-element prop overrides, merged over the defaults. */
  slotProps?: PreviewSlotProps
}

/** Renders a markdown string with every element mapped to a design-system primitive. */
export function Preview({ children, slotProps }: Readonly<PreviewProps>) {
  return (
    <PreviewRoot>
      <SlotPropsContext.Provider value={slotProps ?? EMPTY_SLOT_PROPS}>
        <ReactMarkdown
          components={components}
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
        >
          {children}
        </ReactMarkdown>
      </SlotPropsContext.Provider>
    </PreviewRoot>
  )
}
