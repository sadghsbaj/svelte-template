/**
 * @file cva.ts
 * @description Type-safe style recipe and variant composition engine.
 * Supports structured base slots, multi-value options, boolean modifiers, array-matched compounds, and undefined-safe defaults.
 */

import { cn, type ClassValue } from "./cn";

/**
 * Predefined semantic categories for structured base styling.
 */
export interface PredefinedBaseSlots {
    /** Layout and positioning styles (e.g. flex, grid, items-center, gap) */
    layout?: ClassValue;
    /** Typography styles (e.g. font-family, font-size, font-weight, tracking) */
    typography?: ClassValue;
    /** Frame, background, border, geometry, and shadow styles */
    frame?: ClassValue;
    /** Interactive and pseudo-state styles (e.g. cursor, hover, active, focus, disabled) */
    interaction?: ClassValue;
    /** Animation and transition styles (e.g. t-all-*, ease-*) */
    motion?: ClassValue;
    /** Miscellaneous context-specific utility styles */
    misc?: ClassValue;
}

export type BaseValue = ClassValue | (PredefinedBaseSlots & Record<string, ClassValue>);

export type OptionsConfig = Record<string, Record<string, ClassValue>>;
export type ModifiersConfig = Record<string, ClassValue>;
export type EmptySchema = Record<never, never>;

export type CompoundRecord<
    O extends OptionsConfig = OptionsConfig,
    M extends ModifiersConfig = ModifiersConfig,
> = (string extends keyof O
    ? Record<string, unknown>
    : { [K in keyof O]?: keyof O[K] | readonly (keyof O[K])[] }) &
    (string extends keyof M
        ? Record<string, unknown>
        : { [K in keyof M]?: boolean | readonly boolean[] }) &
    Record<string, unknown> & {
        class?: ClassValue;
        className?: ClassValue;
    };

type InferOptions<O> = O extends OptionsConfig
    ? string extends keyof O
        ? EmptySchema
        : { [K in keyof O]?: keyof O[K] }
    : EmptySchema;

type InferModifiers<M> = M extends ModifiersConfig
    ? string extends keyof M
        ? EmptySchema
        : { [K in keyof M]?: boolean }
    : EmptySchema;

type InferCompoundKeys<Item> = Item extends unknown
    ? Exclude<keyof Item, "class" | "className">
    : never;

type InferCompoundValue<Item, K extends PropertyKey> = Item extends unknown
    ? K extends keyof Item
        ? Item[K] extends readonly (infer U)[]
            ? U
            : Item[K]
        : never
    : never;

type KnownKeys<T> = string extends keyof T ? never : keyof T;

type InferCompoundsProps<
    C,
    O extends OptionsConfig = OptionsConfig,
    M extends ModifiersConfig = ModifiersConfig,
> = C extends readonly (infer Item)[]
    ? string extends keyof Item
        ? EmptySchema
        : {
              [K in Exclude<InferCompoundKeys<Item>, KnownKeys<O> | KnownKeys<M>>]?: InferCompoundValue<Item, K>;
          }
    : EmptySchema;

export interface CvaConfig<
    O extends OptionsConfig = OptionsConfig,
    M extends ModifiersConfig = ModifiersConfig,
    C extends readonly CompoundRecord<O, M>[] = readonly CompoundRecord<O, M>[],
> {
    /** Base classes applied unconditionally (accepts strings, arrays, or structured slots) */
    base?: BaseValue;
    /** Multi-value option dimensions (e.g. variant, size) */
    options?: O;
    /** Boolean toggle modifiers (e.g. fullWidth, pill, loading) */
    modifiers?: M;
    /** Permutation matrix rules mapping combination states to specific styles */
    compounds?: C;
    /** Default values applied when properties are omitted */
    defaults?: InferOptions<O> &
        InferModifiers<M> &
        Partial<InferCompoundsProps<C, O, M>> &
        Record<string, unknown>;
}

export type VariantProps<T> = T extends (props?: infer P) => unknown
    ? P
    : T extends CvaConfig<infer O, infer M, infer C>
      ? InferOptions<O> &
            InferModifiers<M> &
            InferCompoundsProps<C, O, M> & {
                class?: ClassValue;
                className?: ClassValue;
            }
      : Record<string, unknown>;

function isCompoundMatch(
    compound: Record<string, unknown>,
    mergedProps: Record<string, unknown>
): boolean {
    for (const key in compound) {
        if (key === "class" || key === "className") continue;
        if (!Object.hasOwn(compound, key)) continue;

        const expected = compound[key];
        const actual = mergedProps[key];

        const matches = Array.isArray(expected)
            ? (expected as unknown[]).includes(actual)
            : actual === expected;

        if (!matches) {
            return false;
        }
    }
    return true;
}

/**
 * Creates a type-safe class name recipe function.
 *
 * @param config - Style recipe configuration comprising base, options, modifiers, compounds, and defaults.
 * @returns A recipe function resolving input props to a space-separated class string.
 */
export function cva<
    O extends OptionsConfig = OptionsConfig,
    M extends ModifiersConfig = ModifiersConfig,
    const C extends readonly CompoundRecord<O, M>[] = readonly CompoundRecord<O, M>[],
>(config: CvaConfig<O, M, C>) {
    // Pre-resolve static base classes once to avoid per-render heap allocations
    const resolvedBase: ClassValue[] = [];
    if (config.base) {
        if (typeof config.base === "object" && !Array.isArray(config.base)) {
            const values = Object.values(config.base);
            if (values.length > 0 && typeof values[0] === "boolean") {
                resolvedBase.push(config.base);
            } else {
                resolvedBase.push(...(values as ClassValue[]));
            }
        } else {
            resolvedBase.push(config.base);
        }
    }

    return function recipe(props?: VariantProps<CvaConfig<O, M, C>>): string {
        const mergedProps: Record<string, unknown> = { ...config.defaults };
        if (props) {
            const passedProps = props as Record<string, unknown>;
            for (const key in passedProps) {
                if (Object.hasOwn(passedProps, key) && passedProps[key] !== undefined) {
                    mergedProps[key] = passedProps[key];
                }
            }
        }

        const classes: ClassValue[] = [...resolvedBase];

        // 2. Resolve option dimensions
        if (config.options) {
            for (const key in config.options) {
                if (!Object.hasOwn(config.options, key)) continue;
                const selected = mergedProps[key];
                if (
                    (typeof selected === "string" || typeof selected === "number") &&
                    Object.hasOwn(config.options[key], selected as string)
                ) {
                    classes.push(config.options[key][selected]);
                }
            }
        }

        // 3. Resolve boolean modifiers
        if (config.modifiers) {
            for (const key in config.modifiers) {
                if (!Object.hasOwn(config.modifiers, key)) continue;
                if (mergedProps[key] === true) {
                    classes.push(config.modifiers[key]);
                }
            }
        }

        // 4. Resolve compound matrix rules (supports single and array expected values)
        if (config.compounds) {
            for (const compound of config.compounds) {
                if (!isCompoundMatch(compound, mergedProps)) continue;
                if (compound.class) classes.push(compound.class);
                if (compound.className) classes.push(compound.className);
            }
        }

        // 5. Append consumer overrides and defaults
        if (mergedProps.class) classes.push(mergedProps.class as ClassValue);
        if (mergedProps.className) classes.push(mergedProps.className as ClassValue);

        return cn(...classes);
    };
}
