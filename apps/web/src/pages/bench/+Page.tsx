import { Layout } from 'src/common/Layout'
import { PackageHero } from 'src/section/PackageHero'
import { PackageReadme } from 'src/section/PackageReadme'
// The README lives with the package; import it as a raw string via the `packages` alias.
import readme from 'packages/bench/README.md?raw'
import { hero } from './bench.data'

function BenchPage() {
  return (
    <Layout>
      <PackageHero {...hero} />
      <PackageReadme readme={readme} />
    </Layout>
  )
}

export default BenchPage
