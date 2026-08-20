# ai-watermark-guard

## What it does

AI-written text arrives with punctuation people rarely type: em dashes, curly quotes, an
ellipsis character. Pasted text brings worse - zero-width spaces, a stray byte order mark,
mojibake left by something that read UTF-8 as Latin-1. None of it is visible in a diff, and all
of it outlives the edit that introduced it.

`ai-watermark-guard` finds those characters in every tracked file, and in commit messages, and
either reports them or writes the plain equivalent. It is written in Rust and ships as a single
prebuilt binary: no toolchain, no compile step, no install script.

## What this is not

There is no hidden watermark in machine-written text, and nothing here defeats a detector. What
this finds are ordinary characters that a model reaches for and a person usually does not,
alongside invisible characters and mojibake that nobody meant to commit. It is a text-hygiene
guard. Judge it as one.

## Install

```sh
npx ai-watermark-guard --all          # one-off
npm i -D ai-watermark-guard           # pinned, for hooks and CI
cargo install ai-watermark-guard      # if you would rather build it
```

Prebuilt binaries ship as optional dependencies, one per platform, selected by `os`, `cpu` and
`libc`. Your machine fetches one package of a couple of megabytes and runs it - nothing compiles,
and no install script runs, so it survives an install with `--ignore-scripts`.

## Fast enough to run on every commit

A guard that runs on every commit has to be quicker than the pause it adds. Over this [soroush.tech/core](https://github.com/soroush-tech/cor) site's
own repository - 1,605 tracked text files, a full sweep takes about
**100ms**, where the Vanilla Node.js script it replaced took 230ms.

Most of what remains is git and file I/O rather than scanning, which is the honest reason to
write it in Rust: not that the character matching is hard, but that a binary starts instantly.
A hook that costs a tenth of a second is one nobody turns off, and `--staged` looks only at
the files in the commit, so the usual run is quicker still.

## What it looks for

Three tiers, all on by default. `--rules` narrows them.

| tier          | characters                                                                |
| ------------- | ------------------------------------------------------------------------- |
| `invisible`   | zero-width space, word joiner, byte order mark, soft hyphen, `U+FFFD`     |
| `punctuation` | en dash, em dash, minus sign, curly quotes, ellipsis, non-breaking spaces |
| `mojibake`    | UTF-8 that was decoded as Latin-1 somewhere upstream                      |

`invisible` and `mojibake` are wrong anywhere. `punctuation` is a house rule, so turn it off if
your prose wants typographic quotes:

```sh
aiwg --all --rules invisible,mojibake
```

## What it never touches

`U+200C`, `U+200D`, `U+200E` and `U+200F` are invisible too, and this tool leaves them alone
whatever the rules say. Persian needs the first between the parts of a word, an emoji sequence
needs the second to hold itself together, and the last two set the direction of mixed
right-to-left text. Removing them corrupts text rather than cleaning it.

Letters are never touched, in any script. This is not an ASCII-only rule.

## Use it in your hooks

```sh
# .husky/pre-commit
npx aiwg --staged --fix

# .husky/commit-msg
npx aiwg --message "$1" --fix
```

Prose is fixed and re-staged. Code is reported and the commit stops - a curly apostrophe inside a
single-quoted string becomes a straight quote that ends the string, and the file no longer parses,
so fixing code needs a parser rather than a replacement.

A commit message is fixed in place before the commit object exists. That is the only moment it
costs nothing: amending afterwards changes every sha from there on and voids the signatures over
them.

## Choosing what to scan

| invocation      | what it looks at                                      |
| --------------- | ----------------------------------------------------- |
| `aiwg`          | files that differ from the merge-base with `--branch` |
| `aiwg --all`    | every tracked text file                               |
| `aiwg --staged` | what is staged, for a pre-commit hook                 |
| `aiwg ./docs`   | a path, with or without a repository                  |

Binary files are skipped by the same NUL-byte test git uses. Files that are not valid UTF-8 are
reported and skipped rather than scanned through a lossy decode, which would blame the decoder
instead of the file.

Exit codes: `0` clean, `1` findings, `2` the run itself failed.
