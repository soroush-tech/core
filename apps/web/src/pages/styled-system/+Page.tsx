import { Layout } from 'src/common/Layout'
import { PackageHero } from 'src/section/PackageHero'
import { PackageReadme } from 'src/section/PackageReadme'
// The README ships in the published npm package; import it as a raw string via the `npm` alias.
import readme from 'npm/@soroush.tech/styled-system/README.md?raw'
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
