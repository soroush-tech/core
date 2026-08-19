# Footer

Site-wide footer rendered by `Layout`. Four-column grid with logo/tagline, internal navigation links, external connectivity links, and a terminal readout block.

## Usage

```tsx
import { Footer } from 'src/common/Footer'
;<Footer />
```

The component is stateless and accepts no props. It is wired into `Layout` automatically.

## Columns

| Column       | Content                                                      |
| ------------ | ------------------------------------------------------------ |
| Branding     | Grayscale logo · "SOROUSH.TECH" · tagline                    |
| Directories  | Internal `NavLink`s - projects, domain, about, articles      |
| Connectivity | External links - GitHub, NPM, Technical Wiki (open `_blank`) |
| Terminal     | "SYSTEM_OUTPUT" readout with pulsing cursor · copyright year |

## Token reference

| Role               | Token                   | Dark value              |
| ------------------ | ----------------------- | ----------------------- |
| Footer background  | `background.terminal`   | `carbonBlack[900]`      |
| Terminal block bg  | `background.primary`    | `kineticSurface[900]`   |
| Top border         | `border.primary` + `1A` | `kineticGreen[500]` 10% |
| Left accent border | `border.primary`        | `kineticGreen[500]`     |
| Heading color      | `text.primary`          | `kineticGreen[500]`     |
| Body / link color  | `text.secondary`        | `kineticSurface[400]`   |
| Site title         | `text.initial`          | `kineticSurface[100]`   |
| Cursor pulse       | `border.primary`        | `kineticGreen[500]`     |
