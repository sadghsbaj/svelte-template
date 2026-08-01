# Svelte 5 Component Styling & Scoping Guidelines

## Core Rule

Style components using standard scoped `<style>` blocks and Vanilla CSS. Rely on clean CSS custom properties and native Svelte class/style bindings.

---

## 1. Class & Style Bindings

Svelte provides flexible ways to bind dynamic classes and inline styles:

```svelte
<script lang="ts">
    let isActive = $state(false);
    let themeColor = $state("var(--accent)");
</script>

<!-- Class directives & ternaries -->
<div class="card" class:active={isActive}>
    <button class={isActive ? "btn-primary" : "btn-secondary"}> Toggle </button>
</div>

<!-- Inline style directives -->
<div style:color={themeColor} style:z-index={10}>Styled Content</div>
```

---

## 2. Component Boundary Styling (`:global` & CSS Variables)

Svelte automatically scopes CSS to elements rendered directly in the component's HTML template.

### Styling Child Components or External Elements

When passing classes to child components (e.g. `<Icon class="accent-icon" />`) or styling elements rendered outside the local template scope:

1. **`:global(.class-name)`**: Wrap the selector in `:global(...)` so Svelte's CSS compiler does not mark it as an unused selector.
2. **CSS Custom Properties**: Prefer passing CSS variables (`--accent`, `--padding`) for clean component styling boundaries.

```svelte
<!-- Child component receiving class -->
<Sliders size={18} class="accent-icon" />

<style>
    /* ✅ Scoped global selector for child components */
    :global(.accent-icon) {
        color: var(--accent);
    }
</style>
```
