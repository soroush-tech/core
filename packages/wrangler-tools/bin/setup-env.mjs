#!/usr/bin/env node
import { setupEnv } from '../src/setup-env.ts'

setupEnv(process.cwd(), process.env)
