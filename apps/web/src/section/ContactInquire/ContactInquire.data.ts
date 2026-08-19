import type { contact } from '@soroush.tech/schema'

/** Form field keys - derived from the shared contact schema (the single source of truth). */
export type ContactFieldName = keyof contact.Values

export type ContactFormValues = contact.Values

export interface ContactField {
  name: ContactFieldName
  /** Zero-padded index shown before the label, e.g. "01". */
  code: string
  /** Human-readable label shown above the input. */
  label: string
  placeholder?: string
  type: 'text' | 'email' | 'tel' | 'url'
  required: boolean
  autoComplete?: string
  /** Renders a textarea and spans the full form width. */
  multiline?: boolean
  fullwidth?: boolean
}

export const fields = [
  {
    name: 'name',
    code: '01',
    label: 'NAME',
    placeholder: 'John Smith',
    type: 'text',
    required: true,
    autoComplete: 'name',
  },
  {
    name: 'company',
    code: '02',
    label: 'COMPANY',
    placeholder: 'company name',
    type: 'text',
    required: false,
    autoComplete: 'organization',
  },
  {
    name: 'email',
    code: '03',
    label: 'E-MAIL',
    placeholder: 'me@example.com',
    type: 'email',
    required: true,
    autoComplete: 'email',
  },
  {
    name: 'phone',
    code: '04',
    label: 'PHONE',
    placeholder: '030-XXXXXX',
    type: 'tel',
    required: false,
    autoComplete: 'tel',
  },
  {
    name: 'website',
    code: '05',
    label: 'WEBSITE / LINKEDIN',
    placeholder: 'https://example.com',
    type: 'url',
    required: false,
    autoComplete: 'url',
  },
  {
    name: 'project',
    code: '06',
    label: 'PROJECT',
    type: 'text',
    required: false,
  },
  {
    name: 'subject',
    code: '08',
    label: 'SUBJECT',
    placeholder: 'Request...',
    type: 'text',
    required: true,
    fullwidth: true,
  },
  {
    name: 'message',
    code: '09',
    label: 'MESSAGE',
    placeholder: 'Details...',
    type: 'text',
    required: true,
    multiline: true,
    fullwidth: true,
  },
] satisfies ContactField[]

/** Copy for the post-submit success panel. */
export const success = {
  heading: 'TRANSMISSION RECEIVED',
  subtext: "Message secured. I'll respond to your inquiry shortly.",
  logLines: [
    'HANDSHAKE_SUCCESSFUL',
    'PACKETS_ROUTED_THROUGH_SECURE_NODE',
    'END_TO_END_ENCRYPTION_VERIFIED',
  ],
} as const

export const defaultValues: ContactFormValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  project: '',
  timeline: '',
  subject: '',
  message: '',
  consent: false,
}
