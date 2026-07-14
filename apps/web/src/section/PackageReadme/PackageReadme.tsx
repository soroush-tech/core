import { View } from '@soroush.tech/design-system/View'
import { Preview } from '@soroush.tech/design-system/Markdown'
import { stripReadmeChrome } from './utils'

export interface PackageReadmeProps {
  /** Raw README markdown for the package (imported with `?raw`). */
  readme: string
}

/**
 * Renders a package's README body as design-system markdown, in a Paper surface matching the
 * Article section. Strips the README's leading title and badge block first (see
 * `stripReadmeChrome`) so it reads as page content, not a repo file.
 */
export function PackageReadme({ readme }: Readonly<PackageReadmeProps>) {
  return (
    <View as="section" maxWidth="1280px" minWidth={0} mx="auto" p={4} mt={3} mb={4}>
      <Preview>{stripReadmeChrome(readme)}</Preview>
    </View>
  )
}
