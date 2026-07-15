import { useContext, useEffect, type ReactNode } from 'react'
import { styled } from '../index'
import { Typography, type TypographyProps } from '../Typography'
import { FormControlContext } from '../FormControl/FormControlContext'
import { FormContext } from '../Form/FormContext'

// Named styled root — theme-customizable via
// `theme.components.FormHelperText.styleOverrides.root`.
const FormHelperTextRoot = styled(Typography, {
  name: 'FormHelperText',
  label: 'FormHelperText',
})()

export interface FormHelperTextProps extends TypographyProps {
  children: ReactNode
  /** Renders in the error color and announces via `role="alert"`. Falls back to the FormControl `error` value. */
  error?: boolean
}

/**
 * Helper or error text for a field. Reads its id and error state from
 * FormControl context and registers its presence so the control can point
 * `aria-describedby` at it only while it is rendered.
 */
export function FormHelperText({
  children,
  error,
  id,
  role,
  color,
  ...rest
}: Readonly<FormHelperTextProps>) {
  const control = useContext(FormControlContext)
  const form = useContext(FormContext)
  const isError = error ?? control?.error ?? false
  const resolvedId = id ?? control?.helperId
  // Error color always wins; otherwise explicit color, then per-field/form `textColor`, then secondary.
  const resolvedColor = isError
    ? 'error'
    : (color ?? control?.textColor ?? form.textColor ?? 'secondary')

  const setHasHelperText = control?.setHasHelperText
  useEffect(() => {
    setHasHelperText?.(true)
    return () => setHasHelperText?.(false)
  }, [setHasHelperText])

  return (
    <FormHelperTextRoot
      as="p"
      id={resolvedId}
      variant="caption"
      role={isError ? 'alert' : role}
      {...rest}
      color={resolvedColor}
    >
      {children}
    </FormHelperTextRoot>
  )
}
