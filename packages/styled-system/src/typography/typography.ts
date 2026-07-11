import { system, type SystemConfig } from '@soroush.tech/styled-system/core'

const fontSizes = [12, 14, 16, 20, 24, 32, 48, 64, 72]

const config: SystemConfig = {
  fontFamily: { property: 'fontFamily', scale: 'fonts' },
  fontSize: { property: 'fontSize', scale: 'fontSizes', defaultScale: fontSizes },
  fontWeight: { property: 'fontWeight', scale: 'fontWeights' },
  lineHeight: { property: 'lineHeight', scale: 'lineHeights' },
  letterSpacing: { property: 'letterSpacing', scale: 'letterSpacings' },
  textAlign: true,
  fontStyle: true,
  textTransform: true,
  textDecoration: true,
  textDecorationLine: true,
  textDecorationStyle: true,
  textDecorationThickness: true,
  textDecorationColor: { property: 'textDecorationColor', scale: 'colors' },
  textAlignLast: true,
}

export const typography = system(config)

export default typography
