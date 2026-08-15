# Naming Conventions & File Standards

## 1. Identifiers & Code Conventions

All code, variable names, functions, types, comments, and file names MUST be written in **English**.

| Category                       | Casing Convention            | Example                               |
| :----------------------------- | :--------------------------- | :------------------------------------ |
| **Constants**                  | `UPPER_SNAKE_CASE`           | `MAX_RETRY_COUNT`, `DEFAULT_THEME`    |
| **Variables & Functions**      | `camelCase`                  | `activeCount`, `getUserData()`        |
| **Types, Interfaces, Classes** | `PascalCase`                 | `LayerContext`, `ThemeManager`        |
| **Booleans**                   | `camelCase` with verb prefix | `isActive`, `hasContext`, `canGoBack` |

---

## 2. File & Directory Naming Rules

### Architectural Formula: `[name].[role].[ext]`

All project files follow a predictable separation between **name** and **technical role / subdomain**:

- **Hyphens (`-`)**: Used for multi-word domain names (e.g. `text-input`, `scroll-lock`, `debug-guard`).
- **Dots (`.`)**: Separate the domain name from its technical role or architectural archetype.

### Standard Role Archetypes

| Asset Type                | Pattern                        | Example                                       |
| :------------------------ | :----------------------------- | :-------------------------------------------- |
| **Svelte Components**     | `PascalCase.svelte`            | `Button.svelte`, `TextInput.svelte`           |
| **Style Recipes / CVA**   | `kebab-case.styles.ts`         | `button.styles.ts`, `text-input.styles.ts`    |
| **Element Attachments**   | `kebab-case.attach.ts`         | `focus.attach.ts`, `scroll-lock.attach.ts`    |
| **Context Definitions**   | `kebab-case.context.ts`        | `layer.context.ts`, `dialog.context.ts`       |
| **Transitions & Motion**  | `kebab-case.transition.ts`     | `modal.transition.ts`, `drawer.transition.ts` |
| **Shared Complex Types**  | `kebab-case.types.ts`          | `table.types.ts`, `data-grid.types.ts`        |
| **Svelte State Modules**  | `camelCase.svelte.ts`          | `viewState.svelte.ts`, `theme.svelte.ts`      |
| **Test Files**            | `*.test.ts` / `*.node.test.ts` | `button.svelte.test.ts`, `http.node.test.ts`  |
| **Standard TS Utilities** | `kebab-case.ts`                | `debug-guard.ts`, `view-scroll.ts`            |
| **Directories**           | `kebab-case/`                  | `app-views/`, `text-input/`                   |
| **CSS Classes & Files**   | `kebab-case`                   | `.accent-icon`, `[data-layout="app-views"]`   |

> [!NOTE]
> **Domain-Specific Sub-Modules:**  
> In addition to the standard archetypes above, breaking down complex domain modules into focused, dot-separated sub-responsibilities is explicitly allowed and encouraged (e.g. `focus.geometry.ts` in `$core/_system/focus/`, or `matrix.math.ts`). The rule remains: the dot separates the primary domain from its specific sub-responsibility.

---

## 3. Abbreviations Policy

- **Allowed**: Standard short loop indices in small scopes (e.g. `i` in `for (let i = 0; i < len; i++)`).
- **Forbidden**: Obscure single-letter or cryptic variable names (e.g. `x`, `y`, `z`, `c`, `q`, `o`, `e`) spread across domain logic. Keep variable and function names self-descriptive.
