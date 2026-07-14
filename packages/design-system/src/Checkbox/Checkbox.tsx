import { useEffect, useRef, type ChangeEvent, type ReactNode } from 'react'
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

export type CheckboxColor = PaletteColor
export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends SpaceProps<Theme> {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean
  /** Disables the checkbox. */
  disabled?: boolean
  /** Stroke/fill color. `'default'` resolves to `theme.text.secondary`. Default: `'default'`. */
  color?: CheckboxColor
  /** Icon size. Default: `'medium'`. */
  size?: CheckboxSize
  /** Stretches the root to `width: 100%`. Default: `false`. */
  fullWidth?: boolean
  /** Displays the indeterminate state (dash icon). Takes priority over `checked`. */
  indeterminate?: boolean
  /** Custom icon for the unchecked state. */
  icon?: ReactNode
  /** Custom icon for the checked state. */
  checkedIcon?: ReactNode
  /** Called when the user toggles the checkbox. */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /** Forwarded to the underlying `<input>` for label association. */
  id?: string
  /** Marks the field as required in a form. */
  required?: boolean
  name?: string
  value?: string | number | readonly string[]
  children?: ReactNode
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'data-testid'?: string
}

// ─── Icon size map ────────────────────────────────────────────────────────────

const ICON_SIZE: Record<CheckboxSize, string> = {
  sm: '16px',
  md: '20px',
  lg: '24px',
}

// ─── Default icons ────────────────────────────────────────────────────────────

const UncheckedIcon = () => (
  <svg viewBox="0 0 18 18" width="1em" height="1em" fill="none" aria-hidden="true">
    <rect x="1.5" y="1.5" width="15" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const CheckedIcon = () => (
  <svg viewBox="0 0 18 18" width="1em" height="1em" aria-hidden="true">
    <rect width="18" height="18" rx="3" fill="currentColor" />
    <path
      d="M4.5 9L7.5 12L13.5 6"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const IndeterminateIcon = () => (
  <svg viewBox="0 0 18 18" width="1em" height="1em" aria-hidden="true">
    <rect width="18" height="18" rx="3" fill="currentColor" />
    <rect x="4.5" y="8.1" width="9" height="1.8" rx="0.9" fill="white" />
  </svg>
)

// ─── Styled sub-components ────────────────────────────────────────────────────

const HiddenInput = styled('input')({
  position: 'absolute',
  width: 0,
  height: 0,
  opacity: 0,
  margin: 0,
  padding: 0,
  pointerEvents: 'none',
})

const CheckboxIconWrapper = styled('span', {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: CheckboxSize }>(({ size = 'md' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: ICON_SIZE[size],
  // 0 (not 1) so the inline SVG's line box can't inflate the wrapper height —
  // keeps it square so the focus outline sits evenly on all sides.
  lineHeight: 0,
  transition: 'color 0.15s ease',
}))

// ─── Root styling functions ───────────────────────────────────────────────────

interface CheckboxRootProps extends SpaceProps<Theme> {
  color?: CheckboxColor
  size?: CheckboxSize
  disabled?: boolean
  fullWidth?: boolean
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'color',
  'size',
  'disabled',
  'fullWidth',
])

const baseStyle = ({ disabled, theme }: CheckboxRootProps & { theme: Theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  position: 'relative' as const,
  cursor: disabled ? 'not-allowed' : 'pointer',
  gap: (theme?.space as Record<number, number>)?.[1],
  userSelect: 'none' as const,
  ...(disabled && { opacity: 0.5 }),
  // All three icon spans are always in the DOM. CSS toggles visibility via
  // native :checked / :indeterminate — no JS re-renders needed. Indeterminate
  // selectors come last so they override the :checked rules via cascade.
  '& input:not(:checked):not(:indeterminate) ~ span > .cb-checked': { display: 'none' },
  '& input:not(:checked):not(:indeterminate) ~ span > .cb-indeterminate': { display: 'none' },
  '& input:checked:not(:indeterminate) ~ span > .cb-unchecked': { display: 'none' },
  '& input:checked:not(:indeterminate) ~ span > .cb-indeterminate': { display: 'none' },
  '& input:indeterminate ~ span > .cb-unchecked': { display: 'none' },
  '& input:indeterminate ~ span > .cb-checked': { display: 'none' },
  '&:has(input:focus-visible) > span:first-of-type': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    borderRadius: '3px',
  },
})

const colorStyle = ({ color = 'default', theme }: CheckboxRootProps & { theme: Theme }) => {
  return {
    color: color === 'default' ? theme.text.secondary : theme.palette[color].main,
  }
}

const fullWidthStyle = ({ fullWidth }: CheckboxRootProps) =>
  fullWidth ? ({ display: 'flex', width: '100%' } as const) : {}

const CheckboxRoot = styled('label', { shouldForwardProp })<CheckboxRootProps>(
  baseStyle,
  colorStyle,
  fullWidthStyle,
  space
)

// ─── Public component ─────────────────────────────────────────────────────────

export function Checkbox({
  checked,
  defaultChecked,
  disabled: disabledProp,
  color: colorProp,
  size: sizeProp,
  fullWidth: fullWidthProp,
  indeterminate = false,
  icon,
  checkedIcon,
  onChange,
  id: idProp,
  required: requiredProp,
  name,
  value,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'data-testid': dataTestid,
  ...spaceProps
}: Readonly<CheckboxProps>) {
  // Resolve form-field props through context (Form → FormControl → explicit). `color` is
  // resolved separately to keep Checkbox's own `'default'` domain; `error` has no visual here.
  const fc = useFormControl({
    id: idProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
    fullWidth: fullWidthProp,
  })
  const { id, disabled, required, size, fullWidth } = fc
  const color = colorProp ?? fc.color ?? 'default'
  const describedBy = ariaDescribedby ?? fc['aria-describedby']

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current!.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <CheckboxRoot
      color={color}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      data-testid={dataTestid}
      {...spaceProps}
    >
      <HiddenInput
        ref={inputRef}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={id}
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        data-indeterminate={indeterminate || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={describedBy}
      />
      <CheckboxIconWrapper size={size}>
        <span className="cb-unchecked">{icon ?? <UncheckedIcon />}</span>
        <span className="cb-checked">{checkedIcon ?? <CheckedIcon />}</span>
        <span className="cb-indeterminate">
          <IndeterminateIcon />
        </span>
      </CheckboxIconWrapper>
      {children != null && <span>{children}</span>}
    </CheckboxRoot>
  )
}
