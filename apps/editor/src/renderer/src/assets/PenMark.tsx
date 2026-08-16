import type { SVGProps } from 'react'

/**
 * A pen. Lives here rather than in the design system only because its icon set
 * has no "edit" - drawn on the same `0 -960 960 960` grid as the Material
 * Symbols it sits beside, so it lines up with them.
 */
export function PenMark(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      width="1rem"
      height="1rem"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T846-647L319-120H120Zm640-584-56-56 56 56ZM619-619l-28-29 57 57-29-28Z" />
    </svg>
  )
}
