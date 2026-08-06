import { spawn } from 'node:child_process'
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import { bootstrap } from './bootstrap'
import { startAutoUpdates } from './updater'

// All wiring lives in bootstrap.ts and updater.ts (unit-tested); this entry
// only injects the real spawn and the real updater. Covered by the Playwright
// e2e suite instead of unit tests.
bootstrap(spawn)
void app.whenReady().then(() => startAutoUpdates(app.isPackaged, autoUpdater))
