import { createElement, type ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormContext, type FormContextValue } from '../Form/FormContext'
import { FormControlContext, type FormControlContextValue } from './FormControlContext'
import { useFormControl } from './useFormControl'

const control = (overrides: Partial<FormControlContextValue> = {}): FormControlContextValue => ({
  id: 'field-1',
  helperId: 'field-1-helper',
  hasHelperText: false,
  setHasHelperText: () => {},
  ...overrides,
})

const withProviders =
  (form?: FormContextValue, ctrl?: FormControlContextValue) =>
  ({ children }: { children: ReactNode }) => {
    let tree = children
    if (ctrl) tree = createElement(FormControlContext.Provider, { value: ctrl }, tree)
    if (form) tree = createElement(FormContext.Provider, { value: form }, tree)
    return tree
  }

describe('useFormControl', () => {
  describe('defaults with no providers', () => {
    it('returns falsy/default values', () => {
      const { result } = renderHook(() => useFormControl())
      expect(result.current).toEqual({
        id: undefined,
        error: false,
        disabled: false,
        required: false,
        size: 'md',
        fullWidth: false,
        color: undefined,
        textColor: undefined,
        'aria-describedby': undefined,
      })
    })
  })

  describe('explicit overrides win', () => {
    it('overrides beat both contexts', () => {
      const { result } = renderHook(
        () =>
          useFormControl({
            id: 'explicit',
            error: true,
            disabled: false,
            required: true,
            size: 'lg',
            fullWidth: true,
            color: 'success',
            textColor: 'success',
          }),
        {
          wrapper: withProviders(
            {
              size: 'sm',
              color: 'primary',
              textColor: 'secondary',
              disabled: true,
              fullWidth: false,
            },
            control({
              error: false,
              disabled: true,
              required: false,
              size: 'sm',
              color: 'error',
              textColor: 'error',
            })
          ),
        }
      )
      expect(result.current).toMatchObject({
        id: 'explicit',
        error: true,
        disabled: false,
        required: true,
        size: 'lg',
        fullWidth: true,
        color: 'success',
        textColor: 'success',
      })
    })
  })

  describe('FormControl context applies when no override', () => {
    it('reads id, error, required, size, color from FormControl', () => {
      const { result } = renderHook(() => useFormControl(), {
        wrapper: withProviders(
          undefined,
          control({
            error: true,
            required: true,
            size: 'lg',
            fullWidth: true,
            color: 'info',
            textColor: 'info',
          })
        ),
      })
      expect(result.current).toMatchObject({
        id: 'field-1',
        error: true,
        required: true,
        size: 'lg',
        fullWidth: true,
        color: 'info',
        textColor: 'info',
      })
    })

    it('beats Form context', () => {
      const { result } = renderHook(() => useFormControl(), {
        wrapper: withProviders(
          { size: 'sm', color: 'primary', disabled: false, fullWidth: false },
          control({ size: 'lg', color: 'info', disabled: true, fullWidth: true })
        ),
      })
      expect(result.current).toMatchObject({
        size: 'lg',
        color: 'info',
        disabled: true,
        fullWidth: true,
      })
    })
  })

  describe('Form context applies for shared props', () => {
    it('reads disabled, size, fullWidth, color, textColor from Form', () => {
      const { result } = renderHook(() => useFormControl(), {
        wrapper: withProviders({
          size: 'lg',
          color: 'secondary',
          textColor: 'secondary',
          disabled: true,
          fullWidth: true,
        }),
      })
      expect(result.current).toMatchObject({
        size: 'lg',
        color: 'secondary',
        textColor: 'secondary',
        disabled: true,
        fullWidth: true,
      })
    })

    it('never reads error or required from Form context', () => {
      const { result } = renderHook(() => useFormControl(), {
        wrapper: withProviders({ disabled: true }),
      })
      expect(result.current.error).toBe(false)
      expect(result.current.required).toBe(false)
    })
  })

  describe('aria-describedby', () => {
    it('points at helperId only when a helper is present', () => {
      const { result } = renderHook(() => useFormControl(), {
        wrapper: withProviders(undefined, control({ hasHelperText: true })),
      })
      expect(result.current['aria-describedby']).toBe('field-1-helper')
    })

    it('is undefined when no helper is present', () => {
      const { result } = renderHook(() => useFormControl(), {
        wrapper: withProviders(undefined, control({ hasHelperText: false })),
      })
      expect(result.current['aria-describedby']).toBeUndefined()
    })
  })
})
