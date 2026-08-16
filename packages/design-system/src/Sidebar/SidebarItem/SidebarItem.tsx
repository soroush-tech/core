import { useContext, useEffect, type MouseEvent, type ReactNode } from 'react'
import { styled, type Theme, get } from '@soroush.tech/design-system'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon, type IconName } from '@soroush.tech/design-system/Icon'
import { Portal } from '@soroush.tech/design-system/Portal'
import { Pressable, type PressableProps } from '@soroush.tech/design-system/Pressable'
import { Typography } from '@soroush.tech/design-system/Typography'
import { alpha } from '@soroush.tech/design-system/utils'
import { SidebarContext, type SidebarAnchor, type SidebarItemVariant } from '../SidebarContext'

/** Density token - controls padding and font size. Resolves against `theme.sizes`. */
export type SidebarItemSize = keyof Theme['sizes']

export interface SidebarItemProps extends Omit<
  PressableProps,
  'children' | 'feedback' | 'activeOpacity' | 'size'
> {
  /** Icon shown in both the collapsed and open states - pinned to the anchored edge. */
  icon: IconName
  /** Accessible name; also the default visible content while open. */
  label: string
  /** Visual style - overrides the enclosing `Sidebar`'s `variant` (default `'text'`). */
  variant?: SidebarItemVariant
  /** Padding and font size - resolves against `theme.sizes`. Default: `'sm'`. */
  size?: SidebarItemSize
  /** Active state - drives `aria-pressed` and the selected fill. */
  isSelected?: boolean
  /**
   * Custom open-state content rendered instead of the label text (badges,
   * counts, ...) - or, under the enclosing `Sidebar`'s `hasPanel`, the content of
   * the panel column, shown while this item is selected.
   */
  children?: ReactNode
  /** Fired when the item is activated. */
  onSelect?: () => void
}

interface SidebarItemRootProps {
  anchor: SidebarAnchor
  isSelected?: boolean
  // Named apart from Pressable's own props so both reach the styled root:
  // Pressable draws the press feedback, this picks the resting look.
  itemVariant: SidebarItemVariant
  size: SidebarItemSize
  color: NonNullable<PressableProps['color']>
  disabled?: boolean
}

// The same density scale the rest of the library uses, so a rail lines up with
// the app's other controls - but without a button's uppercase / bold / tracking,
// which a navigation label has no business carrying.
const densityStyles = ({ theme, size }: SidebarItemRootProps & { theme: Theme }) => {
  const s = theme.sizes[size]
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: theme.space[s.paddingRight],
    fontSize: theme.fontSizes[s.fontSize],
    // Row height follows the padding alone, not the inherited leading.
    lineHeight: 1,
    // The rail animates its width, so for the whole transition the content is
    // laid out against a width narrower than it needs. Left to wrap, every label
    // would break onto a second line, double each row's height, and shift the
    // rows below - then snap back once the rail finished. Nothing wraps, so the
    // row height is fixed and Sidebar's overflowX clips the not-yet-visible text
    // instead. Set here rather than on the label so custom `children` are covered too.
    whiteSpace: 'nowrap' as const,
  }
}

// Content pins to the anchored edge so the icon holds its position while the
// rail opens and closes.
const layoutStyles = ({ anchor }: SidebarItemRootProps) => ({
  width: '100%',
  alignItems: 'center',
  justifyContent: anchor === 'right' ? 'flex-end' : 'flex-start',
})

// The resting look. Press feedback is Pressable's job - these add only the hover
// fade and the selected state on top of it. A transparent border on the
// non-outlined variants keeps every item the same size.
const stateStyles = ({
  theme,
  color,
  isSelected,
  itemVariant,
  disabled,
}: SidebarItemRootProps & { theme: Theme }) => {
  const { main } = theme.palette[color]
  const outlined = itemVariant === 'outlined'
  const base = {
    border: `${theme.borderWidths.thin} solid ${
      outlined ? get(theme, 'border.light') : 'transparent'
    }`,
    borderRadius: theme.radii.sq,
    color: get(theme, 'text.primary'),
    // Two selectors: `:disabled` never matches the element Pressable renders by
    // default, which carries `aria-disabled` instead.
    '&:disabled, &[aria-disabled="true"]': { opacity: 0.5 },
  }
  // Suppressed rather than guarded by `:not(:disabled)`, which a non-form element
  // defeats - the same reason Pressable gates its press feedback on the prop.
  const hoverFill = (backgroundColor: string) =>
    disabled ? {} : { '&:hover': { backgroundColor } }

  // plain carries selection in the text color alone - no fill, no feedback.
  if (itemVariant === 'plain') {
    return { ...base, color: isSelected ? main : get(theme, 'text.primary') }
  }

  if (isSelected) {
    return {
      ...base,
      backgroundColor: alpha(main, 0.16),
      color: main,
      ...(outlined && { borderColor: main }),
      ...hoverFill(alpha(main, 0.24)),
      // Pressable's press tint is calibrated for an unfilled surface; a selected
      // item is already filled, so it needs a stronger one.
      ...(disabled ? {} : { '&:active': { backgroundColor: alpha(main, 0.24) } }),
    }
  }

  // Unselected items let Pressable's own press tint through untouched.
  return { ...base, ...hoverFill(alpha(main, 0.08)) }
}

const SidebarItemRoot = styled(Pressable, {
  name: 'SidebarItem',
  label: 'SidebarItem',
  shouldForwardProp: (prop) =>
    prop !== 'anchor' && prop !== 'isSelected' && prop !== 'itemVariant' && prop !== 'size',
})<SidebarItemRootProps>(densityStyles, layoutStyles, stateStyles)

/**
 * One entry of a `Sidebar`: an icon pinned to the anchored edge, plus content
 * shown while the rail is open - the `label` by default, or custom `children`
 * (on a right-anchored rail the content renders to the icon's left). Built on
 * `Pressable`, so it is a real button carrying nothing but the styling declared
 * here - no inherited uppercase, weight, or tracking.
 */
export function SidebarItem({
  icon,
  label,
  variant,
  size = 'sm',
  color = 'primary',
  children,
  onSelect,
  onClick,
  isSelected,
  ...rest
}: Readonly<SidebarItemProps>) {
  const {
    isOpen,
    anchor,
    variant: railVariant,
    hasPanel,
    panelId,
    panelNode,
    setPanelLabel,
  } = useContext(SidebarContext)
  const resolvedVariant = variant ?? railVariant
  // With a panel, children belong to it, so the row falls back to the label.
  const ownsPanel = hasPanel && children != null
  const isPorting = ownsPanel && (isSelected ?? false)

  // Only the name is published upward - the content is ported, not lifted. The
  // cleanup runs before the newly selected item's effect, so handing the panel
  // from one item to the next leaves the winner's label in place.
  useEffect(() => {
    if (!isPorting || !setPanelLabel) {
      return
    }
    setPanelLabel(label)
    return () => setPanelLabel(null)
  }, [isPorting, label, setPanelLabel])

  // HTMLElement, not HTMLButtonElement: Pressable renders a div by default, and
  // `as` can make it any tag - matching the handler type Pressable itself uses.
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event)
    onSelect?.()
  }

  return (
    <>
      <SidebarItemRoot
        // plain refuses press feedback too, matching its lack of a hover fill.
        feedback={resolvedVariant === 'plain' ? 'none' : 'highlight'}
        color={color}
        size={size}
        itemVariant={resolvedVariant}
        isSelected={isSelected}
        anchor={anchor}
        aria-label={label}
        aria-pressed={isSelected ?? false}
        // An item driving a panel is a disclosure too. aria-controls points at the
        // panel only while this item is porting into it - the element stays
        // mounted either way, but collapses when empty.
        {...(ownsPanel && {
          'aria-expanded': isSelected ?? false,
          'aria-controls': isPorting ? panelId : undefined,
        })}
        onClick={handleClick}
        {...rest}
      >
        <Flex
          as="span"
          flexDirection={anchor === 'right' ? 'row-reverse' : 'row'}
          alignItems="center"
          gap={2}
          // Nothing wraps now, so mid-transition the content is wider than the rail.
          // Left shrinkable, the flex line would compress and squeeze `Icon` - which
          // sets width/height but no flex-shrink - off its position. Pinned, the
          // content keeps its natural width and Sidebar's overflowX clips it instead.
          flexShrink={0}
        >
          <Icon name={icon} size="1.25rem" color="inherit" />
          {isOpen &&
            ((ownsPanel ? null : children) ?? (
              <Typography as="span" variant="inherit" m={0}>
                {label}
              </Typography>
            ))}
        </Flex>
      </SidebarItemRoot>
      {/* Ported rather than lifted, so the panel's content stays declared -
          and mounted - here: the context, state, and handlers it closes over are
          this item's, however deeply the item itself is nested in the rail. */}
      {isPorting && panelNode && <Portal container={panelNode}>{children}</Portal>}
    </>
  )
}
