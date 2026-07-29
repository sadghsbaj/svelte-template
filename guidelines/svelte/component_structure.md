# Component Structure & Co-location Guidelines

## 1. Small to Medium Components (< 100 Lines Script)

For standard components, use the **Categorical Pipeline Order**. This top-down data flow ensures every component reads identically across the team:

```svelte
<script lang="ts">
    // 1. IMPORTS (Third-party -> Core/Shared -> Relative)
    import { onMount } from "svelte";
    import { viewStateContext } from "./view.context";

    // 2. TYPES & INTERFACES (Props & Component types)
    interface Props {
        title: string;
        active?: boolean;
    }

    // 3. PROPS & CONTEXT INPUTS ($props, createContext/getContext)
    let { title, active = false }: Props = $props();
    const viewState = viewStateContext.get();

    // 4. CONSTANTS & LOCALS
    const COMPONENT_ID = "card-component";

    // 5. REACTIVE STATE ($state, $state.raw)
    let count = $state(0);

    // 6. DERIVED STATE ($derived, $derived.by)
    const doubleCount = $derived(count * 2);

    // 7. EFFECTS & LIFECYCLE ($effect, onMount)
    $effect(() => {
        // Sync or side-effects
    });

    // 8. EVENT HANDLERS & FUNCTIONS
    function handleClick() {
        count++;
    }
</script>

<!-- 9. TEMPLATE / MARKUP -->
<button onclick={handleClick}>{title} ({doubleCount})</button>
```

---

## 2. Large & Complex Components (Feature-Block Co-location)

When a component contains multiple distinct sub-features (e.g. *Search*, *Pagination*, *Selection*), do **not** force strict global categorization if it impairs readability.

Instead, group the script into **Co-located Feature Blocks** where state, derived values, and handlers for each sub-feature stay together:

```svelte
<script lang="ts">
    // Global Inputs
    import { viewStateContext } from "./view.context";
    let { items }: Props = $props();

    // FEATURE 1: SEARCH & FILTER (Co-located)
    let searchQuery = $state("");
    const filteredItems = $derived(items.filter(i => i.includes(searchQuery)));
    function resetSearch() { searchQuery = ""; }

    // FEATURE 2: PAGINATION (Co-located)
    let currentPage = $state(1);
    const totalPages = $derived(Math.ceil(filteredItems.length / 10));
    function nextPage() { currentPage++; }
</script>
```

---

## 3. Large State Extraction (`.svelte.ts`)

When a feature block grows beyond component boundaries, extract the logic into a separate `.svelte.ts` class or state factory module.

```svelte
<script lang="ts">
    import { PaginationState } from "./pagination.svelte";

    const pagination = new PaginationState();
</script>
```
