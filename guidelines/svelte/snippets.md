# Svelte 5 Snippets & Render Tags (`{#snippet}`, `{@render}`)

## Core Rule
Snippets define reusable or structurally isolated markup chunks instantiated with the `{@render ...}` tag or passed to components as props.

---

## When to Use Snippets

1. **Reusability (Case A)**: When a markup block is rendered multiple times within a template.
2. **Structural Clarity (Case B)**: Even if a markup section is rendered only once, extracting it into a snippet keeps component templates modular, readable, and maintainable.

---

## Declaration & Usage Patterns

```svelte
<!-- Snippet declaration with parameters -->
{#snippet cardHeader(title, subtitle)}
    <header class="card-header">
        <h3>{title}</h3>
        {#if subtitle}<p>{subtitle}</p>{/if}
    </header>
{/snippet}

<!-- Rendering the snippet -->
{@render cardHeader("Dashboard", "Overview & Analytics")}
```

---

## Top-Level & Module Snippets

- **Top-Level Snippets**: Snippets declared at the root level of a component template (outside elements or blocks) can be referenced inside `<script>`.
- **`<script module>` Exportable Snippets**: A snippet that does not reference local component state can be declared inside `<script module>` and exported for reuse across other components!

```svelte
<script module>
    import { snippet } from "svelte";

    export const globalBadge = snippet((label: string) => {
        // Shared exportable snippet markup
    });
</script>
```

---

## Parameter Passing Best Practice

Avoid passing a long list of individual positional parameters `(x, y, z, a, b, c)`. Pass a structured object instead:

```svelte
<!-- ❌ Avoid long positional argument lists -->
{#snippet buttonLegacy(label, icon, disabled, variant, onClick)}
    ...
{/snippet}

<!-- ✅ Recommended: Pass a structured object -->
{#snippet button(config)}
    <button disabled={config.disabled} onclick={config.onClick}>
        {#if config.icon}
            {@render config.icon()}
        {/if}
        <span>{config.label}</span>
    </button>
{/snippet}
```

---

## Property Components (`<button.icon />`)

In Svelte 5, property components on objects can be rendered directly using dot notation (e.g. `<button.icon />` or `<config.icon />`). This eliminates the need for legacy `{@const}` workarounds when invoking dynamic component properties inside snippets.
