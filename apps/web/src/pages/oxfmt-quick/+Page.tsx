import { Layout } from 'src/common/Layout'
import { PackageHero } from 'src/section/PackageHero'
import { PackageReadme } from 'src/section/PackageReadme'
// oxfmt-quick lives in its own repository, so there is no `packages/` README to import.
// This page carries its own, written for the site and kept shorter than the package's.
import readme from './oxfmt-quick.readme.md?raw'
import { hero } from './oxfmt-quick.data'

function OxfmtQuickPage() {
  return (
    <Layout>
      <PackageHero {...hero} />
      <PackageReadme readme={readme} />
    </Layout>
  )
}

export default OxfmtQuickPage
