[← Workflows overview](./README.md)

# `ci-app.yml` - CI · Apps

Called by [`ci.yml`](./ci.md), and calls one workflow per app in turn.

```yaml
# ci:validates app__*
on: { workflow_call: ... }
```

## Why a layer rather than one app workflow

The apps do not share a shape. The site builds, covers three tiers in one V8 pass, and runs three
browser engines on three operating systems; the editor drives a real Electron under `xvfb` on one.
Beyond `checkout`/`pnpm`/`node`/`install` they have no steps in common, so merging them into a
single file would buy four shared lines and cost the thing the split exists for: attribution is per
**file**, so one file for both apps means editing the editor's CI re-runs the web build and the
whole browser matrix.

What this layer buys instead is that **adding a third app touches this file, not the entry
workflow**. `ci.yml` holds `prepare`, `lint` and `ci-ok` - the branch-protection contract - and it
now stops changing when the app list does. A new app is a new `ci-<name>.yml` with its own marker,
plus one caller job here.

It does not make the app list data-driven: `uses:` cannot take an expression, so each app is named
explicitly. The edit moves down a level rather than disappearing.

## Inputs

`node_version`, `manager`, `command`, `runner`, `playwright_version`, plus the two gates `web` and
`editor` - strings, because `workflow_call` inputs cross the boundary as strings and the jobs
compare them with `== 'true'`.

`secrets: inherit` is declared here as well as on the caller in `ci.yml`: inheritance is per hop,
so a middle layer that omits it silently starves the workflow below of `CODECOV_TOKEN`.

## Jobs

| Job      | Calls                             | Runs when       |
| -------- | --------------------------------- | --------------- |
| `web`    | [`ci-web.yml`](./ci-web.md)       | `inputs.web`    |
| `editor` | [`ci-editor.yml`](./ci-editor.md) | `inputs.editor` |

Editing `ci-editor.yml` still runs the editor alone - this job appears in the run, and `web` is
skipped inside it. Check names gain a level: `app / web / e2e (chromium)`.

Depth: `ci.yml` → `ci-app.yml` → `ci-web.yml` is three of the four nested workflow levels GitHub
allows. A fourth level below an app workflow would be the limit.
