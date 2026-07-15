import type { SVGProps } from 'react'
const SvgChecklist = (props: SVGProps<SVGSVGElement>) => (
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
    <rect fill="none" x={3} y={4} width={6} height={6} rx={1} />
    <path fill="none" d="m3 17 2 2 4-4" />
    <line x1={13} y1={7} x2={21} y2={7} />
    <line x1={13} y1={18} x2={21} y2={18} />
  </svg>
)
export default SvgChecklist
