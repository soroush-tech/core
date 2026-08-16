import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from 'src/test/mocks/server'
import { renderWithApp } from 'src/test/utils/wrapper'
import { PageContext } from 'src/common/PageContext'
import { ContactInquire } from './ContactInquire'
import { fields, type ContactField } from './ContactInquire.data'

const accessibleName = (field: ContactField) => `${field.label}${field.required ? ' *' : ''}`

const fieldByName = (name: ContactField['name']) => {
  const found = fields.find((field) => field.name === name)
  if (!found) throw new Error(`No rendered field named "${name}"`)
  return found
}

const fill = (name: ContactField['name'], value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: accessibleName(fieldByName(name)) }), {
    target: { value },
  })

const fillRequired = () => {
  fill('name', 'Jane Doe')
  fill('email', 'jane@example.com')
  fill('subject', 'Project inquiry')
  fill('message', 'Hello there.')
  fireEvent.click(screen.getByRole('checkbox'))
}

const submitButton = () => screen.getByRole('button', { name: /Send/i })

beforeEach(() => {
  // The dev .env ships a Turnstile test sitekey; unset it per-test so the captcha is off unless a
  // test opts in (the captcha test re-stubs it). Keeps these tests independent of local .env.
  vi.stubEnv('VITE_TURNSTILE_SITEKEY', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
  delete window.turnstile
  document
    .querySelectorAll('script[src^="https://challenges.cloudflare.com/turnstile"]')
    .forEach((node) => node.remove())
})

describe('ContactInquire', () => {
  describe('structure', () => {
    it('renders a section landmark with the contact anchor', () => {
      renderWithApp(<ContactInquire />)
      expect(document.querySelector('section')).toBeInTheDocument()
      expect(document.querySelector('#contact')).toBeInTheDocument()
    })

    it('renders the heading and subtext', () => {
      renderWithApp(<ContactInquire />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('CONTACT INQUIRE')
      expect(
        screen.getByText('Awaiting payload transmission. Authorized communication only.')
      ).toBeInTheDocument()
    })

    it('renders the submit button', () => {
      renderWithApp(<ContactInquire />)
      expect(submitButton()).toBeInTheDocument()
    })
  })

  describe('fields', () => {
    it.each(fields)('renders the $name field with an associated label', (field) => {
      renderWithApp(<ContactInquire />)
      const control = screen.getByRole('textbox', { name: accessibleName(field) })
      expect(control).toHaveAttribute('name', field.name)
    })
  })

  describe('validation', () => {
    it('flags a required field as invalid after it is touched', async () => {
      renderWithApp(<ContactInquire />)
      const name = screen.getByRole('textbox', { name: accessibleName(fieldByName('name')) })
      fireEvent.blur(name)
      expect(await screen.findByText('Name is required')).toBeInTheDocument()
    })

    it('flags a malformed e-mail', async () => {
      renderWithApp(<ContactInquire />)
      const email = screen.getByRole('textbox', { name: accessibleName(fieldByName('email')) })
      fireEvent.change(email, { target: { value: 'not-an-email' } })
      fireEvent.blur(email)
      expect(await screen.findByText('A valid e-mail is required')).toBeInTheDocument()
    })

    it('keeps the submit button disabled while the form is invalid', async () => {
      renderWithApp(<ContactInquire />)
      await waitFor(() => expect(submitButton()).toBeDisabled())
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('keeps submit disabled until consent is given', async () => {
      renderWithApp(<ContactInquire />)
      fill('name', 'Jane Doe')
      fill('email', 'jane@example.com')
      fill('subject', 'Project inquiry')
      fill('message', 'Hello there.')
      // Everything valid except the unchecked GDPR consent box.
      await waitFor(() => expect(submitButton()).toBeDisabled())
      fireEvent.click(screen.getByRole('checkbox'))
      await waitFor(() => expect(submitButton()).toBeEnabled())
    })
  })

  describe('submission', () => {
    it('shows a success panel with the returned reference after a 2xx response', async () => {
      server.use(
        http.post(/\/contact$/, () => HttpResponse.json({ ok: true, id: 'REQ-2606-F47AC10B' }))
      )
      renderWithApp(<ContactInquire />)

      fillRequired()
      await waitFor(() => expect(submitButton()).toBeEnabled())
      fireEvent.click(submitButton())

      const status = await screen.findByRole('status')
      expect(status).toHaveTextContent('TRANSMISSION RECEIVED')
      // The Worker returns the formatted reference; the panel shows it verbatim.
      expect(status).toHaveTextContent('REQ-2606-F47AC10B')
      expect(screen.queryByRole('button', { name: /Send/i })).not.toBeInTheDocument()
    })

    it('surfaces field errors and does not submit an invalid form (e.g. submitted via Enter)', async () => {
      let posted = false
      server.use(
        http.post(/\/contact$/, () => {
          posted = true
          return HttpResponse.json({ ok: true })
        })
      )
      const { container } = renderWithApp(<ContactInquire />)

      // The disabled button can't be clicked, but Enter still fires the form's submit handler.
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)

      expect(await screen.findByText('Name is required')).toBeInTheDocument()
      expect(posted).toBe(false)
    })

    it('resets to a cleared form when New inquiry is clicked on the success panel', async () => {
      server.use(
        http.post(/\/contact$/, () => HttpResponse.json({ ok: true, id: 'abcdef01-2345' }))
      )
      renderWithApp(<ContactInquire />)

      fillRequired()
      await waitFor(() => expect(submitButton()).toBeEnabled())
      fireEvent.click(submitButton())

      await screen.findByRole('status')
      fireEvent.click(screen.getByRole('button', { name: /New inquiry/i }))

      // Back on the form with the previously entered value cleared.
      expect(submitButton()).toBeInTheDocument()
      expect(
        screen.getByRole('textbox', { name: accessibleName(fieldByName('name')) })
      ).toHaveValue('')
    })

    it('submits a valid form even after fields were blurred while empty (autofill scenario)', async () => {
      let posted = false
      server.use(
        http.post(/\/contact$/, () => {
          posted = true
          return HttpResponse.json({ ok: true, id: 'abcdef01-2345' })
        })
      )
      renderWithApp(<ContactInquire />)

      // Blur the required fields while still empty → sets blur-mode validation errors.
      ;(['name', 'email', 'subject', 'message'] as const).forEach((name) =>
        fireEvent.blur(screen.getByRole('textbox', { name: accessibleName(fieldByName(name)) }))
      )

      // Then fill them via change only (as browser autofill does) - without re-blurring.
      fillRequired()

      await waitFor(() => expect(submitButton()).toBeEnabled())
      fireEvent.click(submitButton())

      expect(await screen.findByRole('status')).toBeInTheDocument()
      expect(posted).toBe(true)
    })

    it('shows an error banner on failure', async () => {
      server.use(http.post(/\/contact$/, () => HttpResponse.json({ ok: false }, { status: 400 })))
      renderWithApp(<ContactInquire />)

      fillRequired()
      await waitFor(() => expect(submitButton()).toBeEnabled())
      fireEvent.click(submitButton())

      expect(await screen.findByText(/Transmission failed/)).toBeInTheDocument()
    })

    it('clears the error state when Reset is clicked', async () => {
      server.use(http.post(/\/contact$/, () => HttpResponse.json({ ok: false }, { status: 400 })))
      renderWithApp(<ContactInquire />)

      fillRequired()
      await waitFor(() => expect(submitButton()).toBeEnabled())
      fireEvent.click(submitButton())

      expect(await screen.findByText(/Transmission failed/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Reset/i }))
      await waitFor(() => expect(screen.queryByText(/Transmission failed/)).not.toBeInTheDocument())
    })

    it('shows the success screen without sending a request when the honeypot is filled', async () => {
      vi.stubEnv('VITE_CONTACT_HONEYPOT', 'fax')
      let posted = false
      server.use(
        http.post(/\/contact$/, () => {
          posted = true
          return HttpResponse.json({ ok: true })
        })
      )
      renderWithApp(<ContactInquire />)

      fillRequired()
      await waitFor(() => expect(submitButton()).toBeEnabled())
      const trap = document.querySelector('input[name="fax"]')
      expect(trap).not.toBeNull()
      // Opted out of browser/password-manager autofill so real users don't trip the trap.
      expect(trap).toHaveAttribute('autocomplete', 'off')
      expect(trap).toHaveAttribute('data-lpignore', 'true')
      expect((trap as HTMLInputElement).closest('[aria-hidden]')).toHaveStyle({ display: 'none' })
      fireEvent.change(trap as HTMLInputElement, { target: { value: 'i-am-a-bot' } })
      fireEvent.click(submitButton())

      // Bot sees the decoy success panel with a client-side res_ reference, but no request was sent.
      const status = await screen.findByRole('status')
      expect(status).toHaveTextContent('TRANSMISSION RECEIVED')
      expect(status.textContent).toMatch(/ID: res_\d{9}/)
      expect(posted).toBe(false)
    })

    it('renders no honeypot field when VITE_CONTACT_HONEYPOT is unset', () => {
      vi.stubEnv('VITE_CONTACT_HONEYPOT', undefined)
      renderWithApp(<ContactInquire />)
      expect(document.querySelector('input[data-lpignore="true"]')).toBeNull()
    })
  })

  describe('back navigation', () => {
    it('omits the Back button on a direct (non-in-app) visit', () => {
      renderWithApp(<ContactInquire />)
      expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument()
    })

    it('renders a Back button after in-app navigation and goes back on click', () => {
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
      renderWithApp(
        <PageContext.Provider value={{ isClientSideNavigation: true } as never}>
          <ContactInquire />
        </PageContext.Provider>
      )

      fireEvent.click(screen.getByRole('button', { name: /Back/i }))
      expect(back).toHaveBeenCalledOnce()
      back.mockRestore()
    })

    it('renders a Back button on the success panel after in-app navigation', async () => {
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
      server.use(
        http.post(/\/contact$/, () => HttpResponse.json({ ok: true, id: 'REQ-2606-F47AC10B' }))
      )
      renderWithApp(
        <PageContext.Provider value={{ isClientSideNavigation: true } as never}>
          <ContactInquire />
        </PageContext.Provider>
      )

      fillRequired()
      await waitFor(() => expect(submitButton()).toBeEnabled())
      fireEvent.click(submitButton())

      await screen.findByRole('status')
      // Two Back buttons now: the card header and the success panel; click the panel's (last).
      const backButtons = screen.getAllByRole('button', { name: /Back/i })
      fireEvent.click(backButtons[backButtons.length - 1])
      expect(back).toHaveBeenCalledOnce()
      back.mockRestore()
    })
  })

  describe('captcha', () => {
    const mockTurnstile = () => {
      const render = vi.fn<NonNullable<typeof window.turnstile>['render']>(() => 'w1')
      const api = { render, reset: vi.fn(), remove: vi.fn() }
      window.turnstile = api
      return api
    }

    it('renders no captcha widget when the sitekey is unset', () => {
      vi.stubEnv('VITE_TURNSTILE_SITEKEY', undefined)
      renderWithApp(<ContactInquire />)
      expect(submitButton()).toBeInTheDocument()
    })

    it('gates submission until the Turnstile token arrives and includes it in the request', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITEKEY', 'site-key')
      const api = mockTurnstile()
      let posted: Record<string, unknown> | undefined
      server.use(
        http.post(/\/contact$/, async ({ request }) => {
          posted = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ok: true, id: 'abcdef01-2345' })
        })
      )
      renderWithApp(<ContactInquire />)

      fillRequired()
      expect(submitButton()).toBeDisabled()

      await waitFor(() => expect(api.render).toHaveBeenCalled())
      act(() => api.render.mock.calls[0][1].callback('tok-123'))

      expect(submitButton()).toBeEnabled()
      fireEvent.click(submitButton())

      expect(await screen.findByRole('status')).toHaveTextContent('TRANSMISSION RECEIVED')
      expect(posted?.turnstileToken).toBe('tok-123')
    })

    it('surfaces a message when the Turnstile script fails to load', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITEKEY', 'site-key')
      renderWithApp(<ContactInquire />)
      const script = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile"]'
      )
      await act(async () => {
        script!.dispatchEvent(new Event('error'))
      })
      expect(await screen.findByText(/Verification couldn/i)).toBeInTheDocument()
    })
  })
})
