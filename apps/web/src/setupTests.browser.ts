// Setup for the `unit-browser` project (real Chromium). Unlike `setupTests.ts`,
// it must stay browser-safe - no MSW node server. RTL auto-cleanup runs via the
// global afterEach (test.globals is inherited from the root config).
import '@testing-library/jest-dom/vitest'
