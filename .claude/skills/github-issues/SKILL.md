---
description: Drafting, referencing, and creating GitHub issues in this repo - templates, issue-reference style, and the show-before-create rule. Use when drafting or filing any epic, task, RFC, bug, story, feature, or doc-feedback issue, or when referencing issues in issue/PR bodies.
---

# GitHub issues

## Use the issue templates

Any epic, task, RFC, bug report, user story, feature request, or doc-feedback
item - as an `issues/` file or a GitHub issue - must follow the matching template in
`.github/ISSUE_TEMPLATE/` (`4.epic.yml`, `6.task.yml`, `3.rfc.yml`,
`1.bug_report.yml`, `5.user_story.yml`, `2.feature_request.yml`,
`7.documentation_feedback.yml`). Read the template first; use its exact section
headings, order, and title prefix (`[Epic]`, `[Task]`, ...).

## Issue hierarchy - set parent up the chain

Each level's **parent** is the level above it:

```
RFC → Epic → Task
```

- An Epic's parent is its RFC.
- A Task's parent is its Epic.
- For rework discovered later, add a **subtask** whose parent is the Task it
  reworks.

## Reference issues bare - GitHub renders the title

GitHub auto-renders the title for a bare `#123`, so don't hand-write it.

✗ `- [ ] #136 - [RFC] Restructure Repository into a pnpm Workspace Monorepo`
✓ `- #136`

## Show before creating

Always show the drafted issue (or `issues/` file) to the user and wait for explicit
verification before creating it on GitHub or writing the file.

## Mandatory metadata on every created issue

When creating an issue on GitHub, all three are required - never omit:

- a **label**
- a **parent**
- a **milestone**
- **assignee** set to the repo owner (self)
