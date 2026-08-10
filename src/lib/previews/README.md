# Component Previews & Showcase Guidelines

This directory contains the developer component preview ecosystem. It provides an opinionated, lightweight, pure-Svelte stage for testing, inspecting, and demonstrating UI components across variants, states, sizes, and layout contexts without external dependencies (like Storybook or MDX).

---

## 1. Automatic Discovery & Architecture

- **Location:** All component preview files must be created inside `src/lib/previews/components/` and named `[Name]Preview.svelte` (e.g. `ButtonPreview.svelte`, `SurfacePreview.svelte`).
- **Auto-Registration:** `ComponentsView.svelte` automatically discovers all `*Preview.svelte` modules via Vite's `import.meta.glob`.
- **Sidebar Icons (`<script module>`):** To display a custom icon in the sidebar next to the component name, export the icon component from a `<script module lang="ts">` block:

```svelte
<script module lang="ts">
    import { MousePointerClick } from "@lucide/svelte";

    // Required for automatic sidebar icon discovery
    export const icon = MousePointerClick;
</script>

<script lang="ts">
    // Component logic and imports
    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>
```

---

## 2. Core Preview UI Primitives

Always compose previews using the lightweight layout primitives from `$lib/previews/ui/`:

| Primitive            | Purpose                                                                                            | Key Props                                                                                                 |
| :------------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **`PreviewPage`**    | Root layout wrapper. Manages max-width, vertical scrolling, and container padding.                 | `class`                                                                                                   |
| **`PreviewHeader`**  | Top header block displaying title, description, and icon.                                          | `title`, `description`, `icon`, `children`                                                                |
| **`PreviewSection`** | Section container to group components logically (_Variants_, _Sizes_, _States_, _Playground_).     | `title`, `description`, `children`, `class`                                                               |
| **`PreviewCard`**    | Card stage for component items. Supports labels, elevation background contrast, and checkerboards. | `label`, `bg` (`"elevation-0"` \| `"1"` \| `"2"` \| `"transparent"`), `checkerboard` (`boolean`), `class` |
| **`PreviewGrid`**    | Responsive grid wrapper for `PreviewCard` elements.                                                | `cols` (`1` \| `2` \| `3` \| `4` \| `"auto"`), `class`                                                    |

---

## 3. General Rules & Principles

1. **English Only:** All titles, descriptions, section headers, badges, and card labels MUST be written in English.
2. **Minimal Text, Maximum Visuals:** Keep text descriptions concise (1 sentence max per section). Let the UI components and states speak for themselves.
3. **No Hardcoded Parent Imports:** Always use path aliases (e.g. `$lib/previews/ui/...`, `$components/...`) rather than relative parent paths (`../ui/...`).
4. **Flexible Card Composition:**
    - **Isolated States:** Use `<PreviewGrid>` + `<PreviewCard label="...">` when each item needs a distinct label (e.g., _Disabled_, _Loading_, _Active_).
    - **Grouped Comparison:** Put multiple interactive elements in a single `<PreviewCard>` with flex layout (`class="flex flex-wrap gap-4 items-center"`) when comparing size or variant hierarchies side-by-side.
5. **Transparency & Overlays:** For transparent, glassmorphic, fade, pattern, or container/surface elements, set `checkerboard={true}` or `bg="elevation-0"` on `<PreviewCard>` to guarantee clear background contrast.

---

## 4. Standard Component Template

```svelte
<script module lang="ts">
    import { Box } from "@lucide/svelte";

    export const icon = Box;
</script>

<script lang="ts">
    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Component Name"
        description="Concise one-line summary of component capability."
        icon={Box}
    />

    <!-- Section 1: Variants -->
    <PreviewSection title="Variants" description="Visual hierarchies and styles.">
        <PreviewGrid cols={3}>
            <PreviewCard label="Primary">
                <!-- Component instance -->
            </PreviewCard>
            <PreviewCard label="Secondary">
                <!-- Component instance -->
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Section 2: States -->
    <PreviewSection title="States" description="Interactive and disabled states.">
        <PreviewGrid cols={2}>
            <PreviewCard label="Disabled">
                <!-- Component instance -->
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
```
