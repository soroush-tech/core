import { useId, useMemo, useState, type ReactNode } from 'react'
import { type Theme } from '@emotion/react'
import { styled } from '../index'
import { View, type ViewProps } from '../View'
import { FormControlContext } from './FormControlContext'

// Named styled root — theme-customizable via
// `theme.components.FormControl.styleOverrides.root`.
const FormControlRoot = styled(View, { name: 'FormControl', label: 'FormControl' })<ViewProps>()

export interface FormControlProps extends Omit<ViewProps, 'color'> {
  children: ReactNode
  /** Field id — auto-generated via `useId()` when omitted. Links FormLabel, control, and helper text. */
  id?: string
  error?: boolean
  disabled?: boolean
  required?: boolean
  size?: keyof Theme['sizes']
  fullWidth?: boolean
  color?: keyof Theme['palette']
  textColor?: keyof Theme['text']
}

/**
 * Groups a label, control, and helper text and shares their state via context.
 * Works standalone (no parent Form) and auto-generates the id wiring so
 * `htmlFor` / `aria-describedby` link without manual coordination.
 */
export function FormControl({
  children,
  id,
  error,
  disabled,
  required,
  size,
  fullWidth,
  color,
  textColor,
  ...viewProps
}: Readonly<FormControlProps>) {
  const generatedId = useId()
  const resolvedId = id ?? generatedId
  const helperId = `${resolvedId}-helper`
  const [hasHelperText, setHasHelperText] = useState(false)

  const value = useMemo(
    () => ({
      id: resolvedId,
      helperId,
      error,
      disabled,
      required,
      size,
      fullWidth,
      color,
      textColor,
      hasHelperText,
      setHasHelperText,
    }),
    [
      resolvedId,
      helperId,
      error,
      disabled,
      required,
      size,
      fullWidth,
      color,
      textColor,
      hasHelperText,
    ]
  )

  return (
    <FormControlContext.Provider value={value}>
      <FormControlRoot width={fullWidth ? '100%' : undefined} {...viewProps}>
        {children}
      </FormControlRoot>
    </FormControlContext.Provider>
  )
}
