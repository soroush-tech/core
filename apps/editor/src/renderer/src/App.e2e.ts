import { readFileSync } from 'node:fs'
import { expect, type Page } from '@playwright/test'
import type { ElectronApplication } from 'playwright'
import { CLAUDE_STUB_ANSWER, CLAUDE_STUB_DELTA, test } from 'src/test/e2e/fixtures'

const getEditor = (page: Page) => page.getByPlaceholder('Write your article in Markdown...')

/** Clicks a native application-menu item by its template id (see src/main/menu.ts). */
const clickMenuItem = (electronApp: ElectronApplication, id: string) =>
  electronApp.evaluate(({ Menu }, itemId) => {
    Menu.getApplicationMenu()!.getMenuItemById(itemId)!.click()
  }, id)

test('renders the markdown document surface on the dark theme', async ({ page }) => {
  // The app opens on a sandbox, so the document is a gist file from the start.
  await expect(page.getByText('en.md', { exact: true })).toBeVisible()

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
  // Save writes to disk only for a document that is not a gist file, and the
  // app opens on a sandbox - so start a plain document first. Waiting for the
  // sandbox to have settled first, or the menu action lands before it does.
  await expect(page.getByText('en.md', { exact: true })).toBeVisible()
  await clickMenuItem(electronApp, 'file-new')
  await expect(page.getByText('Untitled', { exact: true })).toBeVisible()

  await editor.fill('# Saved from e2e')

  await electronApp.evaluate(({ dialog }, savePath) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: savePath })
  }, filePath)
  await clickMenuItem(electronApp, 'file-save')
  await expect(page.getByText(filePath, { exact: true })).toBeVisible()
  expect(readFileSync(filePath, 'utf8')).toBe('# Saved from e2e')

  // The saved document is clean, so New resets without a discard prompt.
  await clickMenuItem(electronApp, 'file-new')
  await expect(editor).toHaveValue('')
  await expect(page.getByText('Untitled', { exact: true })).toBeVisible()

  await electronApp.evaluate(({ dialog }, openPath) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [openPath] })
  }, filePath)
  await clickMenuItem(electronApp, 'file-open')
  await expect(editor).toHaveValue('# Saved from e2e')
  await expect(page.getByText(filePath, { exact: true })).toBeVisible()
})

test('recovers typed markdown through the Edit menu and keyboard undo', async ({
  page,
  electronApp,
}) => {
  const editor = getEditor(page)
  await editor.fill('one')

  // Undo commits whatever is pending before stepping back, so this pair leaves
  // 'one' as a committed step - no waiting out the coalescing window for it.
  await clickMenuItem(electronApp, 'edit-undo')
  await expect(editor).toHaveValue('')
  await clickMenuItem(electronApp, 'edit-redo')
  await expect(editor).toHaveValue('one')

  await editor.fill('one two')

  // A single Ctrl+Z must undo exactly one step - guards against the menu
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

  // Live edit: type directly on the rendered heading - no textarea anywhere.
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

test('streams a Claude rewrite into the document', async ({ page }) => {
  await page.getByLabel('Edit instruction').fill('write something')
  await page.getByRole('button', { name: 'Ask Claude' }).click()

  // In the document while the run is still going - the point of streaming.
  await expect(getEditor(page)).toHaveValue(CLAUDE_STUB_DELTA)
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()

  // Then the run's own answer has the last word.
  await expect(getEditor(page)).toHaveValue(CLAUDE_STUB_ANSWER)
  await expect(page.getByRole('button', { name: 'Ask Claude' })).toBeVisible()
})

test('cancels a Claude run, putting the document back', async ({ page }) => {
  await getEditor(page).fill('# Mine')
  await page.getByLabel('Edit instruction').fill('rewrite it')
  await page.getByRole('button', { name: 'Ask Claude' }).click()

  await expect(getEditor(page)).toHaveValue(CLAUDE_STUB_DELTA)
  await page.getByRole('button', { name: 'Cancel' }).click()

  // The button is back, so the run is over and the document is its own again. That a killed
  // run cannot write afterwards is main's to guarantee - events carry the run they belong to,
  // and the renderer drops any for a run it is no longer waiting on (see useClaudeEdit).
  await expect(page.getByRole('button', { name: 'Ask Claude' })).toBeVisible()
  await expect(getEditor(page)).toHaveValue('# Mine')
})

test('prompts before closing a window with unsaved changes', async ({ page, electronApp }) => {
  // The app opens on a gist file, which is kept by staging it in the sandbox -
  // silently, with nothing to observe. Start a plain document, where keeping the
  // work means a save dialog. Waiting for the sandbox to have settled first, or
  // the menu action lands before it does.
  await expect(page.getByText('en.md', { exact: true })).toBeVisible()
  await clickMenuItem(electronApp, 'file-new')
  await expect(page.getByText('Untitled', { exact: true })).toBeVisible()

  await getEditor(page).fill('unsaved')
  await expect(page.getByText('Untitled •')).toBeVisible()
  // Main only prompts once it knows the document is dirty. Awaiting the same
  // call the renderer makes settles that, rather than guessing at how long the
  // IPC takes.
  await page.evaluate(() => window.editorAPI.file.setDirty(true, false))

  // Button 0 keeps the work: main asks the renderer to save, which opens the
  // save dialog - the dialog opening is what proves the window survived to act.
  await electronApp.evaluate(({ dialog }) => {
    const counts = globalThis as unknown as { saveDialogs: number }
    counts.saveDialogs = 0
    dialog.showSaveDialog = async () => {
      counts.saveDialogs += 1
      return { canceled: true, filePath: '' }
    }
    dialog.showMessageBox = async () => ({ response: 0, checkboxChecked: false })
  })
  await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())

  await expect
    .poll(() =>
      electronApp.evaluate(() => (globalThis as { saveDialogs?: number }).saveDialogs ?? 0)
    )
    .toBeGreaterThan(0)
  expect(page.isClosed()).toBe(false)

  // Button 1 is "Discard changes", and that does close it.
  await electronApp.evaluate(({ dialog }) => {
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false })
  })
  const closed = page.waitForEvent('close')
  await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())
  await closed
})
