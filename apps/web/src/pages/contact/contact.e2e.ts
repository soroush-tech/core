import { test, expect } from 'src/test/e2e/fixtures'
import type { Page } from '@playwright/test'

// Navigate to the contact page and wait for hydration - the blur-validation
// handlers the tests below drive only exist once React has attached. The
// embedded Turnstile widget keeps the network busy, so `networkidle` never
// settles; instead observe hydration itself: `hydrateRoot` marks the container
// with an internal `__reactContainer*` key the moment it attaches.
const gotoContact = async (page: Page) => {
  await page.goto('/contact')
  await page.waitForFunction(() => {
    const root = document.getElementById('root')
    return root !== null && Object.keys(root).some((key) => key.startsWith('__reactContainer'))
  })
}

// Focus then blur an empty field to trigger blur-mode validation for it.
const blurField = async (page: Page, name: RegExp) => {
  const field = page.getByRole('textbox', { name })
  await field.focus()
  await field.blur()
}

test('contact page renders the secure inquiry form', async ({ page }) => {
  await gotoContact(page)

  await expect(page).toHaveTitle('Contact Masoud Soroush · SOROUSH.TECH')

  await expect(page.getByRole('heading', { level: 2, name: 'CONTACT INQUIRE' })).toBeVisible()
  await expect(
    page.getByText('Awaiting payload transmission. Authorized communication only.')
  ).toBeVisible()
  await expect(page.getByRole('textbox', { name: /NAME/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /E-MAIL/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /MESSAGE/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Send/ })).toBeVisible()
})

test('contact form flags required fields on blur', async ({ page }) => {
  await gotoContact(page)

  // Validation runs on blur; the submit button stays disabled while the form is invalid,
  // so required errors surface by visiting and leaving each empty field, not by submitting.
  await blurField(page, /NAME/)
  await blurField(page, /E-MAIL/)
  await blurField(page, /MESSAGE/)

  await expect(page.getByText('Name is required')).toBeVisible()
  await expect(page.getByText('A valid e-mail is required')).toBeVisible()
  await expect(page.getByText('Message is required')).toBeVisible()

  // Still on the contact route - the form did not submit or navigate.
  await expect(page).toHaveURL(/\/contact$/)
})

test('contact form flags a malformed field on blur', async ({ page }) => {
  await gotoContact(page)

  const email = page.getByRole('textbox', { name: /E-MAIL/ })
  await email.fill('not-an-email')
  await email.blur()

  await expect(page.getByText('A valid e-mail is required')).toBeVisible()
})

test('contact form clears errors as fields are corrected', async ({ page }) => {
  await gotoContact(page)

  // Surface an error first, then correct each field; blurring revalidates and clears it.
  await blurField(page, /NAME/)
  await expect(page.getByText('Name is required')).toBeVisible()

  const name = page.getByRole('textbox', { name: /NAME/ })
  await name.fill('Jane Doe')
  await name.blur()

  const email = page.getByRole('textbox', { name: /E-MAIL/ })
  await email.fill('jane@example.com')
  await email.blur()

  await page.getByRole('textbox', { name: /SUBJECT/ }).fill('Project inquiry')

  const message = page.getByRole('textbox', { name: /MESSAGE/ })
  await message.fill('Hello, this is a test inquiry.')
  await message.blur()

  await expect(page.getByText('Name is required')).toBeHidden()
  await expect(page.getByText('A valid e-mail is required')).toBeHidden()
  await expect(page.getByText('Message is required')).toBeHidden()
  await expect(page).toHaveURL(/\/contact$/)
})
