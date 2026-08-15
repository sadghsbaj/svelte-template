# cva.ts

A lightweight, zero-dependency style recipe and variant composition engine built natively on top of `cn`. Designed for full TypeScript type inference, structured base slots, multi-value options, boolean modifiers, and permutation matrix rules.

## API Reference

### Types

```typescript
interface PredefinedBaseSlots {
    layout?: ClassValue;
    typography?: ClassValue;
    frame?: ClassValue;
    interaction?: ClassValue;
    motion?: ClassValue;
    misc?: ClassValue;
}

type BaseValue = ClassValue | (PredefinedBaseSlots & Record<string, ClassValue>);

type OptionsConfig = Record<string, Record<string, ClassValue>>;
type ModifiersConfig = Record<string, ClassValue>;

type CompoundRecord<O, M> = {
    [K in keyof O]?: keyof O[K];
} & {
    [K in keyof M]?: boolean;
} & Record<string, unknown> & {
    class?: ClassValue;
    className?: ClassValue;
};

interface CvaConfig<O, M, C> {
    base?: BaseValue;
    options?: O;
    modifiers?: M;
    compounds?: C;
    defaults?: Record<string, unknown>;
}

type VariantProps<T> = ...;
```

### Functions

#### `cva`

Creates a type-safe class name recipe function.

```typescript
function cva<O, M, C>(
    config: CvaConfig<O, M, C>
): (props?: VariantProps<CvaConfig<O, M, C>>) => string;
```

---

## Important Technical Details

- **Structured Base Slots:** The `base` property accepts strings, arrays, or structured semantic objects (`layout`, `typography`, `frame`, `interaction`, `motion`, `misc`) with full IDE autocompletion.
- **Options (Multi-Value Dimensions):** Multi-value variants (e.g. `variant: { solid: "...", outline: "..." }`, `size: { sm: "...", md: "..." }`) are automatically inferred into the component's props interface.
- **Modifiers (Boolean Flags):** Keys declared in `modifiers` (e.g. `fullWidth: "w-full"`) are automatically inferred as `boolean` flags.
- **Compound Permutations:** Compound rules allow mapping multi-variant states (e.g. `variant: "solid"` + `color: "accent"`) without requiring dummy placeholder objects.
- **Ad-hoc Overrides:** The resulting recipe accepts `class` and `className` overrides that are merged safely through `cn()`.

---

## Example

```typescript
// button.styles.ts
import { cva, type VariantProps } from "$utils";

export const buttonStyles = cva({
    base: {
        layout: "inline-flex items-center justify-center gap-2",
        typography: "font-500 text-sm select-none",
        frame: "squircle-smooth rounded-lg",
        interaction: "cursor-pointer active:scale-98 disabled:(opacity-40 pointer-events-none)",
        motion: "t-all-150-quad-out",
    },
    options: {
        variant: {
            solid: "text-white shadow-sm",
            outline: "border bg-transparent",
            ghost: "bg-transparent hover:bg-elevation-2",
        },
        size: {
            sm: "h-8 px-2.5 text-xs gap-1.5",
            md: "h-9.5 px-4 text-sm gap-2",
            lg: "h-11 px-5 text-base gap-2.5",
        },
    },
    modifiers: {
        fullWidth: "w-full",
        pill: "rounded-full",
    },
    compounds: [
        {
            variant: "solid",
            color: "accent",
            class: "bg-accent-500 hover:bg-accent-600 active:bg-accent-700",
        },
        {
            variant: "outline",
            color: "accent",
            class: "border-accent-500/40 text-accent-500 hover:bg-accent-500/10",
        },
    ],
    defaults: {
        variant: "solid",
        color: "accent",
        size: "md",
        fullWidth: false,
    },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

// Usage:
// buttonStyles({ variant: "outline", size: "sm", fullWidth: true });
```
