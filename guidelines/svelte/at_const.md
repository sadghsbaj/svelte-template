# Svelte 5 Declaration Tags (`{const ...}`, `{let ...}`)

## Core Rule
The legacy `{@const ...}` tag is **deprecated and forbidden**. All inline template variable declarations MUST use Svelte 5 declaration tags (`{const ...}` or `{let ...}`).

> [!IMPORTANT]
> Usage of `{@const}` triggers an ESLint error (`SvelteConstTag`).

---

## Why Modern Declaration Tags?

1. **Flexible Scope**: Legacy `{@const}` could only be declared at the immediate top level of specific block tags (`{#if}`, `{#each}`, `{:then}`). Svelte 5 `{const}` and `{let}` tags can be placed anywhere in template markup.
2. **Reactivity & Runes**: `{const}` and `{let}` in Svelte 5 support reactive expressions and Runes seamlessly.
3. **`{let}` Support**: Allows declared template variables to be rebound or updated within template scopes.

---

## Comparison & Examples

### Legacy `{@const}` - ❌ Deprecated
```svelte
{#each items as item}
    {@const double = item.val * 2}
    <p>{double}</p>
{/each}
```

### Svelte 5 `{const}` and `{let}` - ✅ Required
```svelte
{#each items as item}
    {const double = item.val * 2}
    <p>{double}</p>
{/each}

<!-- Anywhere in markup -->
<div class="card">
    {const formattedTitle = title.trim().toUpperCase()}
    <h3>{formattedTitle}</h3>
</div>
```

---

## Documentation Link
Refer to the official [Svelte 5 Declaration Tags Documentation](https://svelte.dev/docs/svelte/declaration-tags).
