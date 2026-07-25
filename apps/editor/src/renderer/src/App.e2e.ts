import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import type { ElectronApplication } from 'playwright'
import { expect, test } from 'src/test/e2e/fixtures'

const getEditor = (page: Page) => page.getByPlaceholder('Write your article in Markdown…')

/** Clicks a native application-menu item by its template id (see src/main/menu.ts). */
const clickMenuItem = (electronApp: ElectronApplication, id: string) =>
  electronApp.evaluate(({ Menu }, itemId) => {
    Menu.getApplicationMenu()!.getMenuItemById(itemId)!.click()
  }, id)

test('renders the markdown document surface on the dark theme', async ({ page }) => {
  await expect(page.getByText('Untitled')).toBeVisible()

  await getEditor(page).fill('# Hello from e2e')
  await expect(page.getByRole('heading', { level: 1, name: 'Hello from e2e' })).toBeVisible()

  // Regression guard: the window must paint the editor theme, not a white page.
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(background).toBe('rgb(14, 14, 14)')
})

test('saves, resets, and reopens a document from the File menu', async ({
  page,
  electronApp,
}, testInfo) => {
  const filePath = testInfo.outputPath('note.md')
  const editor = getEditor(page)
  await editor.fill('# Saved from e2e')

  await electronApp.evaluate(({ dialog }, savePath) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: savePath })
  }, filePath)
  await clickMenuItem(electronApp, 'file-save')
  await expect(page.getByText(filePath)).toBeVisible()
  expect(readFileSync(filePath, 'utf8')).toBe('# Saved from e2e')

  // The saved document is clean, so New resets without a discard prompt.
  await clickMenuItem(electronApp, 'file-new')
  await expect(editor).toHaveValue('')
  await expect(page.getByText('Untitled')).toBeVisible()

  await electronApp.evaluate(({ dialog }, openPath) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [openPath] })
  }, filePath)
  await clickMenuItem(electronApp, 'file-open')
  await expect(editor).toHaveValue('# Saved from e2e')
  await expect(page.getByText(filePath)).toBeVisible()
})

test('recovers typed markdown through the Edit menu and keyboard undo', async ({
  page,
  electronApp,
}) => {
  const editor = getEditor(page)
  await editor.fill('one')
  // Let the first snapshot commit so two undo steps exist.
  await page.waitForTimeout(700)
  await editor.fill('one two')

  // A single Ctrl+Z must undo exactly one step — guards against the menu
  // accelerator double-handling the key alongside the renderer binding.
  await editor.press('Control+z')
  await expect(editor).toHaveValue('one')

  await clickMenuItem(electronApp, 'edit-undo')
  await expect(editor).toHaveValue('')

  await clickMenuItem(electronApp, 'edit-redo')
  await expect(editor).toHaveValue('one')
})

test('switches between edit, preview, and live edit modes', async ({ page }) => {
  const editor = getEditor(page)
  await editor.fill('# Modes')

  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(editor).toBeHidden()
  await expect(page.getByRole('heading', { level: 1, name: 'Modes' })).toBeVisible()

  // Live edit: type directly on the rendered heading — no textarea anywhere.
  await page.getByRole('button', { name: 'Live edit' }).click()
  const block = page.getByLabel('Edit block')
  await expect(block).toHaveAttribute('contenteditable', 'true')
  await block.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' now')
  await expect(page.getByRole('heading', { level: 1, name: 'Modes now' })).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(getEditor(page)).toHaveValue('# Modes now')
})

test('prompts before closing a window with unsaved changes', async ({ page, electronApp }) => {
  await getEditor(page).fill('unsaved')
  await expect(page.getByText('Untitled •')).toBeVisible()
  // The dirty flag reaches the main process over IPC; give it a beat to land.
  await page.waitForTimeout(250)

  await electronApp.evaluate(({ dialog }) => {
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false })
  })
  await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())
  await page.waitForTimeout(250)
  expect(page.isClosed()).toBe(false)

  await electronApp.evaluate(({ dialog }) => {
    dialog.showMessageBox = async () => ({ response: 0, checkboxChecked: false })
  })
  const closed = page.waitForEvent('close')
  await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())
  await closed
})
