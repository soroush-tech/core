import { createContext } from 'react'
import { type Theme } from '../theme/themes'

/** Form-wide defaults, lowest priority in the override chain (overridden by FormControl, then explicit props). */
export interface FormContextValue {
  size?: keyof Theme['sizes']
  color?: keyof Theme['palette']
  /** Text color for label/helper/input content — resolves against `theme.text`. */
  textColor?: keyof Theme['text']
  disabled?: boolean
  fullWidth?: boolean
}

export const FormContext = createContext<FormContextValue>({})
