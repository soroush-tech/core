import { type IconName } from '@soroush.tech/design-system/Icon'

export const pillars: Array<{
  title: string
  description: string
  icon: IconName
}> = [
  {
    title: 'System Scalability',
    description:
      'Designing for 10M+ users requires more than clean code; it requires state machines and resilient patterns that survive traffic surges.',
    icon: 'account_tree',
  },
  {
    title: 'LLM Synergy',
    description:
      'Integrating generative AI not as a feature, but as a core utility in the development lifecycle and user experience layers.',
    icon: 'neurology',
  },
  {
    title: 'Atomic Design',
    description:
      'Standardizing components at the sub-atomic level to ensure consistency across fragmented platform ecosystems.',
    icon: 'schema',
  },
]
