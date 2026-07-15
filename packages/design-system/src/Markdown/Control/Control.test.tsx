import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Control } from './Control'
import { useMarkdownContext } from '../MarkdownContext'
import { TOOLBAR_ACTIONS } from '../const'

const bold = TOOLBAR_ACTIONS.find((action) => action.id === 'bold')!

function Probe({ at }: Readonly<{ at?: { start: number; end: number } }>) {
  const { dispatch, rememberSelection } = useMarkdownContext()
  return (
    <button
      type="button"
      onClick={() => {
        if (at) rememberSelection(at)
        dispatch(bold)
      }}
    >
      bold
    </button>
  )
}

describe('Control', () => {
  it('dispatches an action at the document end when no selection is known', () => {
    const onChange = vi.fn()
    render(
      <Control value="hi" onChange={onChange}>
        <Probe />
      </Control>
    )
    fireEvent.click(screen.getByText('bold'))
    expect(onChange).toHaveBeenCalledWith('hi **bold text**')
  })

  it('dispatches an action at the remembered selection', () => {
    const onChange = vi.fn()
    render(
      <Control value="hello" onChange={onChange}>
        <Probe at={{ start: 0, end: 5 }} />
      </Control>
    )
    fireEvent.click(screen.getByText('bold'))
    expect(onChange).toHaveBeenCalledWith('**hello**')
  })
})
