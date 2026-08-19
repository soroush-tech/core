# Design System Strategy: Kinetic Architecture

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Kinetic Architect."** This aesthetic moves beyond standard tech minimalism into a high-end, editorial space that feels both surgically precise and vibrantly alive.

To break the "template" look, the system leverages **intentional asymmetry** and **architectural layering**. We do not use standard grids to contain ideas; we use the Space Grotesk typeface and high-contrast neon accents to anchor them. The layout should feel like a technical blueprint-calculated, layered, and premium. Depth is not achieved through shadows, but through the sophisticated stacking of dark surfaces, creating an environment that feels like a high-end terminal interface.

---

## 2. Colors

The palette is rooted in a deep, monochromatic base with a singular, high-energy neon green (`#9CFF93` / `#00FC40`) that acts as a laser-guided focus point.

### Surface Hierarchy & Nesting

This system utilizes a "Deep Stack" approach. Instead of flat layouts, we use the `surface-container` tiers to define information priority:

- **Surface (`#0E0E0E`)**: The foundation. Used for the largest background areas.
- **Surface-Container-Low (`#131313`)**: Used for secondary sections or grouping related content.
- **Surface-Container-Highest (`#262626`)**: Used for the most interactive elements, like cards or input fields, creating a "lift" without shadows.

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to section off parts of the UI. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` header should sit directly against a `surface` body. The contrast transition is the divider.

### The "Glass & Gradient" Rule

To add soul to the technical feel, use **Glassmorphism** for floating elements (headers, overlays). Apply a `backdrop-blur` with a semi-transparent `surface` color. For high-impact CTAs, use a subtle linear gradient transitioning from `primary` (`#9CFF93`) to `primary-container` (`#00FC40`) to give the green a radioactive, "lit from within" glow.

---

## 3. Typography

We use **Space Grotesk** exclusively. Its geometric yet quirky construction reinforces the "Kinetic Architect" vibe.

- **Display (Lg/Md/Sm)**: Used for hero statements. Kerned tightly (-2%) to feel like a structural element.
- **Headlines**: High contrast. Often paired with a `primary` color accent on the most important word to drive the editorial narrative.
- **Body (Lg/Md/Sm)**: Generous line-height (1.6) to ensure readability against the deep dark backgrounds.
- **Labels (Md/Sm)**: Monospaced feel. Used for technical metadata, coordinates, or system status.

The hierarchy is "Top-Heavy": large displays are used to create a sense of scale, while small, precise labels provide the technical "readout" aesthetic.

---

## 4. Elevation & Depth

In this design system, depth is a matter of light emission and layering, not physical shadows.

- **The Layering Principle**: Achieve depth by stacking tiers. A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural "inset" feel.
- **Ambient Glows**: Instead of drop shadows, use a `primary` glow for active states. Use a large blur (24px+) and very low opacity (10%) to make a card appear as if it is emitting light onto the surface below.
- **The "Ghost Border" Fallback**: If a container requires a border for accessibility, use the `outline-variant` token at 15% opacity. It should be felt, not seen.
- **Hard Edges**: All `roundedness` is set to **0px**. Sharp corners reinforce the architectural, "engineered" nature of the system.

---

## 5. Components

### Buttons

- **Primary**: Solid `primary-container` background with `on-primary` text. No border. Sharp corners.
- **Secondary**: `Ghost` style. `outline` border at 20% opacity. Becomes `primary` on hover.
- **Tertiary**: Text-only with a leading "kinetic" icon (e.g., `->`).

### Input Fields

- **Style**: `surface-container-highest` background. No border.
- **Active State**: A 1px `primary` bottom-border only.
- **Error State**: Background shifts to `error_container` at 10% opacity with `error` text labels.

### Cards & Lists

- **Structure**: Forbid the use of divider lines. Use `spacing.8` (2rem) of vertical white space to separate list items.
- **Architectural Accents**: Use small 10px "L-brackets" in the corners of cards (using the `primary` color) to emphasize the blueprint aesthetic without enclosing the box.

### Signature Component: The "Data Trace"

A custom component for this system: use ultra-thin lines (0.5px) in `outline-variant` to connect related cards or sections, mimicking a circuit board or architectural floor plan.

---

## 6. Do's and Don'ts

### Do

- **Do** use extreme scale. Pair a `display-lg` headline with a `label-sm` technical readout for a high-end editorial look.
- **Do** embrace the void. Use large amounts of `surface` space to let the green accents "pop."
- **Do** use semi-transparency. Allow the background textures or gradients to bleed through containers using `backdrop-blur`.

### Don't

- **Don't** use border-radius. Every element must have a 90-degree angle.
- **Don't** use grey shadows. If something needs to float, use a tinted glow or a simple tonal shift.
- **Don't** use the green (`primary`) for long-form body text. It is a tool for emphasis and action, not general reading.
- **Don't** use standard icons. Use "Thin" or "Light" weight stroke icons to match the architectural line-work of Space Grotesk.
