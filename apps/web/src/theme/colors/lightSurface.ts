export const lightSurface = {
  get base() {
    return this[500]
  },
  100: '#ffffff', // Pure white (surface-container-lowest)
  200: '#f9f9f9', // Surface / Background
  300: '#f3f3f3', // Surface container low
  400: '#eeeeee', // Surface container
  500: '#e8e8e8', // Surface container high
  600: '#e2e2e2', // Surface container highest / surface-variant
  700: '#dadada', // Surface dim
  800: '#c4c7c7', // Outline variant
  850: '#747878', // Outline / primary border
  900: '#444748', // On-surface variant / secondary text
  950: '#1a1c1c', // On-surface / primary text
}

export const _title = 'Light Surface'
export const _description = `
  Name: Light Surface / Material Light Neutrals
  Hue Bias: Near-neutral with a very slight warm-green tint at the dark end
  Category: Light mode foundation — surfaces, borders, text
  Mood: Clean, airy, professional
`

export const _notes = {
  100: 'Pure white (surface-container-lowest)',
  200: 'Surface / Background',
  300: 'Surface container low',
  400: 'Surface container',
  500: 'Surface container high',
  600: 'Surface container highest / surface-variant',
  700: 'Surface dim',
  800: 'Outline variant',
  850: 'Outline / primary border',
  900: 'On-surface variant / secondary text',
  950: 'On-surface / primary text',
}
