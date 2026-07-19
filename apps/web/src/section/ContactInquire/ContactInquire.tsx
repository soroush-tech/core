import { useRef, useState, type SyntheticEvent } from 'react'
import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Button } from '@soroush.tech/design-system/Button'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Form } from '@soroush.tech/design-system/Form'
import { Checkbox } from '@soroush.tech/design-system/Checkbox'
import { Paper } from '@soroush.tech/design-system/Paper'
import { contact } from '@soroush.tech/schema'
import { fields, success, type ContactField } from './ContactInquire.data'
import { makeDecoyId } from './utils'
import { Field } from 'src/common/Field'
import { useContactInquire } from 'src/hooks/useContactInquire'
import { useContactSubmit } from 'src/hooks/useContactSubmit'
import { useTurnstile } from 'src/hooks/useTurnstile'
import { usePageContext } from 'src/hooks/usePageContext'
import { Quote } from '@soroush.tech/design-system/Quote'

export function ContactInquire() {
  // Hidden honeypot field name — read from env so it stays out of the public repo. When unset
  // (e.g. local/dev), the honeypot isn't rendered; the Worker still enforces its own.
  const honeypotName = import.meta.env.VITE_CONTACT_HONEYPOT ?? null
  // Turnstile sitekey — read from env like the honeypot. When unset (local/dev) the widget
  // isn't rendered and submission proceeds tokenless; the Worker skips verification in turn.
  const turnstileSitekey = import.meta.env.VITE_TURNSTILE_SITEKEY ?? ''
  const submit = useContactSubmit()
  const honeypotRef = useRef<HTMLInputElement>(null)
  const {
    containerRef,
    token: turnstileToken,
    reset: resetTurnstile,
    error: turnstileError,
  } = useTurnstile(turnstileSitekey)

  const form = useContactInquire()

  // A tripped honeypot shows the same success screen as a real send (without any request), so a
  // bot gets no signal it was caught — and a real visitor who autofills the trap isn't left stuck.
  // The decoy carries its own `res_` reference since it never reaches the server to get a real id.
  const [decoySuccess, setDecoySuccess] = useState(false)
  const [decoyId, setDecoyId] = useState('')

  // When a captcha is configured, hold submission until the widget yields a token.
  const captchaPending = Boolean(turnstileSitekey) && !turnstileToken

  // Show a Back button (top of the card, in either form or success state) only when the user
  // reached /contact via in-app (client-side) navigation, so it can return them to where they came from.
  const cameFromApp = Boolean(usePageContext()?.isClientSideNavigation)

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const { values } = form.state
    // Gate on the schema directly (same check as the submit button) rather than the form's
    // `canSubmit`, which can stay stale-false after autofill and silently block a valid send.
    if (!contact.schema.safeParse(values).success) {
      form.handleSubmit() // surface field errors; an invalid form never submits
      return
    }
    // A filled honeypot means a bot — skip the request but show the success screen anyway.
    if (honeypotRef.current?.value) {
      setDecoyId(makeDecoyId())
      setDecoySuccess(true)
      return
    }
    submit.mutate({ ...values, turnstileToken })
  }

  const renderField = (field: ContactField) => (
    <Field
      key={field.name}
      form={form}
      name={field.name}
      required={field.required}
      fullWidth
      label={field.label}
      labelProps={{
        variant: 'caption',
        color: 'primary',
        textTransform: 'uppercase',
        letterSpacing: 'widest',
      }}
    >
      <TextInput
        type={field.type}
        variant="underline"
        autoComplete={field.autoComplete}
        placeholder={field.placeholder}
        resize={field.multiline}
        rows={field.multiline ? 4 : undefined}
      />
    </Field>
  )

  const gridFields = fields.filter((field) => !field.fullwidth)
  const fullFields = fields.filter((field) => field.fullwidth)

  // Real sends carry a server-formatted reference; the decoy path (no request) uses its own ref.
  const requestId = submit.data ? submit.data.id : decoyId

  return (
    <View as="section" py={6} px={4}>
      {cameFromApp && (
        <View mb={4} maxWidth="1280px" mx="auto">
          <Button
            variant="text"
            size="sm"
            startIcon={<Icon name="arrow_back" size="1.1rem" />}
            onClick={() => globalThis.history.back()}
          >
            Back
          </Button>
        </View>
      )}
      <Paper
        maxWidth="1280px"
        mx="auto"
        id="contact"
        position="relative"
        overflow="hidden"
        pl={[6, 8, 10]}
        pr={[6, 8, 10]}
        pb={[6, 8, 10]}
        pt={[2, 4]}
      >
        <View aria-hidden position="absolute" top={0} right={0} p={4} opacity={0.2}>
          <Icon name="lock" color="primary" size="3.5rem" />
        </View>

        <View mb={8} maxWidth="36rem">
          <Typography variant="h2" color="primary" letterSpacing="tighter" gutterBottom>
            CONTACT INQUIRE
          </Typography>
          <Typography variant="overline" as="p" color="secondary">
            Awaiting payload transmission. Authorized communication only.
          </Typography>
        </View>

        {submit.isSuccess || decoySuccess ? (
          <View
            role="status"
            position="relative"
            py={[8, 10]}
            px={[4, 6]}
            bg="grid"
            borderColor="light"
            borderWidth="thin"
            borderStyle="solid"
          >
            <Flex alignItems="center" textAlign="center">
              <Icon name="cloud_done" color="primary" size="4rem" />
              <Typography variant="h2" color="primary" letterSpacing="tighter" mt={4} gutterBottom>
                {success.heading}
              </Typography>
              <Typography variant="overline" as="p" color="secondary">
                {success.subtext}
              </Typography>

              <Quote bg="terminal" p={5} mt={8} width="100%" maxWidth="28rem" textAlign="left">
                <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="primary" letterSpacing="widest">
                    ID: {requestId}
                  </Typography>
                </Flex>
                <View height="1px" bg="grid" mt={2} />
                <Typography
                  variant="caption"
                  color="primary"
                  letterSpacing="widest"
                  textTransform="uppercase"
                >
                  System Log
                </Typography>
                <View mt={3}>
                  {success.logLines.map((line) => (
                    <Typography key={line} variant="caption" as="p" color="secondary">
                      &gt; {line}
                    </Typography>
                  ))}
                </View>
              </Quote>

              <Flex flexDirection="row" mt={8} gap={2}>
                {cameFromApp && (
                  <Button
                    variant="contained"
                    size="lg"
                    startIcon={<Icon name="arrow_back" size="1.1rem" color="inherit" />}
                    onClick={() => globalThis.history.back()}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="lg"
                  endIcon={<Icon name="arrow_forward" size="1.1rem" color="inherit" />}
                  onClick={() => {
                    submit.reset()
                    form.reset()
                    resetTurnstile()
                    setDecoySuccess(false)
                  }}
                >
                  New inquiry
                </Button>
              </Flex>
            </Flex>
          </View>
        ) : (
          <Form onSubmit={handleSubmit} noValidate textColor="initial">
            <Grid gridTemplateColumns={['1fr', '1fr', '1fr 1fr']} gap={3}>
              {gridFields.map(renderField)}
            </Grid>

            <Flex mt={6} gap={3}>
              {fullFields.map(renderField)}
            </Flex>

            {honeypotName && (
              // Hidden bot trap. `display:none` (not off-screen) so browser autofill — Chrome's
              // native autofill honors it but ignores the data-* hints — and password managers
              // skip it; an autofilled honeypot would otherwise drop a real user's submission.
              <View aria-hidden display="none">
                <input
                  ref={honeypotRef}
                  type="text"
                  name={honeypotName}
                  tabIndex={-1}
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </View>
            )}

            {turnstileSitekey && (
              <View mt={6}>
                <div ref={containerRef} />
                {turnstileError && (
                  <Typography variant="overline" as="p" color="error" mt={2}>
                    Verification couldn’t load. Disable any blockers and refresh to continue.
                  </Typography>
                )}
              </View>
            )}

            <form.Field name="consent">
              {(field) => (
                <View mt={4}>
                  <Checkbox
                    checked={field.state.value}
                    onChange={(event) => field.handleChange(event.target.checked)}
                    required
                  >
                    <Typography variant="caption" as="span" color="secondary">
                      {contact.consentText}
                    </Typography>
                  </Checkbox>
                </View>
              )}
            </form.Field>
            {submit.isError && (
              <Typography variant="overline" as="p" color="error" mt={4}>
                Transmission failed. Check your connection and retry.
              </Typography>
            )}
            <View mt={4}>
              <View>
                <form.Subscribe selector={(state) => state.values}>
                  {(values) => (
                    <Button
                      type="submit"
                      variant="contained"
                      size="lg"
                      disabled={
                        !contact.schema.safeParse(values).success ||
                        submit.isPending ||
                        captchaPending
                      }
                      loading={submit.isPending}
                      loadingPosition="end"
                    >
                      {submit.isError ? 'Retry' : 'Send'}
                    </Button>
                  )}
                </form.Subscribe>
                {submit.isError && (
                  <Button
                    variant="contained"
                    size="lg"
                    color="default"
                    ml={2}
                    onClick={() => {
                      submit.reset()
                      resetTurnstile()
                    }}
                  >
                    Reset
                  </Button>
                )}
              </View>
            </View>
          </Form>
        )}
      </Paper>
    </View>
  )
}
