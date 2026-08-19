# Hero

Landing page hero section. Renders a full-viewport `<section>` with a role label, large H1 heading, body description, and two CTA buttons.

## Usage

```tsx
import { Hero } from 'src/common/Hero'
;<Hero />
```

## Content

All content is static and specific to the site:

| Element       | Value                                              |
| ------------- | -------------------------------------------------- |
| Role label    | `Principal Software Engineer`                      |
| H1            | `Building High‑Performance Software Architectures` |
| Description   | Engineering scalable, low-latency systems...       |
| Primary CTA   | `View Projects` (contained, primary)               |
| Secondary CTA | `Inquire` (outlined, default)                      |

## Layout

The gradient-backed `<section>` shell - the `Paper` surface, linear-gradient backdrop, and centered `maxWidth="1280px"` container - comes from `src/common/PageHeader`. Hero passes its content as `children` and sets `minHeight="620px"`.

## Typography mapping

| Element     | Variant           | Overrides                                                                                     |
| ----------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Role label  | `caption` (12px)  | `fontFamily="mono"`, `letterSpacing="widest"`, `textTransform="uppercase"`, `color="primary"` |
| H1          | `h1` (48px, bold) | `letterSpacing="tighter"`, `textTransform="uppercase"`, `lineHeight="tight"`                  |
| Accent span | `inherit`         | `color="primary"`, `fontStyle="italic"`                                                       |
| Description | `body1` (16px)    | `lineHeight="relaxed"`, `fontWeight="light"`, `color="secondary"`                             |
