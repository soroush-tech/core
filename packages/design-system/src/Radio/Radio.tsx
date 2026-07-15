import { type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { useFormControl } from '../FormControl'
import {
  styled,
  type Theme,
  type PaletteColor,
  createShouldForwardProp,
  props,
  space,
  type SpaceProps,
} from '../index'
import { themeDefault } from '../utils/themeDefault'

export type RadioColor = PaletteColor
export type RadioSize = keyof Theme['sizes']

export interface RadioProps extends SpaceProps<Theme> {
  /** Controlled checked state. Must be paired with `onChange`. */
  checked?: boolean
  /** Disables the radio. */
  disabled?: boolean
  /** Stroke/fill color. `'default'` resolves to `theme.text.secondary`. Default: `'default'`. */
  color?: RadioColor
  /** Icon size. Default: `'medium'`. */
  size?: RadioSize
  /** Custom icon for the unchecked state. */
  icon?: ReactNode
  /** Custom icon for the checked state. */
  checkedIcon?: ReactNode
  /** Called when the user selects the radio. */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /** Forwarded to the underlying `<input>` for label association. */
  id?: string
  /** Marks the field as required in a form. */
  required?: boolean
  /** Radio group name — required for native group exclusivity. */
  name?: string
  /** Value submitted with the form when this radio is selected. */
  value?: string | number | readonly string[]
  /** Extra props spread onto the underlying `<input>` (e.g. `aria-label`, `tabIndex`). Explicit top-level props take priority. */
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  children?: ReactNode
  className?: string
  'data-testid'?: string
}

// Glyph size comes from theme.icon — mapped over theme.sizes, so augmenting a
// size key forces the matching icon size to be supplied by the theme.

// ─── Default icons ────────────────────────────────────────────────────────────

const UncheckedIcon = () => (
  <svg viewBox="0 0 18 18" width="1em" height="1em" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const CheckedIcon = () => (
  <svg viewBox="0 0 18 18" width="1em" height="1em" aria-hidden="true">
    <circle cx="9" cy="9" r="9" fill="currentColor" />
    <circle cx="9" cy="9" r="4" fill="white" />
  </svg>
)

// ─── Styled sub-components ────────────────────────────────────────────────────

const HiddenInput = styled('input', { name: 'Radio', slot: 'input', label: 'RadioInput' })({
  position: 'absolute',
  width: 0,
  height: 0,
  opacity: 0,
  margin: 0,
  padding: 0,
  pointerEvents: 'none',
})

const RadioIconWrapper = styled('span', {
  name: 'Radio',
  slot: 'icon',
  label: 'RadioIcon',
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: RadioSize }>(({ theme, size = themeDefault(theme, 'size', 'md') }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: theme.icon[size],
  // 0 (not 1) so the inline SVG's line box can't inflate the wrapper height —
  // keeps it square so the focus outline sits evenly on all sides.
  lineHeight: 0,
  transition: 'color 0.15s ease',
}))

// ─── Root styling functions ───────────────────────────────────────────────────

interface RadioRootProps extends SpaceProps<Theme> {
  color?: RadioColor
  size?: RadioSize
  disabled?: boolean
}

const shouldForwardProp = createShouldForwardProp([...props, 'color', 'size', 'disabled'])

const baseStyle = ({ disabled, theme }: RadioRootProps & { theme: Theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  position: 'relative' as const,
  cursor: disabled ? 'not-allowed' : 'pointer',
  gap: (theme?.space as Record<number, number>)?.[1],
  userSelect: 'none' as const,
  ...(disabled && { opacity: 0.5 }),
  // Both icon spans are always in the DOM. CSS toggles visibility via the
  // native :checked state so uncontrolled mode works without JS re-renders.
  '& input:not(:checked) ~ span > .rb-checked': { display: 'none' },
  '& input:checked ~ span > .rb-unchecked': { display: 'none' },
  '&:has(input:focus-visible) > span:first-of-type': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    borderRadius: '50%',
  },
})

const colorStyle = ({
  theme,
  color = themeDefault(theme, 'neutralColor', 'default'),
}: RadioRootProps & { theme: Theme }) => {
  return {
    color: color === 'default' ? theme.text.secondary : theme.palette[color].main,
  }
}

const RadioRoot = styled('label', {
  name: 'Radio',
  label: 'Radio',
  shouldForwardProp,
  systemProps: [space],
})<RadioRootProps>(baseStyle, colorStyle)

// ─── Public component ─────────────────────────────────────────────────────────

export function Radio({
  checked,
  disabled: disabledProp,
  color: colorProp,
  size: sizeProp,
  icon,
  checkedIcon,
  onChange,
  id: idProp,
  required: requiredProp,
  name,
  value,
  inputProps,
  children,
  className,
  'data-testid': dataTestid,
  ...spaceProps
}: Readonly<RadioProps>) {
  // Resolve form-field props through context (Form → FormControl → explicit). `color` is
  // resolved separately to keep Radio's own `'default'` domain; `error` has no visual here.
  const fc = useFormControl({
    id: idProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
  })
  const { id, disabled, required, size } = fc
  // Left unresolved when unset — the styled layer falls back to themeDefault(theme, 'neutralColor', 'default').
  const color = colorProp ?? fc.color
  const describedBy = inputProps?.['aria-describedby'] ?? fc['aria-describedby']

  return (
    <RadioRoot
      color={color}
      size={size}
      disabled={disabled}
      className={className}
      data-testid={dataTestid}
      {...spaceProps}
    >
      <HiddenInput
        {...inputProps}
        type="radio"
        checked={checked}
        disabled={disabled}
        id={id}
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        aria-describedby={describedBy}
      />
      <RadioIconWrapper size={size}>
        <span className="rb-unchecked">{icon ?? <UncheckedIcon />}</span>
        <span className="rb-checked">{checkedIcon ?? <CheckedIcon />}</span>
      </RadioIconWrapper>
      {children != null && <span>{children}</span>}
    </RadioRoot>
  )
}
