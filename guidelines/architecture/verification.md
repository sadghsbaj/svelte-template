# Quality Verification & Testing Guidelines

## Core Rule

Never claim a task is completed, a bug is fixed, or a feature is working until concrete, empirical verification commands have passed cleanly with zero errors.

---

## 🛑 Prohibition of Auto-Fix (`bun lint --fix` / `eslint --fix`)

> [!CAUTION]
> Running automated linter auto-fix commands (`bun lint --fix` or `npx eslint --fix`) is **strictly prohibited**.

### Why Auto-Fix Is Banned:

1. **Unpredictable AST Rewrites**: Automated fixers perform mechanical code transformations (such as naive `.at()` array conversions or expression reordering) without understanding TypeScript semantics or runtime context.
2. **Type Safety Regressions**: Automated fixes frequently break TypeScript types, introduce subtle `undefined` runtime bugs, or conflict with class member initialization logic.
3. **Manual Precision Required**: Every lint warning or error MUST be inspected, diagnosed, and resolved manually to guarantee 100% type safety, code readability, and runtime correctness.

---

## Required Verification Pipeline

Before completing any task, execute the following 3 verification steps:

### 1. Test Suite Verification (`npm run test` or `bun run test`)

Runs Vitest to verify unit tests across browser and server environments:

```bash
npm run test
```

- **Requirement**: 100% test pass rate with 0 failing assertions.

---

### 2. TypeScript & Svelte Compiler Check (`npm run check` or `bun check`)

Runs `svelte-check` and `tsc` to verify static type safety:

```bash
npm run check
```

- **Requirement**: `svelte-check found 0 errors and 0 warnings`.

---

### 3. ESLint Compliance (`npx eslint .` or `bun lint`)

Runs ESLint **without** the `--fix` flag to inspect code style and rule compliance:

```bash
npx eslint .
```

- **Requirement**: `0 errors, 0 warnings`.
