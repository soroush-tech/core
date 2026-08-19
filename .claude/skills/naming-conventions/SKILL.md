---
description: JavaScript and TypeScript naming conventions - variables, booleans, functions, classes, React components, constants, privates. Auto-load when naming or reviewing identifiers in .ts/.tsx files.
paths: '**/*.ts,**/*.tsx,**/*.js,**/*.jsx'
---

# Naming Conventions

## Variables - camelCase

```ts
// ✗
var first_name = 'Robin'
var FIRSTNAME = 'Robin'
var val = 'Robin'

// ✓
var firstName = 'Robin'
```

## Booleans - is / are / has prefix

```ts
// ✗
var visible = true
var equal = false
var encryption = true

// ✓
var isVisible = true
var areEqual = false
var hasEncryption = true
```

## Functions & Methods - camelCase + verb prefix

```ts
// ✗
function name(firstName, lastName) { ... }

// ✓
function getName(firstName, lastName) { ... }
```

Common verbs: `get`, `set`, `fetch`, `create`, `update`, `delete`, `calculate`, `handle`, `is`, `has`.

Function names describe **what the function does**, not what it blocks or how it works internally.

```ts
// ✗ - describes what it blocks, not what it does
const blockSize = (prop: string) => prop !== 'size'

// ✗ - describes the implementation detail
const isNotSize = (prop: string) => prop !== 'size'

// ✓ - describes the function's purpose in its context
const shouldForwardInputProps = (prop: string) => prop !== 'size'
```

## Classes - PascalCase

```ts
// ✗
class softwareDeveloper { ... }

// ✓
class SoftwareDeveloper { ... }
```

## React Components - PascalCase

```tsx
// ✗
function userProfile(user) {
  return <div>...</div>
}

// ✓
function UserProfile(user) {
  return <div>...</div>
}
```

Use descriptive, meaningful names. Don't append a redundant `Component` suffix - the JSX usage already makes it a component.

```tsx
// ✗ - camelCase start
function markdownComponent(props) { ... }

// ✗ - redundant "Component" suffix
function MarkdownComponent(props) { ... }

// ✓ - PascalCase, concise
function Markdown(props) { ... }
```

## Constants - UPPER_SNAKE_CASE

```ts
// ✗
const secondsInDay = 86400

// ✓
const SECONDS_IN_DAY = 86400
```

Use `UPPER_SNAKE_CASE` for truly fixed, non-reassignable values. Mutable module-level variables stay camelCase.

## Private - \_ prefix

```ts
// ✓ - signals internal use only
class Foo {
  _computeName(first, last) {
    return `${first} ${last}`
  }
}
```

Unused destructured params also use `_` prefix (`{ size: _size }`).

## Avoid

- `snake_case` for variables or functions
- `kebab-case` in identifiers (`first-name` is a syntax error)
- Single-letter or cryptic names (`val`, `tmp`, `x`) outside loop counters
- Adding a comment to explain what a name means - rename instead

If the arguments name a file, read it and apply these rules. Otherwise apply to the code being discussed.
