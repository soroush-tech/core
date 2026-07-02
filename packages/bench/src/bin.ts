#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { main, type SandboxDefaults } from './cli'

/** Real process runner: inherits stdio so Docker/mitata output streams through. */
const exec = (command: string, args: string[]): Promise<number> =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => resolvePromise(code ?? 0))
  })

// Import the bench file on the host to read its `options.sandbox` defaults.
// Node 23.6+ runs .ts natively (type-stripping); if the file can't be loaded on
// the host (older Node, or in-container-only imports), fall back to no defaults.
const loadSandbox = async (benchFile: string): Promise<SandboxDefaults> => {
  try {
    const url = pathToFileURL(resolve(process.cwd(), benchFile)).href
    const mod = (await import(url)) as { default?: { options?: { sandbox?: SandboxDefaults } } }
    return mod.default?.options?.sandbox ?? {}
  } catch {
    return {}
  }
}

// dist/bin.mjs lives one level below the package root (which holds the Dockerfile).
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

main(process.argv.slice(2), { cwd: process.cwd(), packageRoot, exec, loadSandbox }).catch(
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
)
