import type { HTMLButtonAttributes } from "svelte/elements";

import type { SelectionOption } from "$components/_system/selection/selection.types";

import type { SelectStyleProps } from "./select.styles";

export type SelectOption = SelectionOption;

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
    emptyText?: string;
    disabled?: boolean;
    name?: string;
    required?: boolean;
    class?: string;
    contentClass?: string;
    onValueChange?: (value: string) => void;
}
