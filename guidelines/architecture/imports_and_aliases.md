# Imports, Path Aliases & Boundary Rules

## Core Rule

All internal cross-directory imports MUST use official path aliases (`$core`, `$utils`, etc.). Relative parent imports (`../`) are strictly forbidden.

> [!IMPORTANT]
> Relative parent imports via `../` trigger an ESLint error (`no-restricted-imports`).

---

## 1. Path Aliases Reference Table

| Path Alias         | Resolves To                  | Usage                                   |
| :----------------- | :--------------------------- | :-------------------------------------- |
| **`$core`**        | `src/lib/core`               | Core framework architecture & systems   |
| **`$components`**  | `src/lib/shared/components`  | Shared reusable UI components           |
| **`$utils`**       | `src/lib/shared/utils`       | Shared utility functions & helpers      |
| **`$styles`**      | `src/lib/shared/styles`      | Global CSS styles & design tokens       |
| **`$transitions`** | `src/lib/shared/transitions` | Shared animation & transition functions |
| **`$types`**       | `src/lib/shared/types`       | Shared TypeScript interfaces & types    |
| **`$attachments`** | `src/lib/shared/attachments` | Shared Svelte 5 element attachments     |
| **`$views`**       | `src/lib/views`              | Top-level view modules                  |
| **`$features`**    | `src/lib/features`           | Feature-bound application modules       |

---

## 2. Layer Architectural Boundaries

To prevent tight coupling and circular dependencies:

1. **`$core` Dependency Isolation**: `$core` modules **MUST NOT** import anything from `$features` or `$views`.
2. **Circular Reference Prevention**: Be vigilant against circular dependencies between `$views` and `$features`.
3. **`$shared` Layer**: All shared assets (`$components`, `$utils`, `$types`, etc.) sit below features and core, ensuring safe imports from anywhere.

---

## 3. Type Co-location vs. Extraction

- **Small Types**: Co-locate types directly inside the `.ts` or `.svelte` file where they are consumed.
- **Complex / Shared Types**: If types are used across multiple files or modules, extract them into a co-located `types.ts` file or `$types/`.
