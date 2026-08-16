import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import type { Plugin } from 'vite'

const run = promisify(execFile)

export type WatchOptions = {
  /** Codegen script to execute, relative to the project root. */
  script: string
  /** Source file(s) whose edits re-run the script during dev. */
  watch?: string | string[]
}

/**
 * Dev-only convenience: regenerates a codegen `script`'s output while you work - once when
 * the dev server starts, and again whenever a `watch` file is edited. Scoped to
 * `apply: 'serve'`; the build and tests consume the committed generated file (kept honest by
 * a drift-guard test), so the plugin never runs there. Run `pnpm <script>` to regenerate
 * outside of dev.
 */
export default function watch({ script, watch }: WatchOptions): Plugin {
  const watchList = watch === undefined ? [] : [watch].flat()
  let scriptPath = script
  let watchPaths = watchList

  const generate = () => run(process.execPath, [scriptPath])

  return {
    name: 'vite-plugin-watch',
    apply: 'serve',
    configResolved({ root }) {
      scriptPath = resolve(root, script)
      watchPaths = watchList.map((file) => resolve(root, file))
    },
    async buildStart() {
      await generate()
    },
    configureServer(server) {
      if (watchPaths.length === 0) return
      server.watcher.add(watchPaths)
      server.watcher.on('change', (file) => {
        if (watchPaths.includes(resolve(file))) {
          generate()
        }
      })
    },
  }
}
