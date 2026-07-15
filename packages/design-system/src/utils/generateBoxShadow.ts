export const generateBoxShadow = (elevation: number, shadowColor: string) => {
  return `0 ${elevation}px ${elevation * 2}px ${shadowColor}`
}
