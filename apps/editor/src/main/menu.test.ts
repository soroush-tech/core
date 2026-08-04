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
  const template = createMenuTemplate(send)

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

  it('keeps the native View and Window menus', () => {
    const menuRoles = template.map((menu) => menu.role)
    expect(menuRoles).toEqual(expect.arrayContaining(['viewMenu', 'windowMenu']))
  })
})

describe('installApplicationMenu', () => {
  it('builds the template and installs it as the application menu', () => {
    const send = vi.fn()
    installApplicationMenu(send)
    expect(buildFromTemplate).toHaveBeenCalledTimes(1)
    expect(setApplicationMenu).toHaveBeenCalledWith(buildFromTemplate.mock.results[0]!.value)
  })
})
