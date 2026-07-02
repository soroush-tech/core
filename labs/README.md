# labs

Scratch space for **in-repo experiments** that consume the `@soroush.tech/*`
packages directly from source — quick benchmarks, spikes, repros, and demos you
don't want to publish or wire into an app.

Unlike [`examples/`](../examples) (which is **excluded** from the workspace and
pins **published npm** versions), everything under `labs/` **is** a workspace
member: each subdirectory is its own private package that depends on the local
packages via `workspace:*`, so you edit a package and the lab sees the change
with no publish step.

## Add a lab

```
labs/
  my-lab/
    package.json      ← private, "type": "module", workspace deps
    *.ts              ← your script / bench / repro
```

```jsonc
// labs/my-lab/package.json
{
  "name": "@soroush.tech/lab-my-lab",
  "private": true,
  "type": "module",
  "dependencies": {
    "@soroush.tech/styled-system": "workspace:*",
  },
}
```

Then run `pnpm install` from the repo root to link it.

## Not committed

Lab subdirectories are **git-ignored** (see [`.gitignore`](./.gitignore)) — they're
local scratch, so nothing under `labs/*` is committed. Only this `README.md` and the
`.gitignore` are tracked. Experiment freely without polluting the repo.
