import { describe, expect, it, vi } from 'vitest'
import { main, parseCliArgs, resolveSandboxOptions } from './cli'

describe('parseCliArgs', () => {
  it('applies defaults with only a bench file', () => {
    expect(parseCliArgs(['clone.bench.ts'])).toEqual({
      benchFile: 'clone.bench.ts',
      cpus: 1,
      cpuset: '0',
      memory: '512m',
      imageTag: 'soroush-bench:latest',
      mounts: [],
      md: false,
      rounds: 1,
      gcInner: false,
    })
  })

  it('ignores a bare -- (forwarded by package managers)', () => {
    expect(parseCliArgs(['--', 'clone.bench.ts', '--']).benchFile).toBe('clone.bench.ts')
  })

  it('applies file sandbox defaults, each overridden by a CLI flag', () => {
    const cli = parseCliArgs(['--cpus', '4', 'f.bench.ts'], {
      cpuset: '5',
      cpus: 1,
      memory: '1g',
      tag: 't',
      mount: ['a:/a'],
    })
    expect(cli).toMatchObject({
      cpuset: '5', // from file
      cpus: 4, // CLI overrides file
      memory: '1g', // from file
      imageTag: 't', // from file
      mounts: ['a:/a'], // from file
    })
  })

  it('appends CLI mounts after the file sandbox mounts', () => {
    expect(parseCliArgs(['--mount', 'b:/b', 'f.bench.ts'], { mount: ['a:/a'] }).mounts).toEqual([
      'a:/a',
      'b:/b',
    ])
  })

  it('parses every flag, including the --cpu alias and repeated --mount', () => {
    expect(
      parseCliArgs([
        '--cpu',
        '2',
        '--cpuset',
        '3',
        '--memory',
        '1g',
        '--tag',
        'x',
        '--mount',
        'a:/a',
        '--mount',
        'b:/b',
        '--md',
        '--md-file',
        '/out/results.md',
        '--rounds',
        '5',
        '--gc-inner',
        '--baseline-case',
        'upstream',
        '--min-ratio',
        '80',
        'f.bench.ts',
      ])
    ).toEqual({
      benchFile: 'f.bench.ts',
      cpus: 2,
      cpuset: '3',
      memory: '1g',
      imageTag: 'x',
      mounts: ['a:/a', 'b:/b'],
      md: true,
      mdFile: '/out/results.md',
      rounds: 5,
      gcInner: true,
      baselineCase: 'upstream',
      minRatio: 80,
    })
  })

  it('accepts a fractional --min-ratio', () => {
    expect(
      parseCliArgs(['--baseline-case', 'up', '--min-ratio', '87.5', 'f.bench.ts']).minRatio
    ).toBe(87.5)
  })

  it.each([
    [['--cpus', '0'], /--cpus must be a positive number/],
    [['--cpus', 'abc'], /--cpus must be a positive number/],
    [['--cpus'], /--cpus requires a value/],
    [['--rounds', '0'], /--rounds must be a positive integer/],
    [['--rounds', '1.5'], /--rounds must be a positive integer/],
    [['--rounds', 'x'], /--rounds must be a positive integer/],
    [['--rounds'], /--rounds requires a value/],
    [['--cpuset'], /--cpuset requires a value/],
    [['--memory'], /--memory requires a value/],
    [['--tag'], /--tag requires a value/],
    [['--mount'], /--mount requires a value/],
    [['--md-file'], /--md-file requires a value/],
    [['--baseline-case'], /--baseline-case requires a value/],
    [['--min-ratio'], /--min-ratio requires a value/],
    [['--min-ratio', '0', 'f'], /--min-ratio must be a positive number/],
    [['--min-ratio', '-5', 'f'], /--min-ratio must be a positive number/],
    [['--min-ratio', 'abc', 'f'], /--min-ratio must be a positive number/],
    [['--baseline-case', 'up', 'f'], /--baseline-case and --min-ratio must be given together/],
    [['--min-ratio', '80', 'f'], /--baseline-case and --min-ratio must be given together/],
    [['--nope', 'f'], /unknown option --nope/],
    [['a', 'b'], /only one bench file/],
    [[], /a bench file path is required/],
  ])('rejects %j', (argv, message) => {
    expect(() => parseCliArgs(argv)).toThrow(message)
  })
})

describe('resolveSandboxOptions', () => {
  const cli = {
    benchFile: 'bench/clone.bench.ts',
    cpus: 1,
    cpuset: '0',
    memory: '512m',
    imageTag: 'tag',
    mounts: ['/host:/mnt/host:ro'],
    md: true,
    mdFile: '/mnt/host/results.md',
    rounds: 3,
    gcInner: false,
    baselineCase: 'upstream',
    minRatio: 80,
  }

  it('mounts cwd as the repo and the package as the app, posix-ifying the path', () => {
    expect(resolveSandboxOptions(cli, '/work/repo', '/work/repo/packages/bench')).toEqual({
      imageTag: 'tag',
      contextDir: '/work/repo/packages/bench',
      repoDir: '/work/repo',
      appDir: '/work/repo/packages/bench',
      benchRelPath: 'bench/clone.bench.ts',
      cpuset: '0',
      cpus: 1,
      memory: '512m',
      extraMounts: ['/host:/mnt/host:ro'],
      md: true,
      mdFile: '/mnt/host/results.md',
      rounds: 3,
      gcInner: false,
      baselineCase: 'upstream',
      minRatio: 80,
    })
  })

  it('rejects a bench file outside the current directory', () => {
    expect(() =>
      resolveSandboxOptions({ ...cli, benchFile: '../outside.bench.ts' }, '/work/repo', '/pkg')
    ).toThrow(/must live inside the current directory/)
  })
})

describe('main', () => {
  it('parses, resolves, and runs the sandbox', async () => {
    const exec = vi.fn().mockResolvedValue(0)
    await main(['clone.bench.ts'], { cwd: '/work', packageRoot: '/pkg', exec })
    expect(exec).toHaveBeenCalledTimes(2)
    expect(exec).toHaveBeenNthCalledWith(1, 'docker', expect.arrayContaining(['build']))
    expect(exec).toHaveBeenNthCalledWith(2, 'docker', expect.arrayContaining(['run']))
  })

  it('pre-loads options.sandbox from the bench file; CLI flags still override', async () => {
    const exec = vi.fn().mockResolvedValue(0)
    const loadSandbox = vi.fn().mockResolvedValue({ cpuset: '3', cpus: 2, memory: '1g' })
    await main(['clone.bench.ts', '--memory', '2g'], {
      cwd: '/work',
      packageRoot: '/pkg',
      exec,
      loadSandbox,
    })
    expect(loadSandbox).toHaveBeenCalledWith('clone.bench.ts')
    const runArgs = exec.mock.calls[1][1] as string[]
    expect(runArgs).toEqual(expect.arrayContaining(['--cpuset-cpus', '3', '--cpus', '2']))
    // CLI --memory 2g wins over the file's 1g.
    expect(runArgs[runArgs.indexOf('--memory') + 1]).toBe('2g')
  })
})
