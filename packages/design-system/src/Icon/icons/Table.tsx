import type { SVGProps } from 'react'
const SvgTable = (props: SVGProps<SVGSVGElement>) => (
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
    <rect fill="none" x={3} y={3} width={18} height={18} rx={2} />
    <path fill="none" d="M3 9h18" />
    <path fill="none" d="M3 15h18" />
    <path fill="none" d="M12 3v18" />
  </svg>
)
export default SvgTable
