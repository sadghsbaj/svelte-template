# object.ts

A collection of type-safe, optimized object manipulation utility functions, including deep cloning, deep merging, and deep equality checks.

## API Reference

### Functions

#### `isPlainObject`

Type guard to check if a value is a plain JavaScript object (created via `{}` or `new Object()`).

```typescript
function isPlainObject(val: unknown): val is Record<string, unknown>;
```

#### `pick`

Creates a new object containing only the specified keys from the source object.

```typescript
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
```

#### `omit`

Creates a new object excluding the specified keys from the source object.

```typescript
function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
```

#### `deepMerge`

Deeply merges two objects. Arrays are cloned, nested plain objects are merged recursively. Does not mutate inputs.

```typescript
function deepMerge<T extends Record<string, unknown>, S extends Record<string, unknown>>(target: T, source: S): T & S;
```

#### `isEqual`

Performs a deep equality comparison between two values. Supports primitives, objects, arrays, Dates, and RegExps.

```typescript
function isEqual(a: unknown, b: unknown): boolean;
```

#### `deepClone`

Creates a deep clone of a value. Leverages native `structuredClone` when available, with a fallback that handles custom classes, Dates, RegExps, Maps, and Sets.

```typescript
function deepClone<T>(val: T): T;
```

---

## Important Technical Details

- **Structured Clone Optimization:** `deepClone` automatically uses the browser/runtime native `structuredClone` for maximum speed. However, it filters out custom class instances (`isCustomClassInstance`) and falls back to a custom cloner to avoid discarding prototypes and constructor linkages.
- **Reference Preservation:** None of the functions mutate target or source objects, returning fresh objects or arrays.
- **Strict Checks:** Iteration logic is guarded by `Object.prototype.hasOwnProperty.call` or `Object.hasOwn` checks to prevent prototype pollution vulnerability.
