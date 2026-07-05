import { View } from 'src/theme/View'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import { Button } from 'src/theme/Button'
import { Icon } from 'src/theme/Icon'
import { PageHeader } from 'src/common/PageHeader'
import { CommandSnippet } from 'src/common/CommandSnippet'

export interface PackageHeroProps {
  /** Full package name, e.g. `@soroush.tech/vite-plugin-msw-server`. */
  name: string
  /** One-line summary shown under the title. */
  tagline: string
  /** Install command rendered in the terminal block, e.g. `npm i -D @soroush.tech/…`. */
  install: string
  /** Link to the package's npm page. */
  npmUrl: string
  /** Link to the package's source directory. */
  repoUrl: string
}

/**
 * Prop-driven hero for a published npm package page: eyebrow, package name, tagline, a
 * copy-ready install command, and npm/source actions. Reused across every package page —
 * promote to `src/common/` once a second package page consumes it.
 */
export function PackageHero({
  name,
  tagline,
  install,
  npmUrl,
  repoUrl,
}: Readonly<PackageHeroProps>) {
  return (
    <PageHeader>
      <View height="1px" width="3rem" bg="primary" mb={4} />
      <Typography
        as="p"
        variant="caption"
        color="primary"
        fontFamily="mono"
        letterSpacing="widest"
        m={0}
        mb={3}
      >
        NPM_PACKAGE
      </Typography>
      <Typography
        variant="h1"
        as="h1"
        color="initial"
        fontFamily="heading"
        fontWeight="bold"
        letterSpacing="tighter"
        lineHeight="tight"
        mb={5}
        style={{ overflowWrap: 'anywhere' }}
      >
        {name}
      </Typography>
      <Typography variant="body1" color="secondary" lineHeight="relaxed" maxWidth="40rem" mb={6}>
        {tagline}
      </Typography>

      <CommandSnippet command={install} maxWidth="40rem" mb={8} />

      <Flex flexDirection="row" flexWrap="wrap" gap={4} mb={4}>
        <Button
          href={npmUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          size="lg"
          endIcon={<Icon name="external_link" color="inherit" size="1rem" />}
        >
          VIEW_ON_NPM
        </Button>
        <Button
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          color="primary"
          size="lg"
          endIcon={<Icon name="code" color="inherit" size="1rem" />}
        >
          SOURCE
        </Button>
      </Flex>
    </PageHeader>
  )
}
