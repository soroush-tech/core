import { type ChangeEvent, type SelectHTMLAttributes } from 'react'
import { useFormControl } from 'src/theme/FormControl'
import { Icon, type IconName, type IconProps } from 'src/theme/Icon'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  variant,
  get,
  type SpaceProps,
  type LayoutProps,
  system,
} from 'src/theme'

export type NativeSelectColor = keyof Theme['palette']
export type NativeSelectTextColor = keyof Theme['text']
export type NativeSelectBackgroundToken = keyof Theme['background']
export type NativeSelectVariant = 'default' | 'outlined' | 'text' | 'underline'
export type NativeSelectSize = keyof Theme['sizes']

export interface NativeSelectOption {
  label: string
  value: string | number
}

export interface NativeSelectProps
  extends SpaceProps<Theme>, Pick<LayoutProps<Theme>, 'width' | 'minWidth' | 'maxWidth'> {
  /** The options to populate the select with. */
  options: NativeSelectOption[]
  /** Controlled value — matches an option's `value`. */
  value?: string | number
  /** Uncontrolled initial value. */
  defaultValue?: string | number
  /** Fired with the selected option's original `value` (number values stay numbers). */
  onChange?: (value: string | number) => void
  /** Empty-state label rendered as a disabled first option, shown while nothing is selected. */
  placeholder?: string
  /** Corner radius — applies only to `default` and `outlined` variants. Resolves against `theme.radii`. */
  borderRadius?: keyof Theme['radii']
  /** Focus/active border color — resolves to `theme.palette[color].main`. Default: `'primary'`. */
  color?: NativeSelectColor
  /** Text color of the selected value — resolves against `theme.text`. Default: `'primary'`. */
  textColor?: NativeSelectTextColor
  /** Background color — resolves against `theme.background`. Default: `'terminal'`. */
  bg?: NativeSelectBackgroundToken
  /** Disables the select. */
  disabled?: boolean
  /** Marks the field as invalid — applies error border color. */
  error?: boolean
  /** Stretches the root to fill its container. */
  fullWidth?: boolean
  /** Dropdown affordance icon. Default: `'expand_more'`. */
  iconName?: IconName
  /** Extra props for the dropdown icon. */
  iconProps?: Omit<IconProps, 'name'>
  /** Extra attributes spread onto the native `<select>`. Explicit top-level props take priority. */
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>
  id?: string
  name?: string
  required?: boolean
  /** Controls padding and font size. Default: `'md'`. */
  size?: NativeSelectSize
  /**
   * Visual style of the select.
   * - `outlined` / `default` — full border box (default)
   * - `underline` — border on bottom only
   * - `text` — no border, transparent background
   */
  variant?: NativeSelectVariant
  className?: string
  'data-testid'?: string
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface NativeSelectRootProps
  extends SpaceProps<Theme>, Pick<LayoutProps<Theme>, 'width' | 'minWidth' | 'maxWidth'> {
  color?: NativeSelectColor
  textColor?: NativeSelectTextColor
  bg?: NativeSelectBackgroundToken
  variant?: NativeSelectVariant
  error?: boolean
  disabled?: boolean
  fullWidth?: boolean
  borderRadius?: keyof Theme['radii']
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'color',
  'textColor',
  'variant',
  'error',
  'disabled',
  'fullWidth',
])

const baseStyle = {
  position: 'relative' as const,
  display: 'inline-flex',
  alignItems: 'center' as const,
  transition: 'border-color 0.15s ease',
}

// Mirrors TextInput's variant rules so mixed forms look uniform.
const variantStyles = variant({
  prop: 'variant',
  variants: {
    outlined: { borderRadius: 'sq', borderWidth: 'thin', borderStyle: 'solid' },
    default: { borderRadius: 'sq', borderStyle: 'none' },
    underline: {
      borderRadius: 'sq',
      borderStyle: 'none',
      borderBottomWidth: 'thin',
      borderBottomStyle: 'solid',
    },
    text: { borderRadius: 'sq', borderStyle: 'none' },
  },
})

const backgroundStyle = ({
  textColor = 'primary',
  bg = 'terminal',
  theme,
}: NativeSelectRootProps & { theme?: Theme }) => ({
  backgroundColor: get(theme, `background.${bg}`),
  color: get(theme, `text.${textColor}`),
  fontFamily: get(theme, 'fonts.body'),
  fontSize: get(theme, 'fontSizes.1'),
  lineHeight: get(theme, 'lineHeights.base'),
})

const colorBorder = ({
  color = 'primary',
  error,
  theme,
}: NativeSelectRootProps & { theme?: Theme }) => ({
  borderColor: error ? get(theme, 'palette.error.main') : get(theme, `palette.${color}.light`),
})

const focusWithinColor = ({
  color = 'primary',
  error,
  theme,
}: NativeSelectRootProps & { theme?: Theme }) => ({
  '&:focus-within': {
    borderColor: error ? get(theme, 'palette.error.main') : get(theme, `palette.${color}.main`),
  },
})

// Keyboard-only focus ring on the wrapper (the inner select keeps `outline: none`).
const focusVisibleRing = ({ theme }: NativeSelectRootProps & { theme?: Theme }) => ({
  '&:has(:focus-visible)': {
    outline: `2px solid ${get(theme, 'palette.primary.main')}`,
    outlineOffset: '2px',
  },
})

const borderRadiusStyle = ({
  variant: v = 'default',
  borderRadius,
  theme,
}: NativeSelectRootProps & { theme?: Theme }) => {
  if (v === 'underline' || v === 'text' || !borderRadius) return {}
  return { borderRadius: get(theme, `radii.${borderRadius}`) }
}

const layoutStyles = ({ fullWidth, disabled }: NativeSelectRootProps) => ({
  ...(fullWidth ? ({ display: 'flex', width: '100%' } as const) : {}),
  ...(disabled ? ({ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } as const) : {}),
})

const widthStyles = system({ width: true, minWidth: true, maxWidth: true })

const NativeSelectRoot = styled('div', {
  label: 'NativeSelect',
  shouldForwardProp,
})<NativeSelectRootProps>(
  baseStyle,
  variantStyles,
  borderRadiusStyle,
  colorBorder,
  focusWithinColor,
  focusVisibleRing,
  backgroundStyle,
  layoutStyles,
  space,
  widthStyles
)

// ─── Native select ────────────────────────────────────────────────────────────

// `sizeToken`, not `size` — the native <select size> attribute is a row count
// (number) and clashes with our density token; `sizeToken` drives styles only.
type StyledNativeSelectProps = {
  sizeToken: NativeSelectSize
  bg?: NativeSelectBackgroundToken
  textColor: NativeSelectTextColor
}

const shouldForwardNativeSelectProps = (prop: string) =>
  prop !== 'sizeToken' && prop !== 'bg' && prop !== 'textColor'

// Trailing padding leaves room for the absolutely-positioned dropdown icon.
const sizeVariants = ({ theme, sizeToken }: StyledNativeSelectProps & { theme: Theme }) => {
  const s = theme.sizes[sizeToken]
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: `calc(${theme.space[s.paddingRight]} + 1.5rem)`,
    fontSize: theme.fontSizes[s.fontSize],
  }
}

// The native dropdown popup ignores the wrapper's background — the open list is
// painted by the <select>/<option> themselves. Theme the select surface (and its
// options) directly from `bg`/`textColor` so the popup that opens below matches.
// Chromium/Firefox honor these; the option hover highlight stays OS-controlled.
const selectSurface = ({
  bg = 'terminal',
  textColor,
  theme,
}: StyledNativeSelectProps & { theme: Theme }) => {
  const backgroundColor = get(theme, `background.${bg}`)
  const color = get(theme, `text.${textColor}`)
  return {
    backgroundColor,
    color,
    '& option': { backgroundColor, color },
  }
}

const StyledNativeSelect = styled('select', {
  shouldForwardProp: shouldForwardNativeSelectProps,
})<StyledNativeSelectProps>(
  {
    appearance: 'none',
    flex: 1,
    minWidth: 0,
    width: '100%',
    border: 'none',
    borderRadius: 'inherit',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 'inherit',
    cursor: 'pointer',
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
  sizeVariants,
  selectSurface
)

const DropdownIcon = styled(Icon)({
  position: 'absolute',
  right: '0.375rem',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
})

// ─── Public component ─────────────────────────────────────────────────────────

export function NativeSelect({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  borderRadius,
  color: colorProp,
  textColor: textColorProp,
  bg,
  disabled: disabledProp,
  error: errorProp,
  fullWidth: fullWidthProp,
  iconName = 'expand_more',
  iconProps,
  selectProps,
  id: idProp,
  name,
  required: requiredProp,
  size: sizeProp,
  variant = 'default',
  className,
  'data-testid': dataTestid,
  ...spaceProps
}: Readonly<NativeSelectProps>) {
  // Resolve form-field props through context (Form → FormControl → explicit).
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

  // The DOM casts option values to strings — map back to the option's original
  // value so numeric options round-trip as numbers.
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const match = options.find((option) => String(option.value) === event.target.value)
    onChange?.(match ? match.value : event.target.value)
  }

  // With a placeholder, an empty selection must resolve to the placeholder option.
  const uncontrolledDefault =
    value === undefined ? (defaultValue ?? (placeholder !== undefined ? '' : undefined)) : undefined

  return (
    <NativeSelectRoot
      color={color}
      textColor={textColor}
      bg={bg}
      variant={variant}
      error={error}
      disabled={disabled}
      fullWidth={fullWidth}
      borderRadius={borderRadius}
      className={className}
      data-testid={dataTestid}
      {...spaceProps}
    >
      <StyledNativeSelect
        {...selectProps}
        id={id}
        name={name}
        disabled={disabled}
        required={required}
        sizeToken={size}
        bg={bg}
        textColor={textColor}
        value={value}
        defaultValue={uncontrolledDefault}
        onChange={handleChange}
        aria-describedby={selectProps?.['aria-describedby'] ?? fc['aria-describedby']}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </StyledNativeSelect>
      <DropdownIcon name={iconName} size="1.25rem" color="secondary" {...iconProps} />
    </NativeSelectRoot>
  )
}
