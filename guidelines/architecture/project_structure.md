# Project Architecture & Directory Layout

## Overview of Directory Responsibilities

The codebase follows a modular, decoupled architecture to ensure application logic remains scalable, maintainable, and testable.

```text
src/lib/
├── core/                  # App-agnostic core architecture & systems
│   └── _system/           # Framework core modules (theming, motion, shortcut, stack, view, layer)
├── features/              # Feature-bound domain modules
├── views/                 # Full-page application views
└── shared/                # Shared application assets & utilities
    ├── attachments/       # Reusable Svelte 5 element attachments
    ├── components/        # Reusable UI components
    ├── styles/            # CSS tokens & design rules
    ├── transitions/       # Custom animation functions
    ├── types/             # Shared TypeScript type definitions
    └── utils/             # Helper utilities & node/browser scripts
```

---

## Directory Responsibilities

### 1. `src/lib/core/` (`$core`)

Contains application-agnostic, low-level architecture modules:

- Theme Manager (`theme.svelte.ts`)
- Motion Preference Manager (`motion.svelte.ts`)
- Keyboard Shortcut Manager (`appShortcut.svelte.ts`)
- Priority Stack Manager (`appStack.svelte.ts`)
- View State & Navigation Manager (`viewState.svelte.ts`)
- App Layer & Inert Manager (`layer.svelte.ts`)

### 2. `_system/` Directories

Directories named `_system/` contain core framework infrastructure built into the template. Application developers consuming the template should generally **not** modify `_system/` internal files unless extending framework capabilities.

### 3. `src/lib/shared/` (`$shared`)

Contains domain-agnostic UI building blocks (Buttons, Modals, Inputs), utility helpers, global types, and custom attachments used across the application.

### 4. `src/lib/views/` (`$views`)

Contains top-level page views (e.g. `HomeView.svelte`, `SettingsView.svelte`).

### 5. `src/lib/features/` (`$features`)

Contains domain-specific business features (e.g. `auth/`, `checkout/`, `dashboard/`).

---

## Co-location Rule

Keep feature-specific assets co-located within their feature folder:

- **Good**: `features/auth/components/LoginForm.svelte`, `features/auth/auth.context.ts`
- **Avoid**: Dumping feature-specific components or types into global `$components/` or `$types/`.
