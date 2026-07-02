# @soroush.tech/bench — examples

Runnable benchmarks that consume the **published** [`@soroush.tech/bench`](../../packages/bench)
from npm — the same way an end user would. No workspace linking, no `run.mjs`.

Two examples:

- [`clone.bench.ts`](./clone.bench.ts) — **install-free**: a plain-object bench (no import,
  no dependencies) runnable with plain `npx`.
- [`styled-system-hardest.bench.ts`](./styled-system-hardest.bench.ts) — compares two npm
  packages downloaded inside the sandbox.

## Requirements

- **Docker** installed and running (the benchmark executes in a CPU/RAM-pinned sandbox).
- **`@soroush.tech/bench` ≥ 1.0.0** on npm (provides the `soroush-bench` bin, `options`,
  and `--md`/`--rounds`/`--gc-inner`).

## Install-free: run with `npx` (nothing installed)

`clone.bench.ts` imports nothing and declares no `packages`, so `npx` fetches the CLI on
the fly and runs it — **use the package name, quoted for PowerShell**:

```sh
npx '@soroush.tech/bench' ./clone.bench.ts --cpuset 0 --cpus 1 --memory 512m
```

> Use the **package name** (`@soroush.tech/bench`), not the bin name. `npx soroush-bench`
> only resolves once the package is installed locally (below) — otherwise npx looks for a
> registry package literally named `soroush-bench`, which isn't this one.

## Install, then run

This folder is intentionally **outside** the pnpm workspace, so install it on its own:

```sh
cd examples/bench
npm install
```

That pulls the latest `@soroush.tech/bench` and exposes the `soroush-bench` CLI in
`node_modules/.bin`. Now the short forms work too:

```sh
# via the package script (everything after -- is forwarded to soroush-bench)
npm run bench -- ./styled-system-hardest.bench.ts --cpuset 0 --cpus 1 --memory 512m

# or the now-local bin
npx soroush-bench ./styled-system-hardest.bench.ts --cpuset 0 --cpus 1 --memory 512m
```

The two styled-system packages under comparison are **downloaded from npm inside the
sandbox** at run time (via the bench file's `packages:` field) — nothing is installed
into this folder for them.

## What `styled-system-hardest.bench.ts` measures

The heaviest realistic call: `compose()` of **every** style category applied to a
maximal, fully-responsive props object, comparing the TypeScript rewrite against the
original it replaces:

- `@soroush.tech/styled-system@5.2.0` (new TS rewrite)
- `styled-system@5.1.5` (original)

It bakes in run defaults via `options` (`gc: 'inner'`, `rounds: 10`, `warmup: 1000`);
any CLI flag overrides them.

## Reading the output

You get mitata's report (per-case histograms with a heap-allocation row, a boxplot
chart, and an `N× faster` summary) plus a `delta vs fastest` line. Add `--md` to append
a markdown table (avg · p75 · alloc/iter with `% vs least` · gc/iter · vs fastest).

See the [package README](../../packages/bench/README.md) for all flags, the `defineBench`
API, and caveats (e.g. memory is only meaningful above ~1 KB/iter; hardware counters need
native Linux).

## Report 10 round

clk: ~5.40 GHz
cpu: Intel(R) Core(TM) i9-14900K -> not ideal for benchmarking
runtime: node 24.18.0 (x64-linux)

round 1/10 · TS styled 5.2.0 new 865.59µs · JS styled 5.1.5 leg 1189.65µs
round 2/10 · TS styled 5.2.0 new 1015.33µs · JS styled 5.1.5 leg 1223.50µs
round 3/10 · TS styled 5.2.0 new 931.27µs · JS styled 5.1.5 leg 1049.87µs
round 4/10 · TS styled 5.2.0 new 1148.23µs · JS styled 5.1.5 leg 1111.31µs
round 5/10 · TS styled 5.2.0 new 939.40µs · JS styled 5.1.5 leg 1048.79µs
round 6/10 · TS styled 5.2.0 new 919.14µs · JS styled 5.1.5 leg 976.47µs
round 7/10 · TS styled 5.2.0 new 1080.88µs · JS styled 5.1.5 leg 1176.36µs
round 8/10 · TS styled 5.2.0 new 853.02µs · JS styled 5.1.5 leg 1056.21µs
round 9/10 · TS styled 5.2.0 new 923.05µs · JS styled 5.1.5 leg 1165.20µs
round 10/10 · TS styled 5.2.0 new 962.78µs · JS styled 5.1.5 leg 1077.07µs

# median of 10 rounds

| case                                 |       avg |     p75 |         alloc/iter | gc/iter | vs fastest |
| ------------------------------------ | --------: | ------: | -----------------: | ------: | :--------- |
| styled-system :: TS styled 5.2.0 new | 935.34 µs | 1.66 ms |  186.56 KB (least) | 4.73 ms | fastest    |
| styled-system :: JS styled 5.1.5 leg |   1.09 ms | 1.78 ms | 253.58 KB (+35.9%) | 4.72 ms | +17.0%     |
