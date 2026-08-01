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

| Asset Type                   | Convention                     | Example                                        |
| :--------------------------- | :----------------------------- | :--------------------------------------------- |
| **Svelte Components**        | `PascalCase.svelte`            | `AppView.svelte`, `DemoView.svelte`            |
| **Svelte State Modules**     | `camelCase.svelte.ts`          | `viewState.svelte.ts`, `appShortcut.svelte.ts` |
| **Standard TS Modules**      | `kebab-case.ts`                | `view-scroll.ts`, `debug-guard.ts`             |
| **Context Definition Files** | `domain.context.ts`            | `layer.context.ts`, `view.context.ts`          |
| **Test Files**               | `*.test.ts` / `*.node.test.ts` | `theme.svelte.test.ts`, `http.node.test.ts`    |
| **Directories**              | `kebab-case/`                  | `app-views/`, `app-layer/`                     |
| **CSS Classes & Files**      | `kebab-case`                   | `.accent-icon`, `[data-layout="app-views"]`    |

---

## 3. Abbreviations Policy

- **Allowed**: Standard short loop indices in small scopes (e.g. `i` in `for (let i = 0; i < len; i++)`).
- **Forbidden**: Obscure single-letter or cryptic variable names (e.g. `x`, `y`, `z`, `c`, `q`, `o`, `e`) spread across domain logic. Keep variable and function names self-descriptive.
