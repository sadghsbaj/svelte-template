import type { SelectionEntry, SelectionGroup, SelectionOption } from "./selection.types";

export const getSelectedIndex = (
    options: readonly SelectionOption[],
    value: string | undefined
): number => options.findIndex((option) => option.value === value);

export const getSelectedOption = (
    options: readonly SelectionOption[],
    value: string | undefined
): SelectionOption | undefined => options[getSelectedIndex(options, value)];

export const getEnabledIndexes = (options: readonly SelectionOption[]): number[] =>
    options.flatMap((option, index) => (option.disabled ? [] : [index]));

export const getNextEnabledIndex = (
    indexes: readonly number[],
    current: number | undefined,
    direction: 1 | -1
): number | undefined => {
    if (indexes.length === 0) return undefined;
    const position = current === undefined ? -1 : indexes.indexOf(current);
    if (position < 0) return direction === 1 ? indexes[0] : indexes.at(-1);
    return indexes[(position + direction + indexes.length) % indexes.length];
};

export const normalizeStaleValue = (
    options: readonly SelectionOption[],
    value: string | undefined
): string | undefined =>
    value !== undefined && getSelectedIndex(options, value) < 0 ? undefined : value;

export const normalizeSelectionQuery = (value: string): string => value.trim().toLocaleLowerCase();

export const defaultSelectionFilter = (option: SelectionOption, query: string): boolean => {
    const normalizedQuery = normalizeSelectionQuery(query);
    return [option.label, option.description].some(
        (value) => value && normalizeSelectionQuery(value).includes(normalizedQuery)
    );
};

export const groupSelectionEntries = <TOption extends SelectionOption>(
    entries: readonly SelectionEntry<TOption>[]
): SelectionGroup<TOption>[] => {
    const groups: SelectionGroup<TOption>[] = [];
    for (const entry of entries) {
        const previous = groups.at(-1);
        if (previous && previous.section === entry.option.section) previous.entries.push(entry);
        else groups.push({ section: entry.option.section, entries: [entry] });
    }
    return groups;
};
