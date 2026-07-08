import ReactMarkdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Image } from 'src/theme/Image'
import { Link } from 'src/theme/Link'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from 'src/theme/Table'
import { Typography } from 'src/theme/Typography'
import { View } from 'src/theme/View'
import { Blockquote } from 'src/common/Blockquote'
import { CodeBlock } from './CodeBlock'

const remarkPlugins: Options['remarkPlugins'] = [remarkGfm]
// `ignoreMissing` keeps unknown fence languages from throwing — they render unhighlighted.
const rehypePlugins: Options['rehypePlugins'] = [[rehypeHighlight, { ignoreMissing: true }]]

const components: Components = {
  h1: ({ children }) => (
    <Typography mt={2} variant="h1" color="primary" gutterBottom>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography mt={2} variant="h2" color="primary" gutterBottom>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography mt={2} variant="h3" color="primary" gutterBottom>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography mt={2} variant="h4" gutterBottom>
      {children}
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography mt={2} variant="h5" gutterBottom>
      {children}
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography mt={2} variant="h6" gutterBottom>
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography variant="body1" color="secondary" gutterBottom lineHeight="loose">
      {children}
    </Typography>
  ),
  a: ({ href, children }) => (
    <Link href={href} underline="hover">
      {children}
    </Link>
  ),
  strong: ({ children }) => (
    <Typography as="strong" variant="inherit" fontWeight="extraBold">
      {children}
    </Typography>
  ),
  em: ({ children }) => (
    <Typography as="em" variant="inherit" fontStyle="italic">
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <View as="ul" pl={3} mb={2}>
      {children}
    </View>
  ),
  ol: ({ children }) => (
    <View as="ol" pl={3} mb={2}>
      {children}
    </View>
  ),
  li: ({ children }) => (
    <Typography as="li" color="secondary" variant="body1" gutterBottom>
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <Blockquote as="blockquote" pl={3} py={1} my={2}>
      {children}
    </Blockquote>
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
      >
        {children}
      </Typography>
    )
  },
  pre: ({ children }) => (
    <CodeBlock
      as="pre"
      bg="terminal"
      p={3}
      my={2}
      borderRadius="md"
      borderColor="light"
      borderWidth="thin"
      overflow="auto"
    >
      {children}
    </CodeBlock>
  ),
  table: ({ children }) => (
    <TableContainer my={2}>
      <Table bg="terminal" borderRadius="md">
        {children}
      </Table>
    </TableContainer>
  ),
  thead: ({ children }) => <TableHead color="primary">{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow isHoverable>{children}</TableRow>,
  // th vs td is resolved from the enclosing section via TableSectionContext; the
  // GFM column alignment arrives as an inline `style` and overrides the default.
  th: ({ children, style }) => <TableCell style={style}>{children}</TableCell>,
  td: ({ children, style }) => <TableCell style={style}>{children}</TableCell>,
  hr: () => <View as="hr" my={2} height="1px" bg="grid" width="100%" border="none" />,
  img: ({ src, alt }) => <Image src={src} alt={alt} maxWidth="100%" />,
}

export interface MarkdownProps {
  children: string
}

/** Renders a markdown string with every element mapped to a design-system primitive. */
export function Markdown({ children }: Readonly<MarkdownProps>) {
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
    >
      {children}
    </ReactMarkdown>
  )
}
