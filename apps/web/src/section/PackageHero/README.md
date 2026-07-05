# PackageHero

Hero band for a published npm package page. Prop-driven so every package page reuses it.

## Props

| Prop      | Type     | Description                                                     |
| --------- | -------- | --------------------------------------------------------------- |
| `name`    | `string` | Full package name, e.g. `@soroush.tech/vite-plugin-msw-server`. |
| `tagline` | `string` | One-line summary shown under the title.                         |
| `install` | `string` | Install command rendered in the terminal block.                 |
| `npmUrl`  | `string` | Link to the package's npm page.                                 |
| `repoUrl` | `string` | Link to the package's source directory.                         |

## Notes

- Renders the package name as the page `<h1>`.
- `VIEW_ON_NPM` and `SOURCE` open in a new tab (`rel="noopener noreferrer"`).
- Currently consumed by one page; promote to `src/common/` once a second package page uses it.
