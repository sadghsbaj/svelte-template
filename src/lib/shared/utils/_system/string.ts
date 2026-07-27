/**
 * @file Optimized and type-safe utilities for string manipulation in TypeScript applications.
 *
 * Provides capitalize, advanced stripHtml, nested path-aware templating,
 * localized slugify, and case conversion utilities (camelCase, kebabCase, pascalCase, snakeCase).
 */

/**
 * Capitalizes the first character of a string.
 */
export function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Strips HTML tags from a string.
 * Recursively removes script, style, and noscript elements (with their contents)
 * and decodes common HTML entities.
 */
export function stripHtml(str: string): string {
    if (!str) return "";

    // 1. Remove script, style, and noscript blocks along with their contents
    let cleaned = str.replace(/<(script|style|noscript)[^>]*>([\s\S]*?)<\/\1>/gi, "");

    // 2. Remove all remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, "");

    // 3. Decode common HTML entities
    const entities: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
        "&#39;": "'",
        "&#x27;": "'",
        "&nbsp;": " ",
    };

    return cleaned.replace(/&[a-z0-9#x]+;/gi, (match) => entities[match.toLowerCase()] || match);
}

/**
 * Helper function to retrieve nested properties from an object using a dot-notation path.
 */
function getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
        if (current === null || typeof current !== "object") {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }
    return current;
}

/**
 * Dynamically interpolates template placeholders like {{user.name}} or {{ value }}
 * using a data object. Resolves nested dot-notation paths safely.
 */
export function template(str: string, data: Record<string, unknown>): string {
    return str.replace(/\{\{([^}]+)\}\}/g, (_match, path) => {
        const trimmedPath = path.trim();
        const value = getNestedValue(data, trimmedPath);
        return value === undefined || value === null ? "" : String(value);
    });
}

/**
 * Converts a string into a URL-friendly slug.
 * Safely maps German umlauts and Eszett (ä, ö, ü, ß) and strips accents/diacritics.
 */
export function slugify(str: string): string {
    if (!str) return "";

    // 1. Map German umlauts and ß explicitly before accent stripping
    let result = str.replace(/[äöüÄÖÜß]/g, (match) => {
        const map: Record<string, string> = {
            ä: "ae",
            ö: "oe",
            ü: "ue",
            Ä: "ae",
            Ö: "oe",
            Ü: "ue",
            ß: "ss",
        };
        return map[match] || match;
    });

    // 2. Normalize and strip remaining diacritics/accents
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 3. Lowercase, replace non-alphanumeric characters with hyphens, collapse, and trim
    return result
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, "") // trim leading and trailing hyphens
        .replace(/-+/g, "-"); // collapse multiple consecutive hyphens
}

/**
 * Helper function to split a string into lowercase words,
 * taking camelCase boundaries, acronyms, and non-alphanumeric punctuation into account.
 */
function splitWords(str: string): string[] {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // handle camelCase transition
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // handle acronym transitions
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean);
}

/**
 * Converts a string to camelCase.
 */
export function camelCase(str: string): string {
    const words = splitWords(str);
    if (words.length === 0) return "";
    return (
        words[0].toLowerCase() +
        words
            .slice(1)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
    );
}

/**
 * Converts a string to kebab-case.
 */
export function kebabCase(str: string): string {
    return splitWords(str)
        .map((w) => w.toLowerCase())
        .join("-");
}

/**
 * Converts a string to PascalCase.
 */
export function pascalCase(str: string): string {
    return splitWords(str)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
}

/**
 * Converts a string to snake_case.
 */
export function snakeCase(str: string): string {
    return splitWords(str)
        .map((w) => w.toLowerCase())
        .join("_");
}
