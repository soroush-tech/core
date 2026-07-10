[← Workflows overview](./README.md)

# `label-area.yml` — Label Affected Area

Applies an `area: <name>` label to an issue based on the **Affected area** dropdown in
the [issue forms](../ISSUE_TEMPLATE/). Runs when an issue is **opened**.

The selected value is validated against an **allowlist** (`ALLOWED_AREAS`) before any
label is touched — the dropdown constrains the form, but a blank issue or a hand-edited
body could inject arbitrary text, so only known areas (`web` + each package) may ever
become labels. The allowlist's package entries are synced from `packages/` by
`pnpm gen:publish-options`, so a new package needs no change here.

```yaml
on:
  issues:
    types: [opened]
permissions: { issues: write }
concurrency:
  group: label-area-${{ github.event.issue.number }}
  cancel-in-progress: true
```

| Field       | Value                                           |
| ----------- | ----------------------------------------------- |
| Triggers    | `issues` `opened`                               |
| Permissions | `issues: write` (read the issue, manage labels) |
| Concurrency | one run per issue number                        |

---

## Job: `label`

`runs-on: ubuntu-latest` · `timeout-minutes: 5`. A single `actions/github-script` step:

| #   | Action                  | Detail                                                                                                                                                                                                                                                                                      |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Parse + guard           | Match `### Affected area` in the issue body; the first non-empty line beneath it is the value. Return early unless it's in `ALLOWED_AREAS` — this rejects `_No response_`, a missing field, and any hand-typed text.                                                                        |
| 2   | Ensure the label exists | `addLabels` rejects unknown labels, so `getLabel` → `createLabel` (color `#0052cc`, matching the existing `area:` labels) on first use.                                                                                                                                                     |
| 3   | Apply                   | `addLabels` with `area: <value>` (skipped if already present).                                                                                                                                                                                                                              |
| —   | On error                | The whole thing runs in a `try/catch`: any API failure posts a `⚠️ Automatic area-labeling failed: …` comment on the issue and calls `core.setFailed`, so a maintainer sees it and the run is marked failed. A benign guard-skip (invalid/blank area) is **not** an error and stays silent. |

The `area:` prefix matches the repo's existing label convention (`status:`, `type:`,
`support:`). Frontmatter labels from the templates (e.g. `status: needs triage`) are
untouched — only `area:` labels are managed here.

---

See also: [ci.md](./ci.md) and the [overview README](./README.md).
