import type { SVGProps } from 'react'

/**
 * A dismissal cross. Lives here rather than in the design system only because
 * its icon set has no "close" - drawn on the same `0 -960 960 960` grid as the
 * Material Symbols it sits beside, so it lines up with them.
 */
export function CrossMark(props: Readonly<SVGProps<SVGSVGElement>>) {
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
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  )
}
