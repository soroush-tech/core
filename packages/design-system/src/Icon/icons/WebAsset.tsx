import type { SVGProps } from 'react'
const SvgWebAsset = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24" {...props}>
    <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 14H5V8h14z" />
  </svg>
)
export default SvgWebAsset
