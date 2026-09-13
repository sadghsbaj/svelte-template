import type { Component } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";

import type { SelectStyleProps } from "./select.styles";

export interface SelectOption {
    value: string;
    label: string;
    icon?: Component;
    disabled?: boolean;
}

export interface SelectProps
    extends
        SelectStyleProps,
        Omit<
            HTMLButtonAttributes,
            "children" | "class" | "disabled" | "name" | "size" | "type" | "value"
        > {
    options: readonly SelectOption[];
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    required?: boolean;
    class?: string;
    contentClass?: string;
    onValueChange?: (value: string) => void;
}
