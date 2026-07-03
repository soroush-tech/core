import { get } from '@soroush.tech/styled-system/core'

// Signature mirrors @types/styled-system__theme-get verbatim:
//   themeGet(path: string | Array<string | number>, fallback?: any): (props: any) => any
export const themeGet =
  (path: string | Array<string | number>, fallback: any = null) =>
  (props: any): any =>
    get(props.theme, Array.isArray(path) ? path.join('.') : path, fallback)

export default themeGet
