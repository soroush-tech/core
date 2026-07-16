import type { ReactNode } from 'react'
import { EmotionThemeContext } from '../engine'
import type { CSSObject, Theme } from '../themes'
import type { StyleFactory } from './useStyle'

type StylesConsumerProps = {
  style: StyleFactory
  children: (styles: CSSObject) => ReactNode
}

export function StylesConsumer({ style, children }: Readonly<StylesConsumerProps>) {
  return (
    <EmotionThemeContext.Consumer>
      {(theme) => children(style.getStyles(theme as Theme))}
    </EmotionThemeContext.Consumer>
  )
}
