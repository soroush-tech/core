/** Serializes a resolved transform origin (in px) to a CSS `transform-origin` value. */
export function getTransformOriginValue(origin: { vertical: number; horizontal: number }): string {
  return `${origin.horizontal}px ${origin.vertical}px`
}
