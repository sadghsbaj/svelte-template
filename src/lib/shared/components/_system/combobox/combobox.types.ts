import type { HTMLInputAttributes } from "svelte/elements";

import type { SelectionOption } from "$components/_system/selection/selection.types";
import type { TextInputStyleProps } from "$components/_system/text-input/text-input.styles";

export type ComboboxOption = SelectionOption;
export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean;

export interface ComboboxProps
    extends
        TextInputStyleProps,
        Omit<
            HTMLInputAttributes,
            | "aria-activedescendant"
            | "aria-autocomplete"
            | "aria-controls"
            | "aria-expanded"
            | "children"
            | "class"
            | "disabled"
            | "form"
            | "name"
            | "placeholder"
            | "required"
            | "role"
            | "size"
            | "value"
        > {
    options: readonly ComboboxOption[];
    value?: string;
    /** Visible query. Undefined initializes to the selected label or an empty string. */
    inputValue?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    filter?: ComboboxFilter;
    emptyText?: string;
    name?: string;
    required?: boolean;
    form?: string;
    class?: string;
    inputClass?: string;
    contentClass?: string;
    /** Called only for user-driven committed-value changes, including clearing while typing. */
    onValueChange?: (value: string | undefined) => void;
    /** Called only when user interaction changes the visible query. */
    onInputValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
}
