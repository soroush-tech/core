import type { SVGProps } from 'react'

/**
 * A plus. Lives here rather than in the design system only because its icon
 * set has no "add" — sized and coloured like a design-system `Icon` so it
 * lines up with the rail's other rows.
 */
export function PlusMark(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      width="1.5rem"
      height="1.5rem"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  )
}
