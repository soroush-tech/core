import {
  useRef,
  useLayoutEffect,
  useCallback,
  forwardRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react'

export interface TextAreaAutoResizeProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number | string
  maxRows?: number | string
}

const adjust = (el: HTMLTextAreaElement, minRows?: number | string, maxRows?: number | string) => {
  const style = getComputedStyle(el)
  const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2
  const paddingY = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)

  el.style.height = 'auto'
  const scrollHeight = el.scrollHeight

  const min = minRows == null ? 0 : Number(minRows) * lineHeight + paddingY
  const max = maxRows == null ? Infinity : Number(maxRows) * lineHeight + paddingY

  el.style.height = `${Math.min(max, Math.max(min, scrollHeight))}px`
  el.style.overflow = scrollHeight > max ? 'auto' : 'hidden'
}

export const TextAreaAutoResize = forwardRef<HTMLTextAreaElement, TextAreaAutoResizeProps>(
  function TextAreaAutoResize({ value, onChange, minRows, maxRows, ...rest }, forwardedRef) {
    const innerRef = useRef<HTMLTextAreaElement>(null)

    // Merge inner ref with any forwarded ref.
    const setRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        innerRef.current = el
        if (typeof forwardedRef === 'function') forwardedRef(el)
        else if (forwardedRef)
          (forwardedRef as { current: HTMLTextAreaElement | null }).current = el
      },
      [forwardedRef]
    )

    // Adjust height on controlled value changes or row constraint changes.
    useLayoutEffect(() => {
      adjust(innerRef.current!, minRows, maxRows)
    }, [value, minRows, maxRows])

    // Adjust height on uncontrolled user input.
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        adjust(e.currentTarget, minRows, maxRows)
        onChange?.(e)
      },
      [onChange, minRows, maxRows]
    )

    return <textarea ref={setRef} value={value} onChange={handleChange} {...rest} />
  }
)
