import { describe, expect, test } from "vitest";

import {
    defaultSelectionFilter,
    getEnabledIndexes,
    getNextEnabledIndex,
    getSelectedIndex,
    getSelectedOption,
    normalizeStaleValue,
} from "./selection.helpers";
import type { SelectionOption } from "./selection.types";

const options: readonly SelectionOption[] = [
    { value: "same", label: "First" },
    { value: "off", label: "Disabled", disabled: true },
    { value: "same", label: "Second" },
];

describe("selection helpers", () => {
    test("resolves duplicate selections and enabled indexes deterministically", () => {
        expect(getSelectedIndex(options, "same")).toBe(0);
        expect(getSelectedOption(options, "same")?.label).toBe("First");
        expect(getEnabledIndexes(options)).toEqual([0, 2]);
    });

    test("loops enabled indexes in either direction", () => {
        expect(getNextEnabledIndex([0, 2], 2, 1)).toBe(0);
        expect(getNextEnabledIndex([0, 2], 0, -1)).toBe(2);
        expect(getNextEnabledIndex([], undefined, 1)).toBeUndefined();
    });

    test("normalizes stale values and default contains filtering", () => {
        expect(normalizeStaleValue(options, "missing")).toBeUndefined();
        expect(normalizeStaleValue(options, "same")).toBe("same");
        expect(defaultSelectionFilter(options[0] as SelectionOption, " IR ")).toBe(true);
        expect(defaultSelectionFilter(options[0] as SelectionOption, "second")).toBe(false);
    });
});
