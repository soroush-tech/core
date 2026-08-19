# ContactInquire

The "SECURE INQUIRE" contact section - a validated inquiry form composed entirely from
theme primitives (`View`, `Flex`, `Grid`, `Typography`, `TextInput`, `Button`, `Icon`).

Form state and validation are powered by **TanStack Form** + **Zod**. On submit the section
POSTs to the Worker `/contact` endpoint via `useContactSubmit` (TanStack Query mutation over
the shared axios client). The component takes no props.

`ContactFormValues` is derived from the shared `@soroush.tech/schema` contact schema - see
`ContactInquire.data.ts`.

## Submission states

The section is a small state machine driven by the mutation:

- **idle / submitting** - the form; the submit button shows a loading state while in flight.
- **success** (2xx) - the form is replaced by a `role="status"` panel ("TRANSMISSION RECEIVED").
- **error** (network / non-2xx) - a `role="alert"` banner with a **Retry** button (which resets
  the mutation); the entered values are preserved.

## Anti-spam honeypot

A hidden input named by `VITE_CONTACT_HONEYPOT` (off-screen, `aria-hidden`, `tabindex="-1"`,
`autocomplete="off"`) is rendered when that env var is set. If it is filled, the submit is
short-circuited client-side; the Worker also enforces its own honeypot independently.

## Fields

Nine fields, defined once in `ContactInquire.data.ts` and shared by the component and
its tests. The eight short fields render in a two-column grid; `message` is a
full-width textarea.

| #   | Name       | Type  | Required |
| --- | ---------- | ----- | -------- |
| 01  | `name`     | text  | ✓        |
| 02  | `company`  | text  |          |
| 03  | `email`    | email | ✓        |
| 04  | `phone`    | tel   |          |
| 05  | `website`  | url   |          |
| 06  | `project`  | text  |          |
| 07  | `timeline` | text  |          |
| 08  | `subject`  | text  | ✓        |
| 09  | `message`  | text  | ✓        |

## Validation

Defined in the shared `@soroush.tech/schema` package (`contact.schema`):

- `name`, `subject`, `message` - required (non-empty)
- `email` - valid e-mail
- `website` - optional; must be a valid URL when present
- all others - optional strings

Validation runs `onChange`; errors surface beneath a field once it has been touched.

## Accessibility

- Every input has an associated `<label htmlFor>` carrying its visible label as the
  accessible name.
- Required fields set the native `required` attribute.
- Error text uses `role="alert"` and is linked to its input via `aria-describedby`.
- The decorative lock icon is wrapped in an `aria-hidden` container.

## Usage

```tsx
import { ContactInquire } from 'src/section/ContactInquire'

export default function Page() {
  return <ContactInquire />
}
```
