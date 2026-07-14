import type { ComponentType } from 'react'
import { type CSSObject } from '../index'
import type { StyleFactory, StyleInput } from './useStyle'
import { StylesConsumer } from './StylesConsumer'

export function withStyles<P extends object>(style: StyleInput) {
  return (WrappedComponent: ComponentType<P & { styles: CSSObject }>) =>
    function WithStyles(props: P) {
      return typeof (style as StyleFactory).getStyles === 'function' ? (
        <StylesConsumer style={style as StyleFactory}>
          {(styles) => <WrappedComponent {...props} styles={styles} />}
        </StylesConsumer>
      ) : (
        <WrappedComponent {...props} styles={style as CSSObject} />
      )
    }
}
