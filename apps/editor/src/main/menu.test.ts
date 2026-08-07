import type { MenuItemConstructorOptions } from 'electron'
import { createMenuTemplate, installApplicationMenu } from './menu'

const { buildFromTemplate, setApplicationMenu } = vi.hoisted(() => ({
  buildFromTemplate: vi.fn((template: unknown) => ({ template })),
  setApplicationMenu: vi.fn(),
}))

vi.mock('electron', () => ({ Menu: { buildFromTemplate, setApplicationMenu } }))

const findItem = (template: MenuItemConstructorOptions[], id: string) => {
  const items = template.flatMap((menu) => (menu.submenu as MenuItemConstructorOptions[]) ?? [])
  return items.find((item) => item.id === id)!
}

describe('createMenuTemplate', () => {
  const send = vi.fn()
  const onReload = vi.fn()
  const template = createMenuTemplate(send, onReload)

  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['file-new', 'new'],
    ['file-open', 'open'],
    ['file-save', 'save'],
    ['file-save-as', 'save-as'],
    ['edit-undo', 'undo'],
    ['edit-redo', 'redo'],
  ])('forwards a %s click as the %s action', (id, action) => {
    ;(findItem(template, id).click as () => void)()
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith(action)
  })

  it('leaves the undo/redo accelerators display-only for the renderer key bindings', () => {
    expect(findItem(template, 'edit-undo').registerAccelerator).toBe(false)
    expect(findItem(template, 'edit-redo').registerAccelerator).toBe(false)
  })

  it('keeps the native roles for quitting and clipboard editing', () => {
    const roles = template.flatMap((menu) =>
      ((menu.submenu as MenuItemConstructorOptions[]) ?? []).map((item) => item.role)
    )
    expect(roles).toEqual(expect.arrayContaining(['quit', 'cut', 'copy', 'paste', 'selectAll']))
  })

  it('keeps the native Window menu', () => {
    expect(template.map((menu) => menu.role)).toEqual(expect.arrayContaining(['windowMenu']))
  })

  it('routes the Reload item through the guard rather than the renderer', () => {
    ;(findItem(template, 'view-reload').click as () => void)()
    expect(onReload).toHaveBeenCalledTimes(1)
    expect(send).not.toHaveBeenCalled()
  })

  it('gives Reload no accelerator, so only the menu itself can reload', () => {
    expect(findItem(template, 'view-reload').accelerator).toBeUndefined()
  })

  it('ships no native reload role, whose Ctrl+R would bypass the guard', () => {
    const roles = template.flatMap((menu) => [
      menu.role,
      ...((menu.submenu as MenuItemConstructorOptions[]) ?? []).map((item) => item.role),
    ])
    expect(roles).not.toEqual(expect.arrayContaining(['viewMenu']))
    expect(roles).not.toEqual(expect.arrayContaining(['reload']))
    expect(roles).not.toEqual(expect.arrayContaining(['forceReload']))
  })
})

describe('installApplicationMenu', () => {
  it('builds the template and installs it as the application menu', () => {
    installApplicationMenu(vi.fn(), vi.fn())
    expect(buildFromTemplate).toHaveBeenCalledTimes(1)
    expect(setApplicationMenu).toHaveBeenCalledWith(buildFromTemplate.mock.results[0]!.value)
  })
})
