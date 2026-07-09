import { variant } from '@soroush.tech/styled-system'

// Shared border/variant rules for the form inputs (TextInput, NativeSelect) so
// mixed forms look uniform. variant() resolves scale keys: 'sm' → theme.radii.sm,
// 'thin' → theme.borderWidths.thin. For underline, borderStyle:'none' resets all
// sides then borderBottomStyle:'solid' restores only the bottom (longhand overrides
// shorthand within the same rule).
export const inputVariantStyles = variant({
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
