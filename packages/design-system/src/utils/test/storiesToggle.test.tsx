import { type ChangeEvent, type ReactNode } from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from './renderWithTheme'
import {
  ColorSwatchRows,
  WithCheckedState,
  colorSwatches,
  type ControlledArgs,
} from './storiesToggle'

// WithCheckedState is a Storybook decorator: (Story, ctx) => <Story args={...} />.
// Narrow it to the shape this test drives so it can be exercised outside Storybook.
type DecoratorCall = (
  Story: (props: { args: ControlledArgs }) => ReactNode,
  ctx: { args: Record<string, unknown> }
) => ReactNode
const callDecorator = WithCheckedState as unknown as DecoratorCall

const ToggleProbe = ({ args }: { args: ControlledArgs }) => (
  <button
    type="button"
    onClick={() =>
      args.onChange({
        target: { checked: !args.checked },
      } as unknown as ChangeEvent<HTMLInputElement>)
    }
  >
    state:{String(args.checked)}
  </button>
)

const Harness = () => callDecorator(ToggleProbe, { args: {} })

describe('storiesToggle', () => {
  it('ColorSwatchRows renders a labelled row per swatch and passes each color to controls', () => {
    const seen: string[] = []
    renderWithTheme(
      <ColorSwatchRows
        controls={(color) => {
          seen.push(color)
          return <span data-testid={`control-${color}`} />
        }}
      />
    )

    expect(seen).toEqual([...colorSwatches])
    colorSwatches.forEach((color) => {
      expect(screen.getByText(color)).toBeInTheDocument()
      expect(screen.getByTestId(`control-${color}`)).toBeInTheDocument()
    })
  })

  it('WithCheckedState seeds checked=false and toggles it through the injected onChange', () => {
    renderWithTheme(<Harness />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('state:false')

    fireEvent.click(button)
    expect(button).toHaveTextContent('state:true')
  })
})
