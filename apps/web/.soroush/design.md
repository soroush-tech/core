# Design rules

How a page of soroush.tech is designed, for an agent writing a surface against the app's
catalog. The catalog brief says what a component takes; these rules say what to write. A
surface that follows them lands in `src/` looking like the sections already there. Component
APIs and token values come from the brief and the design-system docs, never from memory.

## Direction

The site reads like a technical blueprint: calculated, layered, precise, and alive. Scale does
the work - a large heading over a small monospace readout - and space does the rest. Depth is
stacked surfaces and thin lines, not grey shadows. The brand green is a laser pointer: it marks
the one thing to look at and is never used for reading text. Every page must read in both the
light and the dark theme, which is why every colour below is a token and never a value.

## Page

- A page is a column of sections, each a self-contained band; the page's `Layout` wraps them and
  carries no `layout` of its own.
- A page that opens with a title uses `PageHeader` (`src/common`) for it; the sections follow.
- One idea per section. A section that needs a second heading is two sections.

## Section

- The section root is `<View as="section" py={N}>` (or `Flex`), with `py` from `6` to `10` for
  the vertical rhythm and no `px`. Never `Paper` or `bg="paper"` as a root; `Paper` is a card
  inside the content.
- Give the root a `bg` (`terminal`, `default`, `secondary`) only for a banded section, else leave
  it transparent. Adjacent bands of different surface tokens are the dividers: no border lines
  between sections.
- Inside the root, exactly one frame: `<Grid layout gap={N}>` for content on the theme's columns,
  `<View layout>` or `<Flex layout>` for content on the frame alone. It sets the page's margins
  and maximum width at every breakpoint. Never a frame inside a frame: the margins add up. Never
  `maxWidth` plus `mx="auto"` plus `px` to fake one.
- A section's heading row spans the grid (`span="full"`): an `Eyebrow` (`src/common`) holding
  the `h2`, or `Headline` for a numbered section title. The eyebrow label and the readouts near a
  heading are `caption` or `overline` in the `mono` family, uppercase, with wide letter spacing.
- A narrower section is `layout={{ mode: 'fixed', maxWidth }}` on the frame, not a nested box.

## Columns

- The theme has 4 columns at `xs`, 8 from `sm` and 12 from `md`. Size every child of a
  `<Grid layout>` with `span`: a list of values, one per breakpoint, that holds from that
  breakpoint up, or `"full"` for the whole row.
- Every multi-column layout sets a tablet and a desktop value. A layout that adapts at one
  breakpoint only is wrong.
- Cards in a grid take equal spans (`4` of 12 for three across, `6` for two). A bento layout
  mixes spans on one grid; it does not nest grids.
- A grid with its own tracks (`auto-fill`) is a plain `Grid` placed inside a `layout` frame, never
  `layout` plus `gridTemplateColumns`.

## Values

- Spacing, colours, radii, shadows, font sizes and letter spacing come from the theme's tokens:
  `p={3}`, `gap={6}`, `color="secondary"`, `bg="paper"`, `borderRadius="md"`. Never a pixel, a
  hex value or a CSS string. The brief lists each prop's keys for this app.
- Responsive values are a list, one entry per breakpoint, mobile first. There is no object form.
- Colour roles: `initial` for headings and reading text, `secondary` for supporting copy,
  `primary` for the one accent in a section (an eyebrow, a highlighted word, a rule, an active
  state). Body copy is never `primary`.
- A floating element over content (a sticky bar, an overlay) sits on the `glass` or `appBar`
  surface token, which carries the blur; nothing else is translucent.
- Lift is a surface step (`paper` on `default`, `default` on `primary`) or a `border` token
  (`light` for a felt-not-seen line, `primary` for an accent edge). Shadows only through the
  theme's elevation scale on a `Paper` or `Card`, and only on something that floats.
- Corners come from the radius scale (`sq`, `md`, pills for chips and buttons). Do not override
  what a component rounds itself.

## Text

- All text is `Typography` with a `variant`. Headings: `h1` for the page title (one per page),
  `h2` for a section, `h3` inside a card or list item. Copy: `body1` for reading text, `body2`
  for dense or secondary copy. Readouts, labels, metadata: `caption` or `overline`, `mono`
  family. Button labels are the button's own.
- Headings are tight (`letterSpacing="tighter"`, `fontWeight="bold"`); readouts are wide
  (`letterSpacing="wide"` or `widest`, uppercase). Reading text keeps the theme's line height.
- One `h1` per page; heading levels never skip. A heading the design wants smaller keeps its
  level and changes its `variant`.
- Copy is short and specific. A card has a title and one or two sentences; a hero has a heading,
  one paragraph and at most two actions.

## Components

Reach for these before composing from primitives, in this order: the app's own components in
`src/common`, then the design system's.

- `Eyebrow` for the label row above a section heading; `Headline` for a numbered section title
  with its rule.
- `IconCard` for a card of icon, uppercase title and body, sized with `span`; `DomainCard` for a
  bento card with an image and a hover lift. `Card` and `Paper` only for a card neither covers.
- `CommandSnippet` for a shell command; `Quote` for a terminal readout or a pulled line.
- `Button` for actions (`contained` for the one primary action of a section, `outlined` for the
  rest, `text` inside copy); `Link` for navigation. An icon-only control carries an
  `accessibility.label`.
- `Chip` for tags and status, `Badge` for a count, `Alert` for an inline message.
- Icons are `Icon` with a name from the registry, sized with the text they sit beside.
- `Blueprint` wraps a full-bleed decorative background; `GlitchText` and `Flicker` are for error
  and warning glyphs only.
- Forms are `Form` with `FormControl`, `FormLabel`, `FormHelperText` and the input components;
  `Select` for every dropdown.

## Data and states

- Data a section shows comes through the behavior document: a resource, its `status` at
  `/resources/<name>/status`, and the response at `into`. The surface binds to it with `@path`.
- A section bound to a resource is a `When` on that status: a `Skeleton` layout of the same
  shape for `pending`, an `Alert` for `error`, the content otherwise. Never an empty band while
  data loads.
- Lists are a template over the list's path, one card per item, keyed by the runtime. A list that
  may be empty has an empty state in copy, not a blank grid.
- Computation is a core function call, never a value typed into the surface.

## Never

- A raw `div`, `p` or `span` where `View`, `Flex`, `Grid` or `Typography` serve.
- A pixel, a hex value, a CSS string or a `style` object.
- Two `layout` frames in one ancestry; `px` on a section root; `Paper` as a section root.
- Border lines to separate sections; grey drop shadows for lift; `primary` on reading text.
- Custom CSS. Anything the catalog cannot express is a request for a new component, not a
  workaround in the surface.
