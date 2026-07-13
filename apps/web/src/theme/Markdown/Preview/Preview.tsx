import { useMemo } from 'react'
import ReactMarkdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { styled } from 'src/theme'
import { Quote, type QuoteProps } from 'src/theme/Quote'
import { Checkbox, type CheckboxProps } from 'src/theme/Checkbox'
import { Image, type ImageProps } from 'src/theme/Image'
import { Link, type LinkProps } from 'src/theme/Link'
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
} from 'src/theme/Table'
import { Typography, type TypographyProps } from 'src/theme/Typography'
import { View, type ViewProps } from 'src/theme/View'
import { CodeBlock, type CodeBlockProps } from 'src/theme/CodeBlock'

const remarkPlugins: Options['remarkPlugins'] = [remarkGfm]
// `ignoreMissing` keeps unknown fence languages from throwing — they render unhighlighted.
const rehypePlugins: Options['rehypePlugins'] = [[rehypeHighlight, { ignoreMissing: true }]]

// Keeps the content within its (flex-item) column on narrow viewports: shrink to fit,
// never exceed the container, and break long URLs/tokens instead of overflowing. Wide
// code blocks and tables keep their own horizontal scroll.
const PreviewRoot = styled(View, { label: 'MarkdownPreview' })({
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

const buildComponents = (slotProps: PreviewSlotProps): Components => ({
  h1: ({ children }) => (
    <Typography mt={2} variant="h1" color="primary" gutterBottom {...slotProps.h1}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography mt={2} variant="h2" color="primary" gutterBottom {...slotProps.h2}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography mt={2} variant="h3" color="primary" gutterBottom {...slotProps.h3}>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography mt={2} variant="h4" gutterBottom {...slotProps.h4}>
      {children}
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography mt={2} variant="h5" gutterBottom {...slotProps.h5}>
      {children}
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography mt={2} variant="h6" gutterBottom {...slotProps.h6}>
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography variant="body1" color="secondary" mb={2} lineHeight="relaxed" {...slotProps.p}>
      {children}
    </Typography>
  ),
  a: ({ href, children }) => (
    <Link href={href} underline="hover" {...slotProps.a}>
      {children}
    </Link>
  ),
  strong: ({ children }) => (
    <Typography as="strong" variant="inherit" fontWeight="extraBold" {...slotProps.strong}>
      {children}
    </Typography>
  ),
  em: ({ children }) => (
    <Typography as="em" variant="inherit" fontStyle="italic" {...slotProps.em}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <View as="ul" pl={3} mb={2} {...slotProps.ul}>
      {children}
    </View>
  ),
  ol: ({ children }) => (
    <View as="ol" pl={3} mb={2} {...slotProps.ol}>
      {children}
    </View>
  ),
  li: ({ children, className }) => (
    <Typography
      as="li"
      color="secondary"
      lineHeight="base"
      variant="body1"
      gutterBottom
      // GFM task-list items carry their own checkbox, so drop the list marker.
      style={className?.includes('task-list-item') ? { listStyleType: 'none' } : undefined}
      {...slotProps.li}
    >
      {children}
    </Typography>
  ),
  // GFM task-list checkbox — the theme Checkbox, read-only (disabled) and brand-coloured.
  input: ({ checked }) => (
    <Checkbox
      checked={Boolean(checked)}
      disabled
      color="primary"
      size="sm"
      aria-label="Task item"
      mr={1}
      {...slotProps.input}
    />
  ),
  blockquote: ({ children }) => (
    <Quote as="blockquote" pl={3} py={1} my={2} {...slotProps.blockquote}>
      {children}
    </Quote>
  ),
  code: ({ className, children }) => {
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
        {...slotProps.code}
      >
        {children}
      </Typography>
    )
  },
  pre: ({ children }) => <CodeBlock {...slotProps.pre}>{children}</CodeBlock>,
  table: ({ children }) => (
    <TableContainer my={2}>
      <Table bg="terminal" borderRadius="md" {...slotProps.table}>
        {children}
      </Table>
    </TableContainer>
  ),
  thead: ({ children }) => (
    <TableHead bg="grid" color="primary" {...slotProps.thead}>
      {children}
    </TableHead>
  ),
  tbody: ({ children }) => <TableBody {...slotProps.tbody}>{children}</TableBody>,
  tr: ({ children }) => (
    <TableRow isHoverable {...slotProps.tr}>
      {children}
    </TableRow>
  ),
  // th vs td is resolved from the enclosing section via TableSectionContext; the
  // GFM column alignment arrives as an inline `style` and overrides the default.
  th: ({ children, style }) => (
    <TableCell style={style} {...slotProps.th}>
      {children}
    </TableCell>
  ),
  td: ({ children, style }) => (
    <TableCell style={style} {...slotProps.td}>
      {children}
    </TableCell>
  ),
  hr: () => (
    <View as="hr" my={2} height="1px" bg="grid" width="100%" border="none" {...slotProps.hr} />
  ),
  img: ({ src, alt }) => <Image src={src} alt={alt} maxWidth="100%" {...slotProps.img} />,
})

export interface PreviewProps {
  /** The markdown source to render. */
  children: string
  /** Per-element prop overrides, merged over the defaults. */
  slotProps?: PreviewSlotProps
}

/** Renders a markdown string with every element mapped to a design-system primitive. */
export function Preview({ children, slotProps }: Readonly<PreviewProps>) {
  const components = useMemo(() => buildComponents(slotProps ?? {}), [slotProps])
  return (
    <PreviewRoot>
      <ReactMarkdown
        components={components}
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {children}
      </ReactMarkdown>
    </PreviewRoot>
  )
}
