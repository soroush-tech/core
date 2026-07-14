import type { SVGProps } from 'react'
const SvgFormatQuote = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M17 6H3M21 12H8M21 18H8M3 12v6" />
  </svg>
)
export default SvgFormatQuote
