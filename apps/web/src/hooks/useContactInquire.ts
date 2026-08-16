import { useForm, revalidateLogic } from '@tanstack/react-form'
import { contact } from '@soroush.tech/schema'
import { defaultValues } from 'src/section/ContactInquire/ContactInquire.data'

/**
 * The contact form instance. It owns field state and validation *display* only - validate on
 * blur first, then on every change after a submit attempt so errors clear live. Submission is
 * gated by the caller via a schema parse (not by this form's `canSubmit`), so a stale blur error
 * can never wedge an otherwise-valid submission - e.g. after browser autofill fills fields
 * without re-blurring them.
 */
export function useContactInquire() {
  return useForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode: 'blur', modeAfterSubmission: 'change' }),
    validators: { onDynamic: contact.schema },
  })
}
