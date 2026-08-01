# Svelte 5 Context Management Guidelines

## Core Rule

Legacy `setContext` and `getContext` functions from `'svelte'` are **forbidden**. All component contexts MUST be created using the Svelte 5 `createContext` API.

> [!IMPORTANT]
> Importing `setContext` or `getContext` directly from `'svelte'` is strictly blocked by ESLint (`no-restricted-imports`).

---

## Centralized Context Definition (`x.context.ts`)

Context instances MUST be declared centrally in a dedicated file named `x.context.ts` (where `x` represents the domain or component name, e.g. `layer.context.ts`, `view.context.ts`).

### Why Centralized Contexts?

1. **Type Safety**: Eliminates untyped string keys (`"VIEW_STATE"`) and unsafe generic casting (`getContext<MyType>`).
2. **No Collisions**: Uses explicit Symbols internally to prevent key collisions across components.
3. **Decoupling**: Allows parent providers and child consumers to import the exact getter/setter functions from a single module.

---

## Pattern & Implementation Example

### 1. Declare in `x.context.ts`

```ts
import { createContext } from "svelte";

export interface UserContext {
    name: string;
    updateName: (newName: string) => void;
}

export const [getUserContext, setUserContext] = createContext<UserContext>();
```

### 2. Provide in Parent Component (`Parent.svelte`)

```svelte
<script lang="ts">
    import { setUserContext } from "./user.context";

    setUserContext({
        name: "Alice",
        updateName: (newName) => {
            /* ... */
        },
    });
</script>
```

### 3. Consume in Child Component (`Child.svelte`)

```svelte
<script lang="ts">
    import { getUserContext } from "./user.context";

    const user = getUserContext();
    if (!user) {
        throw new Error("Child must be rendered within a Parent context provider.");
    }
</script>
```

---

## Documentation Link

For further information, refer to the official [Svelte 5 Context Documentation](https://svelte.dev/docs/svelte/context).
