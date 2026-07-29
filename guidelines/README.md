# Project Architecture & Development Guidelines

This directory contains strict engineering guidelines for maintaining clean, scalable, type-safe, and performant code in this Svelte 5 / TypeScript codebase.

## 📚 Guideline Index

### 1. Svelte 5 Standards (`guidelines/svelte/`)
- **[Context Management](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/context.md)**: Using Svelte 5 `createContext` and central `x.context.ts` files.
- **[Attachments](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/attachment.md)**: Modern element attachment directives (`{@attach ...}`) and `Attachment` types.
- **[Actions Deprecation](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/actions.md)**: Internal deprecation policy for legacy `use:action` directives.
- **[Declaration Tags](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/at_const.md)**: Replacing `{@const}` with flexible Svelte 5 `{const}` and `{let}` declaration tags.
- **[DOM Queries Anti-Pattern](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/dom_queries.md)**: Banning `document.querySelector` inside components in favor of `bind:this` and attachments.
- **[Runes Best Practices](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/runes.md)**: Core usage rules for `$state`, `$state.raw`, `$derived`, `$derived.by`, `$effect`, and `$inspect`.
- **[Snippets & Render Tags](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/snippets.md)**: Reusable template chunks, object-parameter passing, `<script module>` exports, and property components (`<button.icon />`).
- **[Styling & Scoping](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/styling.md)**: Class bindings, inline styles, scoped `<style>` blocks, `:global()`, and CSS custom properties.
- **[Component Structure & Order](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/svelte/component_structure.md)**: Layout order inside `<script lang="ts">` and co-location strategies.

### 2. TypeScript Rules (`guidelines/ts/`)
- **[TypeScript Guidelines](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/ts/typescript.md)**: Zero `any` policy and non-null assertion `!` prohibition.

### 3. Architecture & Verification (`guidelines/architecture/`)
- **[Imports & Path Aliases](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/architecture/imports_and_aliases.md)**: Path alias enforcement (`$core`, `$utils`, etc.) and layer boundary rules.
- **[Project & Layer Structure](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/architecture/project_structure.md)**: Responsibilities of `$core`, `$shared`, `$views`, `$features`, and `_system/`.
- **[Naming Conventions](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/architecture/naming.md)**: Casing rules, boolean verb prefixes, and file/directory extension standards.
- **[Empirical Verification](file:///home/colin/Main/01_programming/01_projects/01_current_projects/svelte-template/guidelines/architecture/verification.md)**: Quality checks (`npm run test`, `npm run check`, `npx eslint .`).
