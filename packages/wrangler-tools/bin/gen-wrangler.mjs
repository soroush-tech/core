#!/usr/bin/env node
import { generate } from '../src/gen-wrangler.ts'

// pnpm runs package scripts with cwd = the package dir, so the caller's worker
// directory is the config root; argv lists that worker's required ID vars.
generate(process.cwd(), process.argv.slice(2), process.env)
