import { Layout } from 'src/common/Layout'
import { PackageHero } from 'src/section/PackageHero'
import { PackageReadme } from 'src/section/PackageReadme'
// The README lives with the package; import it as a raw string via the `packages` alias.
import readme from 'packages/playwright-coverage/README.md?raw'
import { hero } from './playwright-coverage.data'

function PlaywrightCoveragePage() {
  return (
    <Layout>
      <PackageHero {...hero} />
      <PackageReadme readme={readme} />
    </Layout>
  )
}

export default PlaywrightCoveragePage
