import { useContext } from 'react'
import { type Theme } from '../theme/themes'
import { useTheme } from '../theme'
import { FormContext } from '../Form/FormContext'
import { FormControlContext } from './FormControlContext'
import { themeDefault } from '../theme/utils/themeDefault'

/** Explicit props a control passes in — always win over context when defined. */
export interface FormControlOverrides {
  id?: string
  error?: boolean
  disabled?: boolean
  required?: boolean
  size?: keyof Theme['sizes']
  fullWidth?: boolean
  color?: keyof Theme['palette']
  textColor?: keyof Theme['text']
}

/** Resolved field state. Uniform defaults (`size`, the booleans) are applied here; `color`/`textColor` are left for each control to default since their domains differ. */
export interface ResolvedFormControl {
  id?: string
  error: boolean
  disabled: boolean
  required: boolean
  size: keyof Theme['sizes']
  fullWidth: boolean
  color?: keyof Theme['palette']
  textColor?: keyof Theme['text']
  /** Points at the helper text id only while one is rendered — avoids a dangling reference. */
  'aria-describedby'?: string
}

/**
 * Merges a control's explicit props with FormControl and Form context.
 * Priority: explicit prop → FormControl → Form → default.
 * `error` and `required` are field-only and never read from Form.
 */
export function useFormControl(overrides: FormControlOverrides = {}): ResolvedFormControl {
  const form = useContext(FormContext)
  const control = useContext(FormControlContext)
  const theme = useTheme()

  return {
    id: overrides.id ?? control?.id,
    error: overrides.error ?? control?.error ?? false,
    disabled: overrides.disabled ?? control?.disabled ?? form.disabled ?? false,
    required: overrides.required ?? control?.required ?? false,
    size: overrides.size ?? control?.size ?? form.size ?? themeDefault(theme, 'size', 'md'),
    fullWidth: overrides.fullWidth ?? control?.fullWidth ?? form.fullWidth ?? false,
    color: overrides.color ?? control?.color ?? form.color,
    textColor: overrides.textColor ?? control?.textColor ?? form.textColor,
    'aria-describedby': control?.hasHelperText ? control.helperId : undefined,
  }
}
