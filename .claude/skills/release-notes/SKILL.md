---
description: How to write and cut a GitHub Release for an @soroush.tech/* package published by cd-packages.yml — notes live in an in-repo file `packages/<pkg>/release-notes/<version>.md`, the semver bump rule, a PR/issue reference (required for feature/fix releases, waived for dependency-bump-only ones which instead list every bump), and the breaking-change, new-API-doc-link, and packaging side-note sections. Use when releasing a package or drafting its release notes.
paths: packages/**
---

# Package release notes

Publishing is **manual**, and notes live in a **versioned file committed to the package**:
`packages/<pkg>/release-notes/<version>.md`, where `<version>` matches `package.json`. The
workflow requires that file to exist before it publishes — a package can never ship with empty
notes. See [`cd-packages.md`](../../../.github/workflows/cd-packages.md) for the workflow. This
skill is about writing that file.

The file is plain multi-line markdown — **no `\n` escaping** (that was the old dispatch-input
flow; it's gone). Notes files never ship to npm: every package uses a `files: ["dist"]`
allowlist, so `release-notes/` is excluded from the tarball automatically.

Every file **starts with a `## <name>@<version>` heading** — it's the only title the file
carries (a GitHub Release shows the tag separately; the standalone file doesn't). The directory
is the package's full per-version history — one file per released version, browsable and linked
from the package README.

**Repo links** use `soroush-tech/core`: `blob/main/…` for a file, `tree/main/…` for a
directory. Never the old `soroush-tech/soroush.tech`.

## Before you write notes: bump the version (semver)

A release is bumping `version` in the package's `package.json` on `main` **and** adding the
matching `release-notes/<version>.md`, in the same PR. The publish step skips a version already
on npm, so the **version number is the release**. Follow [semver](https://semver.org) — the
bump decides which sections the notes need.

| Bump      | `x.y.z` → | Use for                                                                  |
| --------- | --------- | ------------------------------------------------------------------------ |
| **PATCH** | `x.y.Z+1` | Backward-compatible bug fixes; dependency/maintenance-only changes       |
| **MINOR** | `x.Y+1.0` | Backward-compatible **new features / new public API** (reset patch to 0) |
| **MAJOR** | `X+1.0.0` | **Any change that breaks backward compatibility** (reset minor+patch)    |

> Breaking a **dependency contract** (raising a peer-dependency floor consumers must meet,
> dropping a supported runtime) is a breaking change — bump **MAJOR**, even if your own code
> is untouched. A backward-compatible dep bump is PATCH.

## Required contents

Every release body **must** have:

1. **A PR or issue reference** — `#<number>` somewhere in the notes (lead line or a bullet).
   Ties a **feature or fix** release to its change history. Required for any release that
   changes behavior or API. **Exception:** a maintenance / dependency-bump-only release (a
   PATCH that only refreshes dependencies) may have no owning issue — the `#<number>` is
   **not required** there; instead **list exactly what was bumped** (see rule 4).
2. **Breaking changes**, if any — a `### BREAKING CHANGES` section spelling out what broke and
   the migration. Its presence means the bump must be MAJOR.
3. **New public API**, if any — name each new export **and link its doc**. API docs live under
   `packages/<name>/docs/*.md`. Link the repo-hosted file (a `blob/main` URL) so it resolves
   from the GitHub Release page, where relative links don't:
   `https://github.com/soroush-tech/core/blob/main/packages/<name>/docs/<file>.md#<anchor>`.
4. **A packaging side note** — a `### Packaging` section for packaging-level changes:
   dependency-floor raises, peer/optional-peer changes, engine/runtime requirements, repo moves.
   For a dependency-bump-only release this section **is** the release notes — **name every
   package bumped with its `old → new` version**, don't just say "dependency bumps". Omit the
   section only when there were genuinely no packaging changes.

## Template

`packages/<pkg>/release-notes/<version>.md`:

```markdown
## <name>@<version>

<one-line summary of what changed and why> (#<pr-or-issue>)

### Added

- **`newExport`** — one line on what it does.
  [docs](https://github.com/soroush-tech/core/blob/main/packages/<name>/docs/<file>.md#anchor)

### Changed

- <backward-compatible behavior change>.

### Fixed

- <bug fix> (#<pr-or-issue>).

### BREAKING CHANGES

- <what broke> — <how to migrate>.

### Packaging

- Raise `<dep>` floor `^a.b.c` → `^x.y.z`.
- `<peer>` is now an optional peer dependency.
```

Include only the sections that apply. Keep a `#<number>` reference for any feature/fix
release; keep the `### Packaging` note whenever packaging changed. Match the tone of the last
release: read the previous `release-notes/*.md`, or `gh release view "<name>@<latest>"`.

### Maintenance (dependency-bump-only) release

When a package ships only because its dependencies were refreshed — no code, no API change —
skip the `#<number>` and let `### Packaging` carry the notes, naming each bump explicitly:

```markdown
## <name>@<version>

Maintenance release — dependency refresh only. No public API or behavior changes.

### Packaging

- `@playwright/test` peer floor `^1` → `^1.61.1`.
- Dev-dependency bumps: `eslint` `^10.6.0` → `^10.7.0`, `vitest` `^4.1.9` → `^4.1.10`,
  `tsdown` `^0.22.3` → `^0.22.4`.
```

## Cutting the release

1. In **one PR to `main`** (CI must pass): bump `version` in `package.json` **and** add
   `packages/<dir>/release-notes/<version>.md` with the notes. The filename must equal the new
   version — `pnpm check:release-notes` (pre-commit hook + CI lint job) fails the commit/build
   if a publishable package's version has no matching notes file, and the workflow's Validate
   step fails again before publishing.
2. Dispatch — Actions → **Publish Packages (npm)** → pick `package`, **Run**. CLI:
   `gh workflow run cd-packages.yml -f package=<dir>`.
3. The job publishes to npm (skips if that version already exists) and cuts a GitHub Release
   tagged/titled `<name>@<version>` from the notes file. Re-running repairs a missing Release
   without republishing.

> This machine can't `git push` and has no `gh` CLI — commit the version bump + notes file
> locally, then ask the user to push and to run the dispatch.

## Backfilling notes for past releases

To seed `release-notes/` for versions already published, copy each GitHub Release body into its
`release-notes/<version>.md` (read them with the `mcp__github__list_releases` tool, or
`gh release view "<name>@<version>"`). Add the `## <name>@<version>` heading if the body lacks
one, and normalize any links to `soroush-tech/core`. The guard only checks each package's
current version, so backfilling is optional — but it makes the directory a complete history.
