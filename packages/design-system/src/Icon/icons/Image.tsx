import type { SVGProps } from 'react'
const SvgImage = (props: SVGProps<SVGSVGElement>) => (
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
    <rect fill="none" x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <circle fill="none" cx={8.5} cy={8.5} r={1.5} />
    <polyline fill="none" points="21 15 16 10 5 21" />
  </svg>
)
export default SvgImage
