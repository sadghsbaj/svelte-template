import type { Component } from "svelte";

export interface SelectionOption {
    value: string;
    label: string;
    description?: string;
    section?: string;
    icon?: Component;
    disabled?: boolean;
}

export interface SelectionEntry<TOption extends SelectionOption = SelectionOption> {
    option: TOption;
    index: number;
}

export interface SelectionGroup<TOption extends SelectionOption = SelectionOption> {
    section?: string;
    entries: SelectionEntry<TOption>[];
}
