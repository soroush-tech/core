[← Workflows overview](./README.md)

# `cd-editor.yml` — Package and release the desktop editor

Builds the editor's installers on both platforms and assembles them into **one
draft GitHub Release** with a title and generated notes. Manual
`workflow_dispatch` only — a release is a decision, not a side effect of a
merge. The build job runs only when dispatched from `main`
(`if: github.ref == 'refs/heads/main'`), so it always builds a line CI has
already validated.

```yaml
on:
  workflow_dispatch:
concurrency:
  group: cd-editor
  cancel-in-progress: false # never abort an in-flight release build
```

---

## Job graph

```mermaid
flowchart TD
    trig["workflow_dispatch<br/>(approved through the cd-editor environment)"] --> win
    trig --> mac

    subgraph build ["build matrix — parallel"]
        win["windows-latest<br/>NSIS .exe (x64) + latest.yml"]
        mac["macos-latest<br/>universal .dmg + .zip + latest-mac.yml"]
    end

    win -->|"upload-artifact"| rel["release (ubuntu)<br/>one draft release · v&lt;version&gt;<br/>title + generated notes + all assets"]
    mac -->|"upload-artifact"| rel
    rel -->|"published by hand — the release act"| users["installed apps see it on next start<br/>(electron-updater, packaged builds only)"]
```

---

## Job: `build`

Matrix over `windows-latest` + `macos-latest`, genuinely parallel — the legs no
longer share a draft release, so there is nothing to serialize.
`environment: cd-editor` · `timeout-minutes: 30`.

Each leg: checkout → node via `.nvmrc` → `pnpm install --frozen-lockfile
--ignore-scripts` (no lifecycle script is needed: electron-builder downloads
its own Electron for packaging) → `pnpm --filter @soroush/editor dist`
(`electron-vite build && electron-builder --publish never`) → upload the
installers, blockmaps and `latest*.yml` manifests as an `editor-<OS>`
artifact (`if-no-files-found: error`; the unpacked app directories stay
behind). Packaging config lives in `apps/editor/electron-builder.yml`; the
bundles in `out/` carry every dependency, so no `node_modules` ship. The app
icon is generated from `apps/editor/build/icon.png` (the brand mark from
`apps/web/public/soroush.svg` on the favicon's dark background) —
electron-builder derives the `.icns` and `.ico` from it.

| Leg     | Artifacts                                      | Signing                                                                      |
| ------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Windows | NSIS `.exe` (x64) + `latest.yml` + blockmap    | Unsigned for now — SmartScreen warns until a signature or reputation arrives |
| macOS   | `.dmg` + `.zip` (universal) + `latest-mac.yml` | **Unsigned for now** — no Apple Developer account yet (see below)            |

The macOS zip is not optional: macOS auto-update only consumes zips — the dmg
is for people. While the macOS build is unsigned, Gatekeeper only opens it via
right-click → Open, and **macOS auto-update stays off** (Squirrel refuses
unsigned apps); the Windows leg auto-updates regardless. The `cd-editor`
environment currently holds no values — it exists as the approval gate.

## Job: `release`

`needs: build` · `ubuntu-latest` · `timeout-minutes: 10` ·
`permissions: contents: write`. Checkout with `fetch-tags: true` (the previous
`v*` tag anchors the notes range), download both artifacts
(`merge-multiple: true`), then one `gh release create`:

- **Tag** `v<version>` from `apps/editor/package.json` — the plain `v*`
  namespace is the editor's; packages tag as `@soroush.tech/name@x.y.z`.
- **Title** `Soroush Editor v<version>`.
- **Notes** via `--generate-notes`, spanning from the last published `v*` tag
  (`--notes-start-tag`; omitted on the first release). Edit the draft body
  before publishing if the auto-generated changelog needs shaping.
- **Assets**: both legs' installers, blockmaps and `latest*.yml`.

Re-run safe: an existing **draft** for the tag is deleted and recreated; a
**published** tag fails the job — that version has shipped, bump the version
instead.

### When the Apple Developer account exists

Restore signing in two places — nothing else moves:

1. `apps/editor/electron-builder.yml`: delete `mac.identity: null`, set
   `mac.notarize: true`.
2. `cd-editor.yml`: give the macOS build leg electron-builder's standard
   code-signing and notarization environment (the Developer ID certificate
   and an App Store Connect API key — see electron-builder's code-signing
   docs for the variable set), with the values stored in the `cd-editor`
   GitHub environment. Keep that env scoped to the macOS leg only — a
   signing certificate visible to the Windows leg would be pulled into a
   Windows signing attempt.

## Releasing

1. Bump `apps/editor/package.json` `version` on a branch, merge to `main`.
2. Dispatch this workflow; approve the `cd-editor` environment gate.
3. Both legs build in parallel; the `release` job assembles one draft release
   tagged `v<version>` with title, generated notes and all assets.
4. Review the draft on GitHub — edit the notes if needed — and publish it.
   **Publishing is the release act**: installed apps check the newest
   published release's `latest*.yml` on startup (`src/main/updater.ts`,
   packaged builds only) and update in the background.

---

See also: [ci-editor.md](./ci-editor.md) and the [overview README](./README.md).
