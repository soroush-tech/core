# oxfmt-quick

## What it does

Formatting a whole repository every time is wasteful, and a `--check` gate that only tells
you off is worse. `oxfmt-quick` runs [oxfmt](https://oxc.rs/docs/guide/usage/formatter) over
the files you actually touched, and in a pre-commit hook it re-stages what it formatted - so
unformatted code cannot reach a commit in the first place.

It is to oxfmt what [`pretty-quick`](https://github.com/prettier/pretty-quick) is to
Prettier, and it keeps that tool's defaults so the two behave alike.

## Install

```sh
npm i -D oxfmt oxfmt-quick
```

`oxfmt` is a peer dependency, so you choose the version.

## Use it in a pre-commit hook

```sh
# .husky/pre-commit
npx oxfmt-quick --staged
```

A non-zero exit aborts the commit.

## Two modes

**Default** - everything changed since the merge-base with your branch, plus untracked
files. This is the one you want at the terminal, to tidy what you have been working on.

**`--staged`** - the index only, re-staging what it formats. This is the one you want in a
hook: anything unstaged is not going into the commit, so formatting it would be work the
commit never uses.

## Flags

| Flag              | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `--staged`        | Pre-commit mode: index only, re-staged after formatting              |
| `--since <rev>`   | Compare against a revision instead of the merge-base                 |
| `--branch <name>` | Branch to find the merge-base against (default `main`)               |
| `--check`         | Report without writing, and exit non-zero if anything is unformatted |
| `--bail`          | Exit non-zero if any file needed formatting                          |
| `--no-restage`    | Format without re-staging                                            |
| `--config <path>` | Pass an oxfmt config file through                                    |
| `--verbose`       | Print every file considered                                          |

## FAQ

### Why not just run `oxfmt` on everything?

You can - oxfmt is fast enough that on most repositories you would not notice. The point of
`oxfmt-quick` is not raw speed, it is the **re-staging**: in a hook, formatting a file is
only half the job, because the version going into the commit is the one in the index. Run
plain `oxfmt` from a hook and you format the working tree while the commit keeps the
unformatted content.

### What happens to a file I staged and then edited again?

It gets formatted on disk, but deliberately **not** re-staged, and the run exits non-zero so
the commit aborts.

Re-staging it would run `git add` over the whole file, sweeping in the edits you chose not
to stage and quietly widening your commit. Doing less is the safer answer here, and the
message tells you to fix your staging. This is a real bug in at least one comparable tool
([biomejs/biome#3608](https://github.com/biomejs/biome/issues/3608)).

### Why did it not format my changed file?

Almost always because the file is not staged and you are running with `--staged`. That mode
looks only at the index by design. Run `oxfmt-quick` with no flags to cover changed files
too.

### Does it respect `.oxfmtrc` and `.gitignore`?

Yes, because it does not implement any of that itself. The file list goes straight to oxfmt,
which already resolves `.oxfmtrc`, `.gitignore`, `.prettierignore` and `.editorconfig`, and
skips anything it cannot format. There is no second implementation here to drift out of step
with it. Gitignored files can never appear anyway - `git diff` reports only tracked files.

### Why does my scanner say it has "shell access"?

Because it imports `node:child_process`, which it needs in order to run `git` and `oxfmt`.
No shell is ever involved: commands are spawned with an argument array and never with
`shell: true`, which is precisely what stops paths containing spaces or glob characters
being reinterpreted. There is no `eval`, no network access, and nothing read from the
environment.

### Does it support Mercurial?

No - git only. `pretty-quick` supports both; this does not.

### Is it safe on Windows?

Yes, and it is tested there on every commit alongside Linux and macOS. Two Windows-specific
problems are handled deliberately: oxfmt is invoked through its own `bin` script with the
current `node`, rather than via the `PATH` entry, which on Windows is a `.CMD` shim that
cannot be spawned without a shell; and file lists are read with `git diff -z` and split on
NUL, so paths with spaces or non-ASCII characters survive intact.

## Links

- [Source on GitHub](https://github.com/soroush-tech/oxfmt-quick)
- [Package on npm](https://www.npmjs.com/package/oxfmt-quick)
- [Full README and release notes](https://github.com/soroush-tech/oxfmt-quick#readme)
