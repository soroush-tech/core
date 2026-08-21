import { spawn } from 'node:child_process'
import { autoUpdater } from 'electron-updater'
import { bootstrap } from './bootstrap'

// All wiring lives in bootstrap.ts (unit-tested); this entry only injects the
// real spawn and the real updater. Covered by the Playwright e2e suite instead
// of unit tests.
bootstrap(spawn, autoUpdater)
