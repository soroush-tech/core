interface NavTreeLink {
  label: string
  isCurrent?: boolean
  note?: string
}

interface NavTreeGroup {
  label: string
  isCollapsible: boolean
  links: NavTreeLink[]
}

export const NAV_GROUPS: NavTreeGroup[] = [
  {
    label: 'Get started',
    isCollapsible: false,
    links: [{ label: 'Installation' }, { label: 'Usage', isCurrent: true }],
  },
  {
    label: 'Components',
    isCollapsible: true,
    links: [{ label: 'Button' }, { label: 'Tabs', note: 'v2' }],
  },
]
