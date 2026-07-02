import { isAbsolute, relative, resolve, sep } from 'node:path'
import { runSandbox, type Exec, type SandboxOptions } from './docker'

export interface CliOptions {
  benchFile: string
  cpus: number
  cpuset: string
  memory: string
  imageTag: string
  mounts: string[]
  md: boolean
  rounds: number
  gcInner: boolean
}

/** Host-side sandbox defaults from a bench file's `options.sandbox`. */
export interface SandboxDefaults {
  cpuset?: string
  cpus?: number
  memory?: string
  tag?: string
  mount?: string[]
}

const DEFAULTS = {
  cpus: 1,
  cpuset: '0',
  memory: '512m',
  imageTag: 'soroush-bench:latest',
  rounds: 1,
}

function requireValue(value: string | undefined, flag: string): string {
  if (value === undefined) {
    throw new Error(`bench: ${flag} requires a value`)
  }
  return value
}

function parseCpus(value: string | undefined): number {
  const cpus = Number(requireValue(value, '--cpus'))
  if (!Number.isFinite(cpus) || cpus <= 0) {
    throw new Error('bench: --cpus must be a positive number')
  }
  return cpus
}

function parseRounds(value: string | undefined): number {
  const rounds = Number(requireValue(value, '--rounds'))
  if (!Number.isInteger(rounds) || rounds < 1) {
    throw new Error('bench: --rounds must be a positive integer')
  }
  return rounds
}

/** Parses `soroush-bench <file> [--cpus N] [--cpuset C] [--memory M] [--tag T]`. */
export function parseCliArgs(argv: string[], fileSandbox: SandboxDefaults = {}): CliOptions {
  // Precedence: hardcoded defaults < bench-file options.sandbox < CLI flags.
  const opts = { ...DEFAULTS }
  if (fileSandbox.cpuset !== undefined) opts.cpuset = fileSandbox.cpuset
  if (fileSandbox.cpus !== undefined) opts.cpus = fileSandbox.cpus
  if (fileSandbox.memory !== undefined) opts.memory = fileSandbox.memory
  if (fileSandbox.tag !== undefined) opts.imageTag = fileSandbox.tag
  const mounts: string[] = fileSandbox.mount ? [...fileSandbox.mount] : []
  let md = false
  let gcInner = false
  let benchFile: string | undefined

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    switch (arg) {
      case '--cpu':
      case '--cpus':
        i += 1
        opts.cpus = parseCpus(argv[i])
        break
      case '--cpuset':
        i += 1
        opts.cpuset = requireValue(argv[i], '--cpuset')
        break
      case '--memory':
        i += 1
        opts.memory = requireValue(argv[i], '--memory')
        break
      case '--tag':
        i += 1
        opts.imageTag = requireValue(argv[i], '--tag')
        break
      case '--mount':
        i += 1
        mounts.push(requireValue(argv[i], '--mount'))
        break
      case '--md':
        md = true
        break
      case '--rounds':
        i += 1
        opts.rounds = parseRounds(argv[i])
        break
      case '--gc-inner':
        gcInner = true
        break
      case '--':
        // Ignore a bare `--` (package managers forward it to scripts).
        break
      default:
        if (arg.startsWith('--')) {
          throw new Error(`bench: unknown option ${arg}`)
        }
        if (benchFile !== undefined) {
          throw new Error('bench: only one bench file may be given')
        }
        benchFile = arg
    }
  }

  if (benchFile === undefined) {
    throw new Error('bench: a bench file path is required')
  }
  return { benchFile, ...opts, mounts, md, gcInner }
}

/** Maps parsed options + host paths into the concrete sandbox run options. */
export function resolveSandboxOptions(
  cli: CliOptions,
  cwd: string,
  packageRoot: string
): SandboxOptions {
  const rel = relative(cwd, resolve(cwd, cli.benchFile))
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('bench: the bench file must live inside the current directory')
  }
  return {
    imageTag: cli.imageTag,
    contextDir: packageRoot,
    repoDir: cwd,
    appDir: packageRoot,
    benchRelPath: rel.split(sep).join('/'),
    cpuset: cli.cpuset,
    cpus: cli.cpus,
    memory: cli.memory,
    extraMounts: cli.mounts,
    md: cli.md,
    rounds: cli.rounds,
    gcInner: cli.gcInner,
  }
}

export interface MainDeps {
  cwd: string
  packageRoot: string
  exec: Exec
  /**
   * Optional host-side loader that reads a bench file's `options.sandbox`
   * (injected by the bin; returns `{}` if the file can't be loaded on the host).
   */
  loadSandbox?: (benchFile: string) => Promise<SandboxDefaults>
}

/** Parses argv, resolves the run, and executes it in the pinned sandbox. */
export async function main(argv: string[], deps: MainDeps): Promise<void> {
  // Pre-load the bench file on the host (if possible) for its options.sandbox
  // defaults, then re-parse so CLI flags still win.
  const benchFile = parseCliArgs(argv).benchFile
  const fileSandbox = deps.loadSandbox ? await deps.loadSandbox(benchFile) : {}
  const cli = parseCliArgs(argv, fileSandbox)
  const opts = resolveSandboxOptions(cli, deps.cwd, deps.packageRoot)
  await runSandbox(opts, deps.exec)
}
