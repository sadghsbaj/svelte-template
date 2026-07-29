# Svelte 5 Runes Guidelines (`$state`, `$derived`, `$effect`)

## 1. `$state` & `$state.raw`

### Core Rule
Only use the `$state` rune for variables that cause an `$effect`, `$derived`, or template expression to update. Everything else should be a normal JavaScript variable.

### Deep Reactivity vs. `$state.raw`
- `$state({...})` and `$state([...])` create **deeply reactive proxies**. Mutations to nested properties trigger updates.
- **Trade-off**: Proxies carry performance overhead. For large objects or arrays that are only ever reassigned (rather than mutated internally) — such as **API responses** or large datasets — use **`$state.raw`**.

```ts
// ❌ Unnecessary proxy overhead for static API payloads
let userData = $state(apiResponse);

// ✅ Performance-optimized raw state
let userData = $state.raw(apiResponse);
```

---

## 2. `$derived` & `$derived.by`

### Core Rule
To compute values from reactive state, always use `$derived` or `$derived.by`. **Never use `$effect` to compute derived values.**

```ts
// ❌ WRONG: Do NOT use $effect to derive state
let square;
$effect(() => {
    square = num * num;
});

// ✅ CORRECT: Use $derived for expressions
let square = $derived(num * num);

// ✅ CORRECT: Use $derived.by for complex multi-line logic
const summary = $derived.by(() => {
    if (items.length === 0) return "Empty";
    return items.map(i => i.name).join(", ");
});
```

### Key Properties of `$derived`
- **Writable**: Deriveds are writable — you can assign to them, just like `$state`, except they will re-evaluate whenever their underlying expression changes.
- **As-Is Return**: Objects or arrays returned by `$derived` are returned as-is and are NOT made deeply reactive.

---

## 3. `$effect` & Best Practices

### Core Rule
Effects are an **escape hatch** and should mostly be avoided. In particular, **never update state inside an effect** (this causes cascading re-renders and loop instabilities).

### Proper Alternatives to `$effect`
- **Syncing state to external DOM libraries (D3, Chart.js, Leaflet)** ➔ Use `{@attach ...}` element attachments.
- **Running code in response to user actions** ➔ Put the code directly inside event handlers (`onclick`, `onkeydown`).
- **Logging values for debugging** ➔ Use `$inspect(value)` instead of `$effect(() => console.log(value))`.
- **Observing external event sources** ➔ Use `createSubscriber(...)`.

> [!CAUTION]
> **Never** wrap the contents of an effect in `if (browser) { ... }` or `if (typeof window !== 'undefined')`. Svelte 5 `$effect` **never runs on the server**.
