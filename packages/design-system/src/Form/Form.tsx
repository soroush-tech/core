import { useMemo, type ReactNode, type SyntheticEvent } from 'react'
import { type Theme } from '@emotion/react'
import { styled } from '../index'
import { FormContext } from './FormContext'

// Named styled root — the `<form>` element is theme-customizable via
// `theme.components.Form.styleOverrides.root`.
const FormRoot = styled('form', { name: 'Form', label: 'Form' })()

export interface FormProps {
  children: ReactNode
  onSubmit?: (event: SyntheticEvent<HTMLFormElement>) => void
  /** Default control size for every field — overridable per FormControl/control. */
  size?: keyof Theme['sizes']
  /** Default accent color for every field. */
  color?: keyof Theme['palette']
  /** Default text color for every field's label/helper/input — resolves against `theme.text`. */
  textColor?: keyof Theme['text']
  /** Disables every field. */
  disabled?: boolean
  /** Stretches every field to fill its container. */
  fullWidth?: boolean
  id?: string
  className?: string
  /** Skips native browser validation so field-level validation owns the UX. */
  noValidate?: boolean
  'data-testid'?: string
}

/**
 * Renders a `<form>` and provides form-wide defaults via FormContext — the lowest
 * priority in the override chain (FormControl and explicit control props win).
 */
export function Form({
  children,
  onSubmit,
  size,
  color,
  textColor,
  disabled,
  fullWidth,
  id,
  className,
  noValidate,
  'data-testid': dataTestid,
}: Readonly<FormProps>) {
  const value = useMemo(
    () => ({ size, color, textColor, disabled, fullWidth }),
    [size, color, textColor, disabled, fullWidth]
  )

  return (
    <FormContext.Provider value={value}>
      <FormRoot
        id={id}
        className={className}
        noValidate={noValidate}
        onSubmit={onSubmit}
        data-testid={dataTestid}
      >
        {children}
      </FormRoot>
    </FormContext.Provider>
  )
}
