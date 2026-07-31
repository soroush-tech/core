import { get, system, type SystemConfig, type Transform } from '@soroush.tech/styled-system/core'

const isNumber = (n: unknown): n is number => typeof n === 'number' && !Number.isNaN(n)

const getWidth: Transform = (n, scale) =>
  get(scale, n as string, !isNumber(n) || n > 1 ? n : n * 100 + '%')

const config: SystemConfig = {
  width: { property: 'width', scale: 'sizes', transform: getWidth },
  height: { property: 'height', scale: 'sizes' },
  minWidth: { property: 'minWidth', scale: 'sizes' },
  minHeight: { property: 'minHeight', scale: 'sizes' },
  maxWidth: { property: 'maxWidth', scale: 'sizes' },
  maxHeight: { property: 'maxHeight', scale: 'sizes' },
  size: { properties: ['width', 'height'], scale: 'sizes' },
  overflow: true,
  overflowX: true,
  overflowY: true,
  display: true,
  verticalAlign: true,
  aspectRatio: true,
}

export const layout = system(config)

export default layout
