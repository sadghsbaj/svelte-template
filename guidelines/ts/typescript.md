# TypeScript Guidelines & Strict Rules

## 1. Zero `any` Policy

### Core Rule
The `any` type is **strictly forbidden** under any circumstances across the entire codebase.

> [!CAUTION]
> Using `any` disables TypeScript's safety guarantees and propagates untyped values silently.

### Preferred Alternatives
- **Unknown Data / External Payloads**: Use `unknown`. Force explicit type checking, type guards, or validation before accessing properties.
- **Generic Fallbacks**: Use generics `<T = unknown>` or constrained generics `<T extends Record<string, unknown>>`.

```ts
// ❌ FORBIDDEN: Disables type safety
function processData(data: any) {
    console.log(data.name);
}

// ✅ REQUIRED: Use unknown and type guards
function processData(data: unknown) {
    if (typeof data === "object" && data !== null && "name" in data) {
        console.log((data as { name: string }).name);
    }
}
```

---

## 2. Prohibition of Non-Null Assertions (`!`)

### Core Rule
The non-null assertion operator (`value!`) is **forbidden**. Never force TypeScript to assume a value is non-null.

> [!WARNING]
> Using `value!` risks runtime `TypeError: Cannot read properties of undefined` crashes if assumptions fail.

### Safe Alternatives
1. **Optional Chaining (`?.`)**: Safely navigate optional properties.
2. **Nullish Coalescing (`??`)**: Provide a safe fallback value.
3. **Explicit Type Guards / Early Return**: Handle `null` or `undefined` states explicitly.

```ts
// ❌ FORBIDDEN: Non-null assertion
const name = user!.name;

// ✅ REQUIRED: Optional chaining with nullish fallback
const name = user?.name ?? "Guest";

// ✅ REQUIRED: Explicit type guard early return
if (!user) return;
const name = user.name;
```
