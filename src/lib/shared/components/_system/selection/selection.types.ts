import type { Component } from "svelte";

export interface SelectionOption {
    value: string;
    label: string;
    icon?: Component;
    disabled?: boolean;
}
