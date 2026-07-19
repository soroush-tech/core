# @soroush.tech/bench

[![npm version](https://img.shields.io/npm/v/@soroush.tech/bench.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/bench.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)
[![coverage](https://codecov.io/gh/soroush-tech/core/branch/main/graph/badge.svg?flag=bench)](https://app.codecov.io/gh/soroush-tech/core?flags%5B0%5D=bench)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/bench.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)
[![types included](https://img.shields.io/npm/types/@soroush.tech/bench.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)
[![license](https://img.shields.io/npm/l/@soroush.tech/bench.svg?cacheSeconds=86400)](./LICENSE)

Run A/B function benchmarks inside a **CPU/RAM-pinned Docker sandbox** so the
numbers stay stable run-to-run and are not skewed by whatever else the machine
is doing. Built on [mitata](https://github.com/evanwashere/mitata).

Compare:

- two (or more) implementations of the same function, or
- two-or-more **versions of one npm package** (e.g. `lodash@4` vs `lodash@5`).

> **What pinning does and does not buy you.** Pinning to a single core
> (`--cpuset-cpus`), a hard CPU quota (`--cpus`), and fixed memory with swap off
> (`--memory` + `--memory-swap`) removes the noise from background load, turbo
> boost variance, and paging — so repeated runs **on the same host** agree. It
> does **not** make results identical across different physical CPUs (a
> container shares the host kernel and silicon). For numbers that are identical
> on any machine, count operations instead of measuring time.

## Install

```sh
# npm
npm install -D @soroush.tech/bench
```

```sh
# pnpm
pnpm add -D @soroush.tech/bench
```

```sh
# yarn
yarn add -D @soroush.tech/bench
```

Requires **Node ≥ 18** on the host (Node 23.6+ unlocks `options.sandbox` — see below).

Installing exposes the **`soroush-bench`** CLI (in `node_modules/.bin`, or on your
`PATH` with a global install). You can also run it without installing (use the package
name, quoted for PowerShell):

```sh
npx '@soroush.tech/bench' ./my.bench.ts
```

## Docker setup

Benchmarks run inside Docker, so install and start it before your first run:

1. **Install Docker**
   - macOS / Windows → [Docker Desktop](https://docs.docker.com/desktop/)
   - Linux → [Docker Engine](https://docs.docker.com/engine/install/)

2. **Start it and confirm the daemon is up:**

   ```sh
   docker info
   ```

   If it errors with `Cannot connect to the Docker daemon`, launch Docker Desktop (or
   `sudo systemctl start docker` on Linux) and wait until it reports ready.

3. **First run builds the sandbox image** (`node:24-slim` + `tsx`) once. It's content-stable
   and **cached**, so subsequent runs skip straight to the container — no rebuild.

Nothing else to prepare: your bench file, the packages it compares, and the harness are all
mounted or installed at run time. On **Docker Desktop (Windows/WSL2)** no extra config is
needed for the defaults; see [pnpm workspaces](#pnpm-workspaces) only if you benchmark a
locally-linked package.

## Usage

Write a `*.bench.ts` file that default-exports a `defineBench(...)` config:

```ts
// clone.bench.ts
import defineBench from '@soroush.tech/bench'

const data = { a: 1, nested: { b: [1, 2, 3] } }

export default defineBench({
  name: 'deep clone',
  cases: {
    structuredClone: () => structuredClone(data),
    jsonRoundtrip: () => JSON.parse(JSON.stringify(data)),
  },
})
```

Run it in the pinned sandbox:

```sh
soroush-bench ./clone.bench.ts
```

### Install-free: `export default` a plain object

`defineBench` is optional — the CLI validates the config itself. A plain-object export
runs with plain `npx` and **nothing installed at runtime** (any `import type` is erased),
so you keep type checking while staying install-free:

```ts
// clone.bench.ts — `import type` is erased at runtime, so this still runs
// install-free; `satisfies BenchConfig` type-checks it without a runtime wrapper.
import type { BenchConfig } from '@soroush.tech/bench'

const data = { a: 1, nested: { b: [1, 2, 3] } }

export default {
  name: 'deep clone',
  cases: {
    structuredClone: () => structuredClone(data),
    jsonRoundtrip: () => JSON.parse(JSON.stringify(data)),
  },
  options: { rounds: 5 },
} satisfies BenchConfig
```

```sh
npx '@soroush.tech/bench' ./clone.bench.ts
```

Three ways to author, all validated identically inside the sandbox:

- **`defineBench({ … })`** — types **and** authoring-time validation (throws on a bad config).
- **plain object `satisfies BenchConfig`** — type checking with **no runtime wrapper**; the
  `import type` is erased, so `npx` still needs nothing installed.
- **bare object** (drop the `import type`/`satisfies`) — zero setup, no types.

### Comparing versions of one package

Declare each version under an alias in `packages`; the harness installs them side
by side (via npm alias installs) and injects the resolved modules into every case
via `ctx.modules` — so you can hold two versions of one package in one run:

```ts
// lodash.bench.ts
import defineBench from '@soroush.tech/bench'

export default defineBench({
  name: 'lodash cloneDeep',
  packages: { v4: 'lodash@4.17.21', v5: 'lodash@5.0.0' },
  cases: {
    v4: ({ modules }) => (modules.v4 as typeof import('lodash')).cloneDeep({ a: [1, 2, 3] }),
    v5: ({ modules }) => (modules.v5 as typeof import('lodash')).cloneDeep({ a: [1, 2, 3] }),
  },
})
```

### Comparing a local workspace package against npm

Because the sandbox mounts the whole repo, a local workspace package is reached
with a normal top-level import, while the npm release is installed under an
alias. This benchmarks the local `@soroush.tech/styled-system` rewrite against
the original `styled-system` it replaces:

```ts
// styled-system-color.bench.ts
import { color } from '@soroush.tech/styled-system/color' // local source (mounted repo)
import defineBench from '@soroush.tech/bench'

const props = { theme: { colors: { brand: '#0af', muted: '#666' } }, color: 'brand', bg: 'muted' }
type ColorFn = (props: typeof props) => unknown

export default defineBench({
  name: 'styled-system color()',
  packages: { upstream: 'styled-system@5.1.5' }, // npm release
  cases: {
    local: () => color(props),
    upstream: ({ modules }) => (modules.upstream as { color: ColorFn }).color(props),
  },
})
```

Run it from the repo root so the mount includes both the workspace package and
its `node_modules` link:

```sh
soroush-bench ./examples/bench/styled-system-hardest.bench.ts
```

> The same shape compares **two-or-more versions of one npm package** — give
> several aliases the same name at different versions (e.g.
> `{ v4: 'lodash@4.17.21', v5: 'lodash@5.0.0' }`) and read each off `ctx.modules`.

## Options

| Flag         | Default                | Meaning                                                                                                                                                                                                                                   |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--cpus`     | `1`                    | CPU quota (`docker run --cpus`).                                                                                                                                                                                                          |
| `--cpuset`   | `0`                    | Logical CPU(s) to pin to (`--cpuset-cpus`, e.g. `0,2`).                                                                                                                                                                                   |
| `--memory`   | `512m`                 | Memory cap; swap is pinned to the same.                                                                                                                                                                                                   |
| `--tag`      | `soroush-bench:latest` | Sandbox image tag.                                                                                                                                                                                                                        |
| `--mount`    | —                      | Extra `host:container[:ro]` volume, passed through to `docker -v`. Repeatable.                                                                                                                                                            |
| `--md`       | —                      | **Append** a markdown results table after the normal report — for pasting into reports/PRs. Columns: case · avg · p75 · alloc/iter (with **% vs least**) · [gc/iter] · % vs fastest. The `gc/iter` column appears only with `--gc-inner`. |
| `--rounds`   | `1`                    | Repeat the whole suite N times and report the **median per case** (as a table) — cancels cross-run noise for a more reliable comparison.                                                                                                  |
| `--gc-inner` | —                      | Run GC **before each iteration** (mitata `gc('inner')`) so the report includes a per-iteration **GC-timing** row. Default is `gc('once')` after warmup.                                                                                   |

## What the report shows

The default output is rendered by [mitata](https://github.com/evanwashere/mitata) and includes:

- a **per-case histogram** with min/avg/p75/max timing and a **heap-allocation** row
  (bytes allocated per iteration);
- a **boxplot chart** comparing the cases;
- a **summary** (`N× faster …`) plus this package's **`delta vs fastest`** percentages.

The sandbox runs Node with **`--expose-gc`**, so mitata performs a collection after
warmup for steadier samples and can report GC/heap-usage rows.

Add `--md` to **append** a compact markdown table (time · p75 · alloc/iter · % vs
fastest, plus `gc/iter` under `--gc-inner`) after that report — handy for reports/PRs.
`--rounds N` instead replaces the report with a median-of-N table.

### Reading the columns

| Column       | Meaning                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| `avg`        | Mean time per call, over all samples.                                                       |
| `p75`        | 75th-percentile time — robust to the slow tail (GC/JIT spikes); often the number to trust.  |
| `alloc/iter` | Mean bytes allocated per call, with **`% vs least`** — the memory analogue of `vs fastest`. |
| `gc/iter`    | Mean GC time per iteration (only under `--gc-inner`).                                       |
| `vs fastest` | Each case's `avg` relative to the fastest case.                                             |

If `avg ≫ p75`, the mean is skewed by rare slow samples — trust `p75`. Rows are
sorted fastest-first.

### Memory is only meaningful above ~1 KB/iter

`alloc/iter` is estimated from a **heap-size delta**, so for workloads that
allocate only tens–hundreds of bytes per call it's **below the measurement floor**
and swings wildly run-to-run (the same code can report `9 B` and `16 KB` on
different runs). Only compare allocation when it's **well above ~1 KB/iter**; for
tiny workloads, read the time columns and ignore `alloc/iter`. `--gc-inner`'s
`gc/iter` is likewise dominated by the fixed cost of a forced full GC on
low-allocation benches, so it only discriminates on allocation-heavy ones.

### Hardware counters (IPC, cycles, cache) — native Linux only

mitata can show CPU counters via [`@mitata/counters`](https://github.com/evanwashere/mitata#hardware-counters),
but they require **direct PMU access**. Under **Docker Desktop (WSL2)** the PMU is
virtualized away by the hypervisor — counters render as `NaN`/`0.00` even with
`--privileged` — so they only work when the sandbox runs on **native Linux Docker**
(bare metal, `perf_event_paranoid ≤ 2`). This build does not enable them by default.

## pnpm workspaces

pnpm links workspace packages with **absolute** symlinks. Inside the sandbox
those only resolve if the repo is also mounted at its host-visible path. With
Docker Desktop that path is `/mnt/host/<drive>/…`, so to benchmark a local
workspace package add:

```sh
soroush-bench ./examples/bench/styled-system-color.bench.ts \
  --cpuset 0,2 --cpus 2 --memory 1g \
  --mount "$PWD:/mnt/host/c/Users/you/your-repo:ro"
```

(npm/yarn flat `node_modules` need no extra mount — the package is copied, not
symlinked out of the repo.)

## Pinning on hybrid CPUs (P/E cores) & Docker Desktop

On Intel 12th–14th gen (P-cores + E-cores), prefer a pin that avoids SMT
siblings: `--cpuset 0` (a single thread — most reproducible, and enough since a
mitata run is single-threaded) or `--cpuset 0,2` (two **distinct** physical
cores), not `0-1` (which is the two hyperthreads of one core → SMT contention).
Confirm a pin with `cat /sys/devices/system/cpu/cpu<N>/topology/thread_siblings_list`.

Under **Docker Desktop (WSL2)** the hybrid topology is virtualized — `lscpu`
reports a flat layout with no P/E distinction — so `--cpuset` selects VM vCPUs
and the Windows scheduler/Thread Director decides their physical placement.
Physical P-core residency is therefore **not** guaranteed here; for that, use
native Linux Docker, or pin at the `.wslconfig`/Windows-affinity layer.

For flat run-to-run numbers the biggest lever is locking the clock: cap power in
BIOS (PL1/PL2) or disable Turbo (BIOS, or Windows power plan max state 99%), so a
thermal/turbo spike mid-run can't skew a sample.

## API

```ts
import defineBench, {
  isBenchConfig,
  type BenchConfig,
  type BenchContext,
  type BenchCase,
  type BenchOptions,
} from '@soroush.tech/bench'
```

The default export is `defineBench`; everything else is a named export.

| Export                | Kind               | What it is                                                                                                         |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `defineBench(config)` | function (default) | Validates and freezes a `BenchConfig` (non-empty `name`, ≥ 2 `cases`). Optional — a plain-object export works too. |
| `isBenchConfig(x)`    | function           | Type guard — `true` if `x` was produced by `defineBench` (used internally to skip re-validating).                  |
| `BenchConfig`         | type               | The bench definition: `name`, optional `packages`, `cases`, optional `options`.                                    |
| `BenchCase`           | type               | One function under test (sync or async): `(ctx: BenchContext) => unknown`.                                         |
| `BenchContext`        | type               | The `{ modules }` object every case receives — each `packages` alias resolved to its module namespace.             |
| `BenchOptions`        | type               | Run defaults: `gc`, `rounds`, `warmup`, and `sandbox` (see below). Each is overridden by the matching CLI flag.    |

`BenchConfig` shape:

```ts
interface BenchConfig {
  name: string // report label, prefixes each case
  packages?: Record<string, string> // alias → npm install spec, injected as ctx.modules[alias]
  cases: Record<string, BenchCase> // ≥ 2 named functions to compare
  options?: BenchOptions // baked-in run defaults
}
```

### Per-bench defaults: `options`

Bake run defaults into the bench file via `options`; the matching CLI flag
**overrides** each at run time:

```ts
export default defineBench({
  name: 'deep clone',
  cases: { … },
  options: {
    gc: 'inner', // 'once' (default) | 'inner' | false   — overridden by --gc-inner
    rounds: 5, //   median-of-N                          — overridden by --rounds
    warmup: 1000, // warmup iterations per case before measuring
    sandbox: {
      // pinning defaults — overridden by --cpuset / --cpus / --memory / --tag / --mount
      cpuset: '0',
      cpus: 1,
      memory: '512m',
    },
  },
})
```

Every option and its accepted values:

| Option           | Values                              | Default                | CLI override           |
| ---------------- | ----------------------------------- | ---------------------- | ---------------------- |
| `gc`             | `false` \| `'once'` \| `'inner'`    | `'once'`               | `--gc-inner` (→ inner) |
| `rounds`         | positive integer                    | `1`                    | `--rounds <n>`         |
| `warmup`         | non-negative integer                | `0`                    | — (file only)          |
| `sandbox.cpuset` | string, e.g. `'0'`, `'0,2'`, `'18'` | `'0'`                  | `--cpuset`             |
| `sandbox.cpus`   | positive number                     | `1`                    | `--cpus`               |
| `sandbox.memory` | string, e.g. `'512m'`, `'1g'`       | `'512m'`               | `--memory`             |
| `sandbox.tag`    | string                              | `soroush-bench:latest` | `--tag`                |
| `sandbox.mount`  | `string[]` (`host:container[:ro]`)  | —                      | `--mount` (appended)   |

`gc` / `rounds` / `warmup` are read **inside** the sandbox. `sandbox.*` is read **on
the host** before `docker run`: the CLI imports the bench file (Node 23.6+ runs `.ts`
natively; older Node needs a TS loader) to pick up these defaults. If the file can't be
loaded on the host — e.g. it top-level-imports an in-container-only module — the host
pre-load is skipped and you pass the pinning flags on the CLI instead. **CLI flags always
win**, and `--mount` values are appended to `sandbox.mount`.

## Versioning

Follows [SemVer](https://semver.org). The **public surface** the version covers:

- the default export `defineBench` and the named export `isBenchConfig`;
- the exported types `BenchConfig`, `BenchOptions`, `BenchCase`, `BenchContext`;
- the `soroush-bench` bin and its documented CLI flags;
- the bench-file contract — a default-exported config (via `defineBench` or a plain object),
  `packages:` alias installs, and `ctx.modules`.

Breaking changes to any of those ship as a **major** bump, so **pin a caret range** to stay
compatible:

```jsonc
"@soroush.tech/bench": "^1.0.0" // all 1.x, never auto-upgrades to 2.0.0
```

The `0.x` line predates this guarantee (0.1 → 1.0 renamed the bin `bench` → `soroush-bench`
and moved `warmup` under `options`); upgrade to `>=1`. Not part of the contract — and free
to change in a minor — are the **report layout/formatting**, mitata internals, and the
Docker base image.

## FAQ

**Why Docker?**
Isolation plus CPU/RAM pinning (`--cpuset-cpus`, `--cpus`, `--memory` with swap off) is
what makes numbers stable run-to-run — background load, turbo variance, and paging are
removed. The sandbox image is generic and built once, then cached; each run only re-runs
the container.

**Do I need to import `defineBench`?**
No. A bench file can `export default { … }` a plain object — the CLI validates it for you,
so the file needs no dependency (great for `npx`). Use `defineBench({ … })` when you want
**TypeScript types and authoring-time validation**; both are validated identically at run.

**`npx soroush-bench ./file` can't find it — why?**
Run it by **package name**: `npx '@soroush.tech/bench' ./file`. `npx soroush-bench` only
resolves once the package is installed locally (then `soroush-bench` is a local bin);
otherwise npx looks for a registry package literally named `soroush-bench`. In **PowerShell**
quote the `@…` — a leading `@` is the splat operator.

**Does it need internet?**
Only if a bench declares `packages:` — those are npm-installed **inside the sandbox** on
each run (that's the `added N packages` line). A bench with no `packages` runs offline.

**My library reports more memory, and the number changes every run.**
`alloc/iter` is estimated from a heap-size delta, so below ~**1 KB/iter** it's at the
measurement floor and swings wildly (the same code can read `9 B` and `16 KB`). Only trust
memory on **allocation-heavy** benches; for tiny workloads read the time columns and use
`--rounds` to median them.

**Why is `--gc-inner` so much slower?**
It forces a full GC **before every iteration**, so the per-iteration time absorbs that
cost. It exists to surface the `gc/iter` row on allocation-heavy benches — not for headline
timing. Default GC mode is `once` (after warmup).

**Can I see IPC / cycles / cache counters?**
Only on **native Linux Docker** with [`@mitata/counters`](https://github.com/evanwashere/mitata#hardware-counters)
and PMU access. Under Docker Desktop (WSL2) the PMU is virtualized away, so counters read
`NaN`/`0` even with `--privileged`.

**Can pinning flags live in the bench file?**
Yes — `options.sandbox` (`cpuset`/`cpus`/`memory`/`tag`/`mount`) is read on the host before
`docker run`. CLI flags still override, and the file must be host-loadable (see above).

## Release notes

Per-version notes for every published release live in
[`release-notes/`](https://github.com/soroush-tech/core/tree/main/packages/bench/release-notes).
