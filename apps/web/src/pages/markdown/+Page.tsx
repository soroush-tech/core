import { Layout } from 'src/common/Layout'
import { PackageHero } from 'src/section/PackageHero'
import { PackageReadme } from 'src/section/PackageReadme'
// The README ships in the published npm package; import it as a raw string via the `npm` alias.
import readme from 'npm/@soroush.tech/markdown/README.md?raw'
import { hero } from './markdown.data'

function MarkdownPage() {
  return (
    <Layout>
      <PackageHero {...hero} />
      <PackageReadme readme={readme} />
    </Layout>
  )
}

export default MarkdownPage
