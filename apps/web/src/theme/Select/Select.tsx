import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useFormControl } from 'src/theme/FormControl'
import { Icon, type IconName, type IconProps } from 'src/theme/Icon'
import { Popover } from 'src/theme/Popover'
import { NativeSelect, type NativeSelectOption } from 'src/theme/NativeSelect'
import { type MenuItemProps } from 'src/theme/MenuItem'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  variant,
  get,
  system,
  type SpaceProps,
  type LayoutProps,
} from 'src/theme'
import { useSelectPopover } from 'src/theme/Select/hooks/useSelectPopover'
import { getOptionsFromChildren } from 'src/theme/Select/utils/getOptionsFromChildren'
import {
  getNextEnabledIndex,
  getEdgeEnabledIndex,
} from 'src/theme/Select/utils/getNextEnabledIndex'
import { isOptionSelected, type SelectValue } from 'src/theme/Select/utils/isOptionSelected'
import { computeNextValue } from 'src/theme/Select/utils/computeNextValue'
import { resolveDisplayLabel } from 'src/theme/Select/utils/resolveDisplayLabel'

export type { SelectValue }
export type SelectColor = keyof Theme['palette']
export type SelectTextColor = keyof Theme['text']
export type SelectBackgroundToken = keyof Theme['background']
export type SelectVariant = 'default' | 'outlined' | 'text' | 'underline'
export type SelectSize = keyof Theme['sizes']

export interface SelectProps
  extends SpaceProps<Theme>, Pick<LayoutProps<Theme>, 'width' | 'minWidth' | 'maxWidth'> {
  /** `MenuItem` children — one per option. */
  children: ReactNode
  /** Render a native `<select>` (delegates to `NativeSelect`, single-select) instead of the custom listbox. */
  native?: boolean
  /** Allow selecting several options — `value` becomes an array. Ignored on the native path. */
  multiple?: boolean
  /** Size the trigger to the current selection instead of reserving the widest option's width. When `false` (default) the trigger keeps a stable width, avoiding layout shift on selection. */
  autoWidth?: boolean
  /** Controlled value — a single option value, or an array when `multiple`. */
  value?: SelectValue
  /** Uncontrolled initial value. */
  defaultValue?: SelectValue
  /** Fired with the next value whenever the selection changes. */
  onChange?: (value: SelectValue) => void
  /** Controlled open state of the listbox. */
  open?: boolean
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  /** Empty-state label shown in the trigger while nothing is selected. */
  placeholder?: string
  /** Override the trigger's rendered content for the current value. */
  renderValue?: (value: SelectValue) => ReactNode
  /** Corner radius — applies only to `default` and `outlined` variants. */
  borderRadius?: keyof Theme['radii']
  /** Focus/active border color — resolves to `theme.palette[color].main`. Default: `'primary'`. */
  color?: SelectColor
  /** Text color of the trigger value — resolves against `theme.text`. Default: `'primary'`. */
  textColor?: SelectTextColor
  /** Background color — resolves against `theme.background`. Default: `'terminal'`. */
  bg?: SelectBackgroundToken
  disabled?: boolean
  error?: boolean
  fullWidth?: boolean
  required?: boolean
  /** Controls padding and font size. Default: `'md'`. */
  size?: SelectSize
  /** Visual style — mirrors `TextInput`/`NativeSelect`. Default: `'default'`. */
  variant?: SelectVariant
  /** Dropdown affordance icon. Default: `'expand_more'` / `'expand_less'` when open. */
  iconName?: IconName
  iconProps?: Omit<IconProps, 'name'>
  id?: string
  name?: string
  /** Labels the trigger for assistive tech (id of a visible label element). */
  labelId?: string
  'aria-label'?: string
  className?: string
  'data-testid'?: string
}

// ─── Trigger ────────────────────────────────────────────────────────────────

interface TriggerProps
  extends SpaceProps<Theme>, Pick<LayoutProps<Theme>, 'width' | 'minWidth' | 'maxWidth'> {
  variant: SelectVariant
  sizeToken: SelectSize
  color: SelectColor
  textColor?: SelectTextColor
  bg: SelectBackgroundToken
  error: boolean
  disabled: boolean
  fullWidth: boolean
  borderRadius?: keyof Theme['radii']
  open: boolean
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'variant',
  'sizeToken',
  'color',
  'textColor',
  'bg',
  'error',
  'disabled',
  'fullWidth',
  'borderRadius',
  'open',
])

const baseStyle = ({ theme }: TriggerProps & { theme: Theme }) => ({
  position: 'relative' as const,
  boxSizing: 'border-box' as const,
  display: 'inline-flex',
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  gap: theme.space[1],
  cursor: 'pointer',
  outline: 'none',
  textAlign: 'left' as const,
  transition: 'border-color 0.15s ease',
})

// Mirrors NativeSelect / TextInput variant rules so mixed forms look uniform.
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

const borderRadiusStyle = ({
  variant: v,
  borderRadius,
  theme,
}: TriggerProps & { theme: Theme }) => {
  if (v === 'underline' || v === 'text' || !borderRadius) return {}
  return { borderRadius: get(theme, `radii.${borderRadius}`) }
}

const colorBorder = ({ color, error, theme }: TriggerProps & { theme: Theme }) => ({
  borderColor: error ? get(theme, 'palette.error.main') : get(theme, `palette.${color}.light`),
})

// The trigger is itself focusable, so drive the active border from its own focus/open state.
const activeBorder = ({ color, error, open, theme }: TriggerProps & { theme: Theme }) => {
  const activeColor = error ? get(theme, 'palette.error.main') : get(theme, `palette.${color}.main`)
  return {
    ...(open ? { borderColor: activeColor } : {}),
    '&:focus': { borderColor: activeColor },
    '&:focus-visible': {
      outline: `2px solid ${get(theme, 'palette.primary.main')}`,
      outlineOffset: '2px',
    },
  }
}

// The trigger text defaults to the accent color's `main`; an explicit `textColor` wins.
// The `text` variant is chromeless, so its box stays transparent.
const backgroundStyle = ({
  color,
  textColor,
  bg,
  variant: v,
  theme,
}: TriggerProps & { theme: Theme }) => ({
  backgroundColor: v === 'text' ? 'transparent' : get(theme, `background.${bg}`),
  color: textColor ? get(theme, `text.${textColor}`) : get(theme, `palette.${color}.main`),
  fontFamily: get(theme, 'fonts.body'),
  fontSize: get(theme, 'fontSizes.1'),
  lineHeight: get(theme, 'lineHeights.base'),
})

const sizeVariants = ({ theme, sizeToken }: TriggerProps & { theme: Theme }) => {
  const s = theme.sizes[sizeToken]
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: theme.space[s.paddingRight],
    fontSize: theme.fontSizes[s.fontSize],
  }
}

const layoutStyles = ({ fullWidth, disabled }: TriggerProps) => ({
  // Without `fullWidth`, align to the start so a flex/grid parent (e.g. a `Flex` column,
  // which stretches by default) doesn't stretch the trigger to full width.
  ...(fullWidth
    ? ({ display: 'flex', width: '100%' } as const)
    : ({ alignSelf: 'flex-start' } as const)),
  ...(disabled ? ({ opacity: 0.5, cursor: 'not-allowed' } as const) : {}),
})

const widthStyles = system({ width: true, minWidth: true, maxWidth: true })

const Trigger = styled('div', { label: 'Select', shouldForwardProp })<TriggerProps>(
  baseStyle,
  variantStyles,
  borderRadiusStyle,
  colorBorder,
  activeBorder,
  backgroundStyle,
  sizeVariants,
  layoutStyles,
  space,
  widthStyles
)

// The value area reserves the widest option's width via a hidden ghost stack, so the
// trigger doesn't resize — and shift the layout — as the selection changes. `autoWidth`
// opts into sizing to the current content instead.
const ValueArea = styled('span', {
  shouldForwardProp: (prop: string) => prop !== 'autoWidth',
})<{ autoWidth: boolean }>(({ autoWidth }) => ({
  flex: 1,
  minWidth: 0,
  display: autoWidth ? 'block' : 'inline-grid',
  // Overlap the ghost stack and the visible value in a single grid cell.
  '& > *': { gridArea: '1 / 1' },
}))

const ValueGhost = styled('span')({
  height: 0,
  overflow: 'hidden',
  visibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '& > span': { whiteSpace: 'nowrap' },
})

// The placeholder inherits the trigger's `textColor` (not dimmed), so an empty field
// reads in the same color as a selected value, matching NativeSelect.
const TriggerValue = styled('span')({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

// ─── Popover ──────────────────────────────────────────────────────────────────

const ListBox = styled('ul')(({ theme }) => ({
  margin: 0,
  padding: `${theme.space[1]} 0`,
  width: '100%',
  maxHeight: '16rem',
  overflowY: 'auto',
  listStyle: 'none',
}))

// ─── Component ────────────────────────────────────────────────────────────────

export function Select({
  children,
  native = false,
  multiple = false,
  autoWidth = false,
  value: valueProp,
  defaultValue,
  onChange,
  open: openProp,
  defaultOpen,
  onOpen,
  onClose,
  placeholder,
  renderValue,
  borderRadius,
  color: colorProp,
  textColor: textColorProp,
  bg = 'terminal',
  disabled: disabledProp,
  error: errorProp,
  fullWidth: fullWidthProp,
  required: requiredProp,
  size: sizeProp,
  variant: variantProp = 'default',
  iconName,
  iconProps,
  id: idProp,
  name,
  labelId,
  'aria-label': ariaLabel,
  className,
  'data-testid': dataTestid,
  ...spaceProps
}: Readonly<SelectProps>) {
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
  // Left undefined so the trigger and rows fall back to the accent color's `main`.
  const textColor = fc.textColor

  const options = getOptionsFromChildren(children)

  const isControlledValue = valueProp !== undefined
  const [internalValue, setInternalValue] = useState<SelectValue>(
    defaultValue ?? (multiple ? [] : '')
  )
  const rawValue = isControlledValue ? valueProp : internalValue
  // Keep the value shape in sync with `multiple` — it can be toggled after mount, or the
  // provided value/defaultValue may not match — so selection logic always sees the right type.
  const value: SelectValue = multiple
    ? Array.isArray(rawValue)
      ? rawValue
      : []
    : Array.isArray(rawValue)
      ? ''
      : rawValue

  // Native path: delegate to NativeSelect (single-select) with derived string options.
  if (native) {
    const nativeOptions: NativeSelectOption[] = options.map((option) => ({
      value: option.value,
      label: typeof option.label === 'string' ? option.label : String(option.label),
    }))
    return (
      <NativeSelect
        options={nativeOptions}
        value={Array.isArray(valueProp) ? undefined : valueProp}
        defaultValue={Array.isArray(defaultValue) ? undefined : defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        borderRadius={borderRadius}
        color={colorProp}
        textColor={textColorProp}
        bg={bg}
        disabled={disabledProp}
        error={errorProp}
        fullWidth={fullWidthProp}
        required={requiredProp}
        size={sizeProp}
        variant={variantProp}
        iconName={iconName}
        iconProps={iconProps}
        id={idProp}
        name={name}
        className={className}
        data-testid={dataTestid}
        {...spaceProps}
      />
    )
  }

  return (
    <NonNativeSelect
      options={options}
      value={value}
      onChangeValue={(next) => {
        if (!isControlledValue) {
          setInternalValue(next)
        }
        onChange?.(next)
      }}
      multiple={multiple}
      autoWidth={autoWidth}
      openProp={openProp}
      defaultOpen={defaultOpen}
      onOpen={onOpen}
      onClose={onClose}
      placeholder={placeholder}
      renderValue={renderValue}
      borderRadius={borderRadius}
      color={color}
      textColor={textColor}
      bg={bg}
      error={error}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      size={size}
      variant={variantProp}
      iconName={iconName}
      iconProps={iconProps}
      id={id}
      name={name}
      labelId={labelId}
      ariaLabel={ariaLabel}
      ariaDescribedby={fc['aria-describedby']}
      className={className}
      dataTestid={dataTestid}
      spaceProps={spaceProps}
    >
      {children}
    </NonNativeSelect>
  )
}

// Split out so hooks (popover, highlight) only run for the interactive listbox path —
// the native branch returns before any of them, keeping the rules of hooks satisfied.
interface NonNativeSelectProps {
  children: ReactNode
  options: ReturnType<typeof getOptionsFromChildren>
  value: SelectValue
  onChangeValue: (value: SelectValue) => void
  multiple: boolean
  autoWidth: boolean
  openProp?: boolean
  defaultOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  placeholder?: string
  renderValue?: (value: SelectValue) => ReactNode
  borderRadius?: keyof Theme['radii']
  color: SelectColor
  textColor?: SelectTextColor
  bg: SelectBackgroundToken
  error: boolean
  disabled: boolean
  required: boolean
  fullWidth: boolean
  size: SelectSize
  variant: SelectVariant
  iconName?: IconName
  iconProps?: Omit<IconProps, 'name'>
  id?: string
  name?: string
  labelId?: string
  ariaLabel?: string
  ariaDescribedby?: string
  className?: string
  dataTestid?: string
  spaceProps: SpaceProps<Theme>
}

function NonNativeSelect({
  children,
  options,
  value,
  autoWidth,
  onChangeValue,
  multiple,
  openProp,
  defaultOpen,
  onOpen,
  onClose,
  placeholder,
  renderValue,
  borderRadius,
  color,
  textColor,
  bg,
  error,
  disabled,
  required,
  fullWidth,
  size,
  variant: variantProp,
  iconName,
  iconProps,
  id,
  name,
  labelId,
  ariaLabel,
  ariaDescribedby,
  className,
  dataTestid,
  spaceProps,
}: Readonly<NonNativeSelectProps>) {
  // The trigger element is kept in state (not a ref) so it can drive Popover's
  // `anchorEl` without reading a ref during render.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const baseId = useId()
  const listboxId = `${baseId}-listbox`

  const { open, openMenu, closeMenu } = useSelectPopover({
    open: openProp,
    defaultOpen,
    onOpen,
    onClose,
  })

  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const getInitialHighlight = () => {
    if (!Array.isArray(value)) {
      const current = options.findIndex((option) => option.value === value && !option.disabled)
      if (current !== -1) {
        return current
      }
    }
    return getEdgeEnabledIndex(options, 'first')
  }

  const openWithHighlight = () => {
    setHighlightedIndex(getInitialHighlight())
    openMenu()
  }

  const selectValue = (optionValue: string | number) => {
    onChangeValue(computeNextValue(value, optionValue))
    setHighlightedIndex(options.findIndex((option) => option.value === optionValue))
    if (!multiple) {
      closeMenu()
    }
  }

  const selectHighlighted = () => {
    const option = options[highlightedIndex]
    if (option && !option.disabled) {
      selectValue(option.value)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (open) {
          setHighlightedIndex((index) => getNextEnabledIndex(options, index, 1))
        } else {
          openWithHighlight()
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (open) {
          setHighlightedIndex((index) => getNextEnabledIndex(options, index, -1))
        } else {
          openWithHighlight()
        }
        break
      case 'Home':
        if (open) {
          event.preventDefault()
          setHighlightedIndex(getEdgeEnabledIndex(options, 'first'))
        }
        break
      case 'End':
        if (open) {
          event.preventDefault()
          setHighlightedIndex(getEdgeEnabledIndex(options, 'last'))
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open) {
          selectHighlighted()
        } else {
          openWithHighlight()
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          closeMenu()
        }
        break
      default:
        break
    }
  }

  const handleTriggerClick = () => {
    if (disabled) {
      return
    }
    if (open) {
      closeMenu()
    } else {
      openWithHighlight()
    }
  }

  // Focus leaving the trigger closes the menu. Clicks inside the popover call
  // preventDefault on mousedown, so they never blur the trigger.
  const handleBlur = () => {
    if (open) {
      closeMenu()
    }
  }

  const display = renderValue ? renderValue(value) : resolveDisplayLabel(options, value)
  const showPlaceholder = !renderValue && resolveDisplayLabel(options, value) === null
  const activeDescendant =
    open && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined

  const childArray = Children.toArray(children)
  const isOptionChild = (child: ReactNode) =>
    isValidElement(child) && (child.props as MenuItemProps).value !== undefined
  const renderedItems = childArray.map((child, position) => {
    if (!isOptionChild(child)) {
      return child
    }
    // Options keep source order, so the count of preceding option children is this row's index.
    const index = childArray.slice(0, position).filter(isOptionChild).length
    const option = options[index]
    // Select's color/textColor are defaults — an item's own props override them.
    const childProps = (child as ReactElement<MenuItemProps>).props
    return cloneElement(child as ReactElement<MenuItemProps>, {
      id: `${listboxId}-option-${index}`,
      selected: isOptionSelected(value, option.value),
      highlighted: index === highlightedIndex,
      multiple,
      size,
      color: childProps.color ?? color,
      textColor: childProps.textColor ?? textColor,
      onSelect: selectValue,
    })
  })

  return (
    <>
      <Trigger
        ref={setAnchorEl}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={activeDescendant}
        aria-labelledby={labelId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={error || undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        variant={variantProp}
        sizeToken={size}
        color={color}
        textColor={textColor}
        bg={bg}
        error={error}
        disabled={disabled}
        fullWidth={fullWidth}
        borderRadius={borderRadius}
        open={open}
        id={id}
        className={className}
        data-testid={dataTestid}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...spaceProps}
      >
        <ValueArea autoWidth={autoWidth}>
          {!autoWidth && (
            <ValueGhost aria-hidden>
              {options.map((option, index) => (
                <span key={index}>{option.label}</span>
              ))}
              {placeholder !== undefined && <span>{placeholder}</span>}
            </ValueGhost>
          )}
          <TriggerValue>{showPlaceholder ? (placeholder ?? '​') : display}</TriggerValue>
        </ValueArea>
        <Icon
          name={iconName ?? (open ? 'expand_less' : 'expand_more')}
          size="1.25rem"
          color="secondary"
          {...iconProps}
        />
      </Trigger>
      {name !== undefined && (
        <input
          type="hidden"
          name={name}
          value={Array.isArray(value) ? value.join(',') : String(value)}
        />
      )}
      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={closeMenu}
        disableScrollLock
        disableAriaHidden
        shouldAutoFocus={false}
        shouldTrapFocus={false}
        shouldEnforceFocus={false}
        shouldRestoreFocus={false}
        slotProps={{
          paper: { p: 0, bg, borderRadius, style: { minWidth: anchorEl?.offsetWidth } },
        }}
      >
        <ListBox
          role="listbox"
          id={listboxId}
          aria-multiselectable={multiple || undefined}
          aria-labelledby={labelId}
          onMouseDown={(event) => event.preventDefault()}
        >
          {renderedItems}
        </ListBox>
      </Popover>
    </>
  )
}
