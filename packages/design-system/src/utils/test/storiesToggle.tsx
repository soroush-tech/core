/* eslint-disable react-refresh/only-export-components -- shared story scaffolding, not an HMR'd component module */
import { useState, type ChangeEvent, type ReactNode } from 'react'
import type { Decorator } from '@storybook/react-vite'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'

/** Args injected by {@link WithCheckedState} into a controlled toggle story. */
export interface ControlledArgs {
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

/** Owns `checked` state in a decorator and injects it — plus its `onChange` — via args. */
export const WithCheckedState: Decorator = (Story, ctx) => {
  const [checked, setChecked] = useState(false)
  return (
    <Story
      args={{
        ...ctx.args,
        checked,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked),
      }}
    />
  )
}

/** Palette tokens demoed by the shared "Colors" story across toggle controls. */
export const colorSwatches = [
  'default',
  'primary',
  'secondary',
  'success',
  'error',
  'info',
  'warning',
] as const

/**
 * Renders one labelled row per {@link colorSwatches} token; `controls(color)`
 * supplies the demo control(s) shown beside each label.
 */
export function ColorSwatchRows({
  controls,
}: Readonly<{ controls: (color: (typeof colorSwatches)[number]) => ReactNode }>) {
  return (
    <Flex flexDirection="column" gap={2}>
      {colorSwatches.map((color) => (
        <Flex key={color} flexDirection="row" alignItems="center" gap={3}>
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {color}
          </Typography>
          {controls(color)}
        </Flex>
      ))}
    </Flex>
  )
}
