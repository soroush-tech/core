import { View } from '@soroush.tech/design-system/View'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Link } from '@soroush.tech/design-system/Link'
import { DomainCard } from 'src/common/DomainCard'
import { PageHeader } from 'src/common/PageHeader'
import { packages } from './PackageIndex.data'

/**
 * The `/npm` index: one `DomainCard` per row for each published `@soroush.tech/*` package (name,
 * description, keyword tags, version badge). The whole card links to the package's detail page, or
 * to its npm page when no detail page exists. Data is auto-discovered from every workspace
 * `package.json` by `PackageIndex.data.ts`.
 */
export function PackageIndex() {
  return (
    <>
      <PageHeader as="header" mb={2}>
        <View height="1px" width="3rem" bg="primary" mb={4} />
        <Typography
          variant="h1"
          as="h1"
          color="initial"
          fontWeight="bold"
          letterSpacing="tighter"
          mb={4}
        >
          NPM Packages
        </Typography>
        <Typography variant="body1" color="secondary" lineHeight="relaxed" maxWidth="40rem">
          Open-source tooling published to npm under the{' '}
          <Typography as="span" variant="inherit" fontFamily="mono" color="primary">
            @soroush.tech
          </Typography>{' '}
          scope.
        </Typography>
      </PageHeader>
      <View as="section" px={4} py={4}>
        <View maxWidth="1280px" mx="auto">
          <Grid gridTemplateColumns="1fr" gap={2}>
            {packages.map((pkg, index) => (
              <Link
                key={pkg.name}
                href={pkg.href}
                target={pkg.target}
                aria-label={pkg.name}
                underline="none"
                display="block"
                color="inherit"
              >
                <DomainCard
                  featured
                  index={index + 1}
                  badge={`v${pkg.version}`}
                  title={pkg.name}
                  description={pkg.description}
                  tags={pkg.keywords}
                />
              </Link>
            ))}
          </Grid>
        </View>
      </View>
    </>
  )
}
