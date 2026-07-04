# CommandSnippet

A terminal-style snippet of a single shell command with a copy-to-clipboard button.

## Props

| Prop      | Type        | Description                                                               |
| --------- | ----------- | ------------------------------------------------------------------------- |
| `command` | `string`    | The command shown after a `$` prompt and copied on click.                 |
| …`rest`   | `ViewProps` | Layout/spacing props (`maxWidth`, `mb`, …) pass through to the container. |

## Behaviour

- Clicking the button writes `command` to the clipboard via `navigator.clipboard.writeText`.
- The copy icon swaps to a checkmark and the button label to "Copied" for `COPIED_RESET_MS`
  (see `const.ts`), then reverts.
- The clipboard call runs only in the click handler, so the component is SSR-safe.
