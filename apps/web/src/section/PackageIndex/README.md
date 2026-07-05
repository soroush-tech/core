# PackageIndex

The `/npm` index section: a grid of `DomainCard`s, one per published `@soroush.tech/*` package.

## Data

`PackageIndex.data.ts` **auto-discovers** packages via `import.meta.glob` (eager) over every
`packages/*/package.json`, keeping only published (non-private) ones. Each entry's name /
description / keywords / version come straight from that `package.json`. A second glob over
`src/pages/*/+Page.tsx` yields the set of packages that have a detail page — no manual list to
maintain; adding a package (or its detail page) updates the index automatically.

## Notes

- Page `<h1>` is "NPM Packages"; each `DomainCard` renders the package name as its `<h2>` title.
- One card per row; the whole `DomainCard` is wrapped in a `Link` (`aria-label={name}`). It links to
  the package's **detail page** when one exists, otherwise to its **npm page** (opens in a new tab).
- Each card shows the version as the `DomainCard` `badge`; keyword tags come from `package.json`.
