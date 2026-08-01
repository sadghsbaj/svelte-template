/**
 * @file cn.ts
 * @description A utility function to conditionally join class names together.
 * Designed as a lightweight, zero-dependency alternative to clsx/classnames.
 */

export type ClassValue =
    string | number | bigint | boolean | undefined | null | Record<string, unknown> | ClassValue[];

/**
 * Conditionally joins class names, arrays, and objects into a single space-separated string.
 * Falsy values are ignored.
 *
 * @param classes - A list of class values, arrays, or objects to join.
 * @returns A space-separated string of class names.
 */
export function cn(...classes: ClassValue[]): string {
    let result = "";

    for (const value of classes) {
        if (value) {
            if (typeof value === "string" || typeof value === "number") {
                result += (result ? " " : "") + value;
            } else if (Array.isArray(value)) {
                const inner = cn(...value);
                if (inner) {
                    result += (result ? " " : "") + inner;
                }
            } else if (typeof value === "object") {
                for (const key in value) {
                    if (Object.hasOwn(value, key) && value[key]) {
                        result += (result ? " " : "") + key;
                    }
                }
            }
        }
    }

    return result;
}
