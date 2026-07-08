import {
  type ChangeEventHandler,
  type ComponentProps,
  type ElementType,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { TextAreaAutoResize } from './TextAreaAutoResize'
import { useFormControl } from 'src/theme/FormControl'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  system,
  get,
  type SpaceProps,
  type LayoutProps,
} from 'src/theme'
import { inputVariantStyles } from 'src/theme/utils/inputVariantStyles'

export type TextInputColor = keyof Theme['palette']
export type TextInputTextColor = keyof Theme['text']
export type TextInputVariant = 'default' | 'outlined' | 'text' | 'underline'
export type TextInputSize = keyof Theme['sizes']

export interface TextInputClasses {
  root?: string
  input?: string
}

export interface TextInputProps
  extends SpaceProps<Theme>, Pick<LayoutProps<Theme>, 'width' | 'minWidth' | 'maxWidth'> {
  /** Corner radius — applies only to `default` and `outlined` variants. Resolves against `theme.radii`. */
  borderRadius?: keyof Theme['radii']
  autoComplete?: string
  autoFocus?: boolean
  /** Class names applied to inner elements. `root` targets the wrapper; `input` targets the native element. */
  classes?: TextInputClasses
  /** Override components for the Root and Input slots. */
  components?: { Input?: ElementType; Root?: ElementType }
  /** Focus/active border color — resolves to `theme.palette[color].main`. Default: `'primary'`. */
  color?: TextInputColor
  /** Text color of the typed value — resolves against `theme.text`. Default: `'primary'`. */
  textColor?: TextInputTextColor
  /** Disables the input. */
  disabled?: boolean
  /** Marks the field as invalid — applies error border color. */
  error?: boolean
  /** Stretches the root to fill its container. */
  fullWidth?: boolean
  id?: string
  /** Custom component for the input element. Takes priority over `components.Input`. Default: `'input'`. */
  inputComponent?: ElementType
  /** Native HTML `size` attribute — visible width in character widths. Has no effect with `multiline` or `resize`. */
  inputSize?: number
  /** Extra props spread onto the native element. Explicit top-level props take priority. */
  inputProps?: InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>
  /** Maximum rows before the auto-grow textarea starts scrolling. Only applies when `resize` is set. */
  maxRows?: number | string
  /** Minimum rows for the auto-grow textarea. Only applies when `resize` is set. */
  minRows?: number | string
  /**
   * Renders a `<textarea>` that grows with its content.
   * Combine with `rows` to fix the height instead of auto-growing.
   */
  multiline?: boolean
  name?: string
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  /** Auto-grows the textarea as content increases. Requires `multiline`. */
  resize?: boolean
  /** Controls padding and font size. Default: `'md'`. */
  size?: TextInputSize
  /**
   * Fixes the textarea height to this many rows. Also enables `multiline`
   * when value is greater than 1. Disables resize.
   */
  rows?: number | string
  /** HTML input type. Ignored when multiline. Default: `'text'`. */
  type?: string
  /**
   * Visual style of the input.
   * - `outlined` / `default` — full border box (default)
   * - `underline` — border on bottom only
   * - `text` — no border, transparent background
   */
  variant?: TextInputVariant
  value?: string | number | readonly string[]
  className?: string
  'data-testid'?: string
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface TextInputRootProps
  extends SpaceProps<Theme>, Pick<LayoutProps<Theme>, 'width' | 'minWidth' | 'maxWidth'> {
  color?: TextInputColor
  textColor?: TextInputTextColor
  variant?: TextInputVariant
  error?: boolean
  disabled?: boolean
  fullWidth?: boolean
  borderRadius?: keyof Theme['radii']
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'as',
  'color',
  'textColor',
  'variant',
  'error',
  'disabled',
  'fullWidth',
])

// ─── Styling functions ────────────────────────────────────────────────────────

const baseStyle = {
  display: 'inline-flex',
  alignItems: 'center' as const,
  transition: 'border-color 0.15s ease',
}

// Plain function — get() for safe dot-notation traversal.
// system() raw function skipped here: createParser iterates props with for...in which
// doesn't see 'variant' reliably in this styled context. Destructuring is reliable.
const backgroundStyle = ({
  textColor = 'primary',
  theme,
}: TextInputRootProps & { theme?: Theme }) => {
  return {
    backgroundColor: get(theme, 'background.terminal'),
    color: get(theme, `text.${textColor}`),
    fontFamily: get(theme, 'fonts.body'),
    fontSize: get(theme, 'fontSizes.1'),
    lineHeight: get(theme, 'lineHeights.base'),
  }
}

// Plain functions avoid the SSR crash: system() transformers returning nested CSS objects
// (e.g. '&:focus-within') cause stylis to throw in the server renderer.
const colorBorder = ({
  color = 'primary',
  error,
  theme,
}: TextInputRootProps & { theme?: Theme }) => ({
  borderColor: error ? get(theme, 'palette.error.main') : get(theme, `palette.${color}.light`),
})

// Keyboard-only focus ring on the wrapper (the inner input keeps `outline: none`).
// Covers every variant, including the borderless `default` / `text` that the
// `:focus-within` border-color change alone can't show.
const focusVisibleRing = ({ theme }: TextInputRootProps & { theme?: Theme }) => ({
  '&:has(:focus-visible)': {
    outline: `2px solid ${get(theme, 'palette.primary.main')}`,
    outlineOffset: '2px',
  },
})

const focusWithinColor = ({
  color = 'primary',
  error,
  theme,
}: TextInputRootProps & { theme?: Theme }) => ({
  '&:focus-within': {
    borderColor: error ? get(theme, 'palette.error.main') : get(theme, `palette.${color}.main`),
  },
})

const borderRadiusStyle = ({
  variant: v = 'default',
  borderRadius,
  theme,
}: TextInputRootProps & { theme?: Theme }) => {
  if (v === 'underline' || v === 'text' || !borderRadius) return {}
  return { borderRadius: get(theme, `radii.${borderRadius}`) }
}

const layoutStyles = ({ fullWidth, disabled }: TextInputRootProps) => ({
  ...(fullWidth ? ({ display: 'flex', width: '100%' } as const) : {}),
  ...(disabled ? ({ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } as const) : {}),
})

// ─── Native elements ──────────────────────────────────────────────────────────

// Separate styled components for input vs textarea avoid `as`-prop ambiguity;
// `as` is reserved for components.Root (see shouldForwardProp list above).

const nativeBaseStyles = {
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  '&::placeholder': {
    color: 'inherit',
    opacity: 0.5,
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
}

const textAreaBaseStyles = {
  resize: 'none' as const,
  overflow: 'auto' as const,
}

// Native <input size> (character width) conflicts with our visual size token —
// `size` drives styles via sizeVariant; `inputSize` forwards as the native attribute.
interface InputBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextInputSize
  inputSize?: number
  inputComponent?: ElementType
}

function InputBase({ inputSize, inputComponent, ...props }: Readonly<InputBaseProps>) {
  const Component = inputComponent ?? 'input'
  return <Component {...({ ...props, size: inputSize } as ComponentProps<typeof Component>)} />
}

const widthStyles = system({ width: true, minWidth: true, maxWidth: true })

type StyledInputProps = { size: TextInputSize }

const sizeVariants = ({ theme, size }: StyledInputProps & { theme: Theme }) => {
  const s = theme.sizes[size]
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: theme.space[s.paddingRight],
    fontSize: theme.fontSizes[s.fontSize],
  }
}

const TextInputRoot = styled('div', { label: 'TextInput', shouldForwardProp })<TextInputRootProps>(
  baseStyle,
  inputVariantStyles,
  borderRadiusStyle,
  colorBorder,
  focusWithinColor,
  focusVisibleRing,
  backgroundStyle,
  layoutStyles,
  space,
  widthStyles
)

const StyledInput = styled(InputBase)<StyledInputProps>(nativeBaseStyles, sizeVariants)

const shouldForwardInputProps = (prop: string) => prop !== 'size'

// Fixed-rows only — scrolls when content overflows.
const StyledTextarea = styled('textarea', {
  shouldForwardProp: shouldForwardInputProps,
})<StyledInputProps>(nativeBaseStyles, textAreaBaseStyles, sizeVariants)

// Auto-grow — TextAreaAutoResize owns the resize behavior; style applied here.
const StyledAutoResizeTextarea = styled(TextAreaAutoResize, {
  shouldForwardProp: shouldForwardInputProps,
})<StyledInputProps>(nativeBaseStyles, textAreaBaseStyles, sizeVariants)

// ─── Public component ─────────────────────────────────────────────────────────

export function TextInput({
  autoComplete,
  autoFocus,
  borderRadius,
  classes,
  components,
  color: colorProp,
  textColor: textColorProp,
  disabled: disabledProp,
  error: errorProp,
  fullWidth: fullWidthProp,
  id: idProp,
  inputComponent,
  inputProps,
  inputSize,
  maxRows,
  minRows,
  multiline = false,
  name,
  onChange,
  placeholder,
  readOnly,
  required: requiredProp,
  resize = false,
  rows,
  size: sizeProp,
  type = 'text',
  value,
  variant = 'default',
  className,
  'data-testid': dataTestid,
  ...spaceProps
}: Readonly<TextInputProps>) {
  // Resolve form-field props through context (Form → FormControl → explicit). Explicit
  // props win; `color` keeps TextInput's own default since its domain is palette-only.
  const fc = useFormControl({
    id: idProp,
    error: errorProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
    fullWidth: fullWidthProp,
    color: colorProp,
    textColor: textColorProp,
  })
  const { id, error, disabled, required, size, fullWidth } = fc
  const color = fc.color ?? 'primary'
  const textColor = fc.textColor ?? 'primary'

  const isAutoResize = resize
  // rows > 1 implicitly enables multiline; rows === 1 stays as <input>
  const isMultiline = multiline || (rows !== undefined && Number(rows) > 1)
  const isTextarea = (isAutoResize || isMultiline) && (!type || type === 'text')

  const rootClassName = [className, classes?.root].filter(Boolean).join(' ') || undefined
  const resolvedInputComponent = inputComponent ?? components?.Input

  const inputElProps = {
    ...inputProps,
    id,
    name,
    disabled,
    required,
    autoComplete,
    autoFocus,
    placeholder,
    readOnly,
    onChange,
    value,
    className: classes?.input,
    type: isTextarea ? undefined : type,
    rows: isMultiline && rows !== undefined ? Number(rows) : undefined,
    size,
    'aria-describedby': inputProps?.['aria-describedby'] ?? fc['aria-describedby'],
  }

  return (
    <TextInputRoot
      as={components?.Root}
      color={color}
      textColor={textColor}
      variant={variant}
      error={error}
      disabled={disabled}
      fullWidth={fullWidth}
      borderRadius={borderRadius}
      className={rootClassName}
      data-testid={dataTestid}
      {...spaceProps}
    >
      {isTextarea && isAutoResize ? (
        <StyledAutoResizeTextarea {...inputElProps} minRows={minRows ?? rows} maxRows={maxRows} />
      ) : isTextarea ? (
        <StyledTextarea {...inputElProps} />
      ) : (
        <StyledInput
          inputComponent={resolvedInputComponent}
          inputSize={inputSize}
          {...inputElProps}
        />
      )}
    </TextInputRoot>
  )
}
