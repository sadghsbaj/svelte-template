/**
 * @file Optimized and type-safe utilities for object manipulation in TypeScript applications.
 *
 * Provides functions for picking/omitting keys, deep merging, deep equality comparison,
 * deep cloning, and type guards. Contains no 'any' types and handles complex nested structures.
 */

/**
 * Type guard to check if a value is a plain object (created via {} or new Object()).
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
    if (val === null || typeof val !== "object") {
        return false;
    }
    const prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
}

/**
 * Creates a new object containing only the specified keys from the source object.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * Creates a new object excluding the specified keys from the source object.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result as Omit<T, K>;
}

/**
 * Deeply merges two objects. Arrays are cloned, nested objects are merged recursively.
 * Does not mutate the target or source objects.
 */
export function deepMerge<T extends Record<string, unknown>, S extends Record<string, unknown>>(
    target: T,
    source: S
): T & S {
    const result = { ...target } as Record<string, unknown>;

    for (const key in source) {
        if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

        const sourceValue = source[key];
        const targetValue = result[key];

        if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
            if (Array.isArray(sourceValue)) {
                result[key] = [...sourceValue];
            } else if (isPlainObject(sourceValue)) {
                result[key] = deepMerge({}, sourceValue);
            } else {
                result[key] = sourceValue;
            }
        }
    }

    return result as T & S;
}

/**
 * Performs a deep equality comparison between two values.
 * Supports primitives, objects, arrays, Dates, and RegExps.
 */
export function isEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (const [i, item] of a.entries()) {
            if (!isEqual(item, b[i])) return false;
        }
        return true;
    }

    if (isPlainObject(a) && isPlainObject(b)) {
        if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        const keysBSet = new Set(keysB);
        for (const key of keysA) {
            if (!keysBSet.has(key)) return false;
            if (!isEqual(a[key], b[key])) return false;
        }
        return true;
    }

    return false;
}

function isCustomClassInstance(val: unknown): boolean {
    if (val === null || typeof val !== "object") {
        return false;
    }
    const proto = Object.getPrototypeOf(val);
    if (proto === null || proto === Object.prototype) {
        return false;
    }
    return (
        !(val instanceof Date) &&
        !(val instanceof RegExp) &&
        !(val instanceof Map) &&
        !(val instanceof Set) &&
        !(val instanceof Error) &&
        !Array.isArray(val)
    );
}

/**
 * Creates a deep clone of a value.
 * Uses native structuredClone where available (skipping custom classes to preserve prototypes),
 * with a robust fallback for older environments, custom classes, Dates, RegExps, Maps, and Sets.
 */
export function deepClone<T>(val: T): T {
    if (typeof structuredClone !== "undefined" && !isCustomClassInstance(val)) {
        try {
            return structuredClone(val);
        } catch {
            // Fall back to custom cloner
        }
    }

    if (val === null || typeof val !== "object") {
        return val;
    }

    if (val instanceof Date) {
        return new Date(val) as unknown as T;
    }

    if (val instanceof RegExp) {
        return new RegExp(val.source, val.flags) as unknown as T;
    }

    if (val instanceof Map) {
        const clonedMap = new Map();
        for (const [k, v] of val.entries()) {
            clonedMap.set(deepClone(k), deepClone(v));
        }
        return clonedMap as unknown as T;
    }

    if (val instanceof Set) {
        const clonedSet = new Set();
        for (const v of val) {
            clonedSet.add(deepClone(v));
        }
        return clonedSet as unknown as T;
    }

    if (Array.isArray(val)) {
        return val.map((item) => deepClone(item)) as unknown as T;
    }

    const prototype = Object.getPrototypeOf(val);
    const cloned = Object.create(prototype) as Record<string, unknown>;

    for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
            cloned[key] = deepClone((val as Record<string, unknown>)[key]);
        }
    }

    return cloned as unknown as T;
}
