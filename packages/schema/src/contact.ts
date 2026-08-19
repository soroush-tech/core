import { z } from 'zod'

// Optional phone, but if provided must hold 7-15 digits (the E.164 range) with an optional
// leading `+` and spaces, `-`, `.`, or parentheses as separators - so international forms like
// `+49 176 8011 2233` are accepted. Empty is allowed (field is optional).
const phonePattern = /^\+?(?=(?:\D*\d){7,15}\D*$)[\d\s().-]+$/

// One zod rule per field. These keys are the source of truth for the value shape;
// the frontend derives its field-name union from them.
const schemaShape = {
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  company: z.string().max(100, 'Company is too long'),
  email: z.email('A valid e-mail is required').max(254, 'E-mail is too long'),
  phone: z.union([
    z.literal(''),
    z
      .string()
      .regex(phonePattern, 'Enter a valid phone number')
      .max(25, 'Phone number is too long'),
  ]),
  website: z.union([z.literal(''), z.url('Enter a valid URL').max(500, 'URL is too long')]),
  project: z.string().max(200, 'Project is too long'),
  timeline: z.string().max(100, 'Timeline is too long'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  // GDPR: explicit, affirmative opt-in. Boolean (default false on the form) that must be true.
  consent: z.boolean().refine((value) => value === true, 'You must agree before submitting'),
}

/**
 * Validation schema for the contact form - the single source of truth shared by the
 * frontend (TanStack Form) and the Worker (`POST /contact`).
 */
export const schema = z.object(schemaShape)

/** Inferred value shape of a valid contact submission. */
export type Values = z.infer<typeof schema>

/**
 * Exact consent wording shown to and accepted by the user. Stored verbatim with each submission
 * (the Worker persists this constant), so the agreed terms are demonstrable for GDPR.
 */
export const consentText =
  'I consent to soroush.tech storing the contact information I provide and using it solely to respond to my inquiry. I can request its deletion at any time.'

// Note: the anti-spam honeypot field is intentionally NOT defined here. Its name is read
// from env on each side (frontend `VITE_CONTACT_HONEYPOT`, Worker `CONTACT_HONEYPOT`) so it
// stays out of the public repo and can be rotated without a code change.
