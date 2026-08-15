An opinionated Svelte 5 template built with Vite, TypeScript, UnoCSS, and Vitest.

## Prerequisites

Bun is required. npm and pnpm are explicitly blocked in `package.json`.

## Install

```sh
bun install
```

## Development

Start the dev server:

```sh
bun run dev
```

Preview the production build locally:

```sh
bun run preview
```

## Build

Run type checks, generate production assets, and create comprehensive reports in `dist/analysis/` (`bundle_stats.md`, `bundle_stats.html`, `codebase_stats.md`):

```sh
bun run build
```

Run full CI/Release verification (Type check + Unit/Browser Tests + Production Build):

```sh
bun run ci
```

## Analysis & Statistics

Analyze codebase statistics (SLOC, prod vs. test lines) into `dist/analysis/codebase_stats.md`:

```sh
bun run stats:codebase # or bun run stats
```

Build and open the interactive bundle visualization report (`dist/analysis/bundle_stats.html`) in browser:

```sh
bun run stats:bundle
```

Run an automated Lighthouse audit (Performance, A11y, Best Practices, SEO) in headless Chrome and generate `dist/analysis/lighthouse_stats.md` & `dist/analysis/lighthouse_stats.html`:

```sh
bun run stats:lighthouse          # Mobile mode (default)
bun run stats:lighthouse --desktop # Desktop mode
```

## Type Check

Check TypeScript and Svelte component types:

```sh
bun run check
```

## Test

Run unit tests and headless Playwright browser tests once:

```sh
bun run test
```

Run tests in watch mode:

```sh
bun run test:unit
```

## Code Quality

Run ESLint:

```sh
bun run lint
```

Format code with Prettier:

```sh
bun run format
```

## Template Export

Export a cleaned version of this repository (removing `@template-remove` blocks and preview components) to `~/dotfiles/templates/svelte5-opinionated`:

```sh
bun run export
```

## Path Aliases

The following TypeScript import aliases map to `src/lib`:

- `$core` -> `src/lib/core`
- `$components` -> `src/lib/shared/components`
- `$views` -> `src/lib/views`
- `$modules` -> `src/lib/modules`
- `$features` -> `src/lib/features`
- `$styles` -> `src/lib/shared/styles`
- `$utils` -> `src/lib/shared/utils`
- `$transitions` -> `src/lib/shared/transitions`
- `$types` -> `src/lib/shared/types`
- `$attachments` -> `src/lib/shared/attachments`
- `$constants` -> `src/lib/shared/constants`
