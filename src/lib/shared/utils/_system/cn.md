# cn.ts

A lightweight, zero-dependency utility function to conditionally join CSS class names, arrays, and objects together. Serves as a performant alternative to `clsx` or `classnames`.

## API Reference

### Types

```typescript
type ClassValue = string | number | bigint | boolean | undefined | null | Record<string, unknown> | ClassValue[];
```

### Functions

#### `cn`

Joins various class values into a single space-separated string, ignoring falsy inputs.

```typescript
function cn(...classes: ClassValue[]): string;
```

---

## Important Technical Details

- **Supported Input Structures:**
    - **Strings/Numbers:** Added directly: `cn('foo', 'bar')` ➡️ `'foo bar'`.
    - **Arrays:** Recursively flattened: `cn(['foo', ['bar', 'baz']])` ➡️ `'foo bar baz'`.
    - **Objects:** Keys are appended if their values are truthy: `cn({ active: true, disabled: false })` ➡️ `'active'`.
    - **Falsy Values:** `null`, `undefined`, `false`, `0`, and empty strings are ignored.
- **Safety:** Uses `Object.hasOwn(value, key)` to safely iterate over object properties, preventing prototype pollution errors.
