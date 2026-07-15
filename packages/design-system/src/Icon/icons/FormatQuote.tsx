import type { SVGProps } from 'react'
const SvgFormatQuote = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path fill="none" d="M17 6H3" />
    <path fill="none" d="M21 12H8" />
    <path fill="none" d="M21 18H8" />
    <path fill="none" d="M3 12v6" />
  </svg>
)
export default SvgFormatQuote
