import { Layout } from 'src/common/Layout'
import { PackageHero } from 'src/section/PackageHero'
import { PackageReadme } from 'src/section/PackageReadme'
// The README lives with the package; import it as a raw string via the `packages` alias.
import readme from 'packages/styled-system/README.md?raw'
import { hero } from './styled-system.data'

function StyledSystemPage() {
  return (
    <Layout>
      <PackageHero {...hero} />
      <PackageReadme readme={readme} />
    </Layout>
  )
}

export default StyledSystemPage
