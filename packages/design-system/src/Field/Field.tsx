import { cloneElement, type ChangeEvent, type ReactElement, type ReactNode } from 'react'
import {
  type ReactFormExtendedApi,
  type DeepKeys,
  type AnyFieldApi,
  type FormValidateOrFn,
  type FormAsyncValidateOrFn,
} from '@tanstack/react-form'
import { type Theme } from '../themes'
import { Flex } from '../Flex'
import { FormControl } from '../FormControl'
import { FormLabel, type FormLabelProps } from '../FormLabel'
import { FormHelperText } from '../FormHelperText'

/** The subset of control props Field injects when cloning its child. */
interface BoundControlProps {
  name?: string
  value?: unknown
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  inputProps?: Record<string, unknown>
}

// The generics mirror the form instance so `name` is checked against the value schema
// via DeepKeys. They are inferred from the `form` prop — callers never spell them out.
export interface FieldProps<
  TFormData,
  TOnMount extends undefined | FormValidateOrFn<TFormData>,
  TOnChange extends undefined | FormValidateOrFn<TFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends undefined | FormValidateOrFn<TFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
  TSubmitMeta,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
> {
  form: ReactFormExtendedApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >
  /** Type-safe field name — checked against the form's value schema. */
  name: TName
  /** Optional label; rendered as a FormLabel above the control. */
  label?: ReactNode
  /** Typography props forwarded to the FormLabel — restyle the label without losing the wiring. */
  labelProps?: Omit<FormLabelProps, 'children' | 'required' | 'htmlFor'>
  /** Optional helper text; replaced by the error message while the field is invalid. */
  helperText?: ReactNode
  required?: boolean
  size?: keyof Theme['sizes']
  fullWidth?: boolean
  /**
   * The control element, e.g. `<TextInput />`. Field clones it and injects the binding
   * from the TanStack field — `name`, `value`, `onChange`, and `inputProps.onBlur` — so the
   * call site stays declarative and the control never imports the form library.
   */
  children: ReactElement
}

/**
 * The single bridge between the design-system form layer and TanStack Form.
 * Wraps `form.Field`, derives the error-display flag, and composes
 * FormControl / FormLabel / FormHelperText so id and aria wiring are automatic.
 *
 * Error UX: shown only once the field is touched or after a submit attempt — never on
 * initial render — and only the first error message is displayed.
 */
export function Field<
  TFormData,
  TOnMount extends undefined | FormValidateOrFn<TFormData>,
  TOnChange extends undefined | FormValidateOrFn<TFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends undefined | FormValidateOrFn<TFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
  TSubmitMeta,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
>({
  form,
  name,
  label,
  labelProps,
  helperText,
  required,
  size,
  fullWidth,
  children,
}: Readonly<
  FieldProps<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta,
    TName
  >
>) {
  return (
    <form.Field name={name}>
      {(field) => {
        // The form generics are abstract inside Field, so treat the field as the untyped
        // AnyFieldApi at this boundary — the public `name` prop already enforced type safety.
        const api = field as unknown as AnyFieldApi
        const message = api.state.meta.errors[0]?.message as ReactNode
        const hasError = (api.state.meta.isTouched || form.state.isSubmitted) && Boolean(message)
        const helper = hasError ? message : helperText

        const child = children as ReactElement<BoundControlProps>
        const control = cloneElement(child, {
          name: api.name,
          value: api.state.value,
          onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            api.handleChange(event.target.value),
          inputProps: { ...child.props.inputProps, onBlur: api.handleBlur },
        })

        return (
          <FormControl error={hasError} required={required} size={size} fullWidth={fullWidth}>
            <Flex flexDirection="column" gap={2}>
              {label == null ? null : <FormLabel {...labelProps}>{label}</FormLabel>}
              {control}
              {helper == null ? null : <FormHelperText>{helper}</FormHelperText>}
            </Flex>
          </FormControl>
        )
      }}
    </form.Field>
  )
}
