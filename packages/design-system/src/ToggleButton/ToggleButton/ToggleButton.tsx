import { useContext, type MouseEvent } from 'react'
import { ToggleButtonGroupContext, type ToggleButtonValue } from '../ToggleButtonGroupContext'
import { Button, type ButtonProps } from '@soroush.tech/design-system/Button'
import { ButtonGroupContext } from '@soroush.tech/design-system/ButtonGroup'
import { styled, type Theme, get } from '@soroush.tech/design-system'
import { useTheme, themeDefault } from '@soroush.tech/design-system/theme'
import { alpha } from '@soroush.tech/design-system/utils'

export interface ToggleButtonProps extends Omit<
  ButtonProps,
  'variant' | 'href' | 'target' | 'rel' | 'value' | 'onChange'
> {
  /** The value associated with the button inside a `ToggleButtonGroup`. */
  value: ToggleButtonValue
  /** Active state — inferred from the group's value when omitted. Drives `aria-pressed`. */
  isSelected?: boolean
  /** Fired with the button's `value` when toggled. */
  onChange?: (value: ToggleButtonValue) => void
}

interface ToggleButtonRootProps {
  isSelected?: boolean
  color?: NonNullable<ButtonProps['color']>
}

// Layered over Button's `outlined` styles (the wrapper's styles win). Selected:
// translucent fill in the active color. Unselected: neutral text and border —
// only the colors change, so Button keeps the border width and hover/active fades.
const stateStyles = ({
  theme,
  color = themeDefault(theme, 'neutralColor', 'default'),
  isSelected,
}: ToggleButtonRootProps & { theme: Theme }) => {
  const c = theme.palette[color]
  if (isSelected) {
    return {
      backgroundColor: alpha(c.main, 0.16),
      color: c.main,
      borderColor: c.main,
      '&:hover:not(:disabled)': { backgroundColor: alpha(c.main, 0.24) },
      '&:active:not(:disabled)': { backgroundColor: alpha(c.main, 0.24) },
    }
  }
  return {
    color: get(theme, 'text.primary'),
    borderColor: get(theme, 'border.light'),
  }
}

const ToggleButtonRoot = styled(Button, {
  name: 'ToggleButton',
  label: 'ToggleButton',
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<ToggleButtonRootProps>(stateStyles)

const isValueSelected = (
  value: ToggleButtonValue,
  groupValue: ToggleButtonValue | ToggleButtonValue[] | null | undefined
) => {
  if (groupValue == null) return false
  return Array.isArray(groupValue) ? groupValue.includes(value) : groupValue === value
}

export function ToggleButton({
  value,
  isSelected,
  color,
  onChange,
  onClick,
  type = 'button',
  ...rest
}: Readonly<ToggleButtonProps>) {
  const group = useContext(ToggleButtonGroupContext)
  // Size / disabled / fullWidth are resolved by Button itself; color is resolved
  // here too because the selected-state styles need it. Explicit props win.
  const buttonGroup = useContext(ButtonGroupContext)
  const theme = useTheme()
  const selected = isSelected ?? isValueSelected(value, group.value)
  const resolvedColor = color ?? buttonGroup.color ?? themeDefault(theme, 'neutralColor', 'default')

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    group.onToggle?.(value)
    onChange?.(value)
  }

  return (
    <ToggleButtonRoot
      type={type}
      variant="outlined"
      isSelected={selected}
      color={resolvedColor}
      aria-pressed={selected}
      onClick={handleClick}
      value={value}
      {...rest}
    />
  )
}
