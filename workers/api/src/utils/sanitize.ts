import type { contact } from '@soroush.tech/schema'

const TAB = 0x09
const NEWLINE = 0x0a

/** A C0 control character (0x00-0x1F) or DEL (0x7F). */
const isControl = (code: number): boolean => code <= 0x1f || code === 0x7f

/** Drop the chars failing `keep` from `value`. */
const filterChars = (value: string, keep: (code: number) => boolean): string =>
  Array.from(value)
    .filter((ch) => keep(ch.codePointAt(0)!))
    .join('')

/** Strip every control char - single-line fields keep no whitespace control chars. */
const stripLine = (value: string): string => filterChars(value, (code) => !isControl(code))

/** Like `stripLine` but keep tab and newline - the message is multi-line. */
const stripMultiline = (value: string): string =>
  filterChars(value, (code) => !isControl(code) || code === TAB || code === NEWLINE)

/**
 * Remove control characters from validated submission values before they are stored or emailed.
 * Non-destructive to real content (letters, `<`, `&`, unicode are untouched) - control chars are
 * never legitimate input. HTML is still escaped at each output sink (see `email.ts`).
 */
export const sanitizeContact = (v: contact.Values): contact.Values => ({
  name: stripLine(v.name),
  company: stripLine(v.company),
  email: stripLine(v.email),
  phone: stripLine(v.phone),
  website: stripLine(v.website),
  project: stripLine(v.project),
  timeline: stripLine(v.timeline),
  subject: stripLine(v.subject),
  message: stripMultiline(v.message),
  consent: v.consent,
})
