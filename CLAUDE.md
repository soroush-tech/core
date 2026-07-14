# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavioral guidelines

### 1. Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### 2. Propose before implementing

**Always present a plan and wait for confirmation before writing code.**

Cover: which files change, what changes in each, why. Then wait for explicit approval.

Exception: self-evident one-liners (typo fix, missing import).

### 3. Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features, abstractions, or error handling beyond what was asked.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 4. Surgical changes

**Touch only what you must. Clean up only your own mess.**

- Don't refactor, reformat, or "improve" adjacent code.
- Remove imports/variables/functions that YOUR changes made unused.
- Match existing style.
- If you notice unrelated dead code, mention it — don't delete it.

### 5. Goal-driven execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals: "Fix the bug" → "Write a test that reproduces it, then make it pass."

- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

### 6. Test coverage after implementation

**After any implementation, run `pnpm test:coverage` and verify 100% on all touched files.**

## Critical conventions

- **Design-system imports:** UI primitives and styling come from the workspace package — `import { X } from '@soroush.tech/design-system/X'` (barrel `@soroush.tech/design-system` for `styled`, `css`, `Theme`, etc.). App-internal imports use the `src/` alias (`import { X } from 'src/hooks/useX'`), never relative `../../`.
- **SSR guard:** Never import browser-only APIs at module top level — guard with `typeof window !== 'undefined'` or move into effects.
- **Styled-system:** Use `Flex`, `View`, `Typography` from `@soroush.tech/design-system` over raw `div`/`p` for layout.
- **Hook co-location:** Shared data hooks → `src/hooks/useX.ts`. Component-specific hooks → `src/common|section|pages/ComponentName/hooks/useX.ts`. Flat files — `useX.ts` + co-located `useX.test.ts`; no per-hook subfolder, no `index.ts`.
- **Logic & data co-location:** In `common`/`section`/`pages` components, extract pure helpers to `ComponentName/utils.ts` — or a flat `ComponentName/utils/` folder with one file per helper (`utils/helperName.ts` + `utils/helperName.test.ts`) when there are several — constants to `const.ts`, and static data to `ComponentName/ComponentName.data.ts`, co-located with the component. Promote a helper, hook, or data set to `src/utils/` or `src/hooks/` only once it is generic (used by more than one component).
- **Test placement:** Three tiers, all co-located next to source. Unit → `*.test.ts(x)` (vitest). Integration → `*.spec.ts(x)` (vitest). E2E → `*.e2e.ts` (Playwright), next to its page; shared e2e infra (fixtures, coverage hooks) in `src/test/e2e/`.
- **Lint:** `pnpm lint` uses `--max-warnings 0` — any warning fails.
- **Packages:** Everything under `packages/` is a scoped `@soroush.tech/*` workspace package — read `packages/packages.md` first. Every package must have **100% test coverage**, and any publishable (non-`private`) package must declare a license and ship a `LICENSE` file.
- **Issue artifacts:** Any epic, task, RFC, bug report, user story, feature request, or documentation-feedback item you draft — whether as a `docs/` file or for GitHub — must follow the matching template in `.github/ISSUE_TEMPLATE/` (`4.epic.yml`, `6.task.yml`, `3.rfc.yml`, `1.bug_report.yml`, `5.user_story.yml`, `2.feature_request.yml`, `7.documentation_feedback.yml`). Use that template's exact section headings, order, and title prefix (e.g. `[Epic]`, `[Task]`). Read the template before drafting.

## Layer conventions

Read the relevant doc before working in that area:

| Layer             | Convention doc                            | What it covers                                                                                                              |
| ----------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Design system     | `packages/design-system/design-system.md` | Styled components, `system()`, `shouldForwardProp`, Storybook argTypes, token rules                                         |
| Common components | `src/common/common.md`                    | Folder structure, composition rules, custom CSS, testing with `renderWithTheme`                                             |
| Sections          | `src/section/section.md`                  | Page-specific composed sections: folder structure, co-located data/logic, testing                                           |
| Pages             | `src/pages/pages.md`                      | Vike `+` files, page shape, SSR safety, e2e-only testing                                                                    |
| Hooks             | `src/hooks/hooks.md`                      | Data-fetching pattern, `useCustomQuery`, query keys, MSW integration tests                                                  |
| Packages          | `packages/packages.md`                    | Workspace packages: structure, default-export, tsdown + `publishConfig` publishing, 100% coverage, licensing                |
| Worker API        | `workers/api/worker.md`                   | Hono routes, `services/` vs `utils/` split, cron `jobs/`, D1 month-table schema, env/bindings, `src/*` alias, 100% coverage |

## Quick checklist before pushing

1. `pnpm lint`
2. `pnpm test:coverage` — verify 100% on all touched files
3. `pnpm test:e2e` if UI-facing changes
4. `pnpm build`
