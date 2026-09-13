import type { Component, Snippet } from "svelte";

import type {
    FloatingDirection,
    FloatingPlacement,
} from "$components/_system/floating/floating.types";
import type {
    PopoverChangeDetail,
    PopoverTriggerContext,
} from "$components/_system/popover/popover.types";

export type DropdownSize = "sm" | "md" | "lg";
export type DropdownSubmenuMode = "auto" | "floating" | "drilldown";

interface DropdownItemBase {
    id: string;
    label: string;
    description?: string;
    icon?: Component;
    disabled?: boolean;
}

export interface DropdownAction extends DropdownItemBase {
    type?: "action";
    shortcut?: string;
    danger?: boolean;
    closeOnAction?: boolean;
    onAction: (detail: DropdownActionDetail) => void | Promise<void>;
}

export interface DropdownSubmenu extends DropdownItemBase {
    type: "submenu";
    items: readonly DropdownEntry[];
}

export interface DropdownSection {
    type: "section";
    id: string;
    label: string;
    items: readonly DropdownEntry[];
}

export interface DropdownSeparator {
    type: "separator";
    id: string;
}

export type DropdownItem = DropdownAction | DropdownSubmenu;
export type DropdownEntry = DropdownItem | DropdownSection | DropdownSeparator;

export interface DropdownActionDetail {
    item: DropdownAction;
    event: MouseEvent | KeyboardEvent;
    path: readonly string[];
    close: () => void;
}

export type DropdownTriggerContext = PopoverTriggerContext;

export interface DropdownProps {
    items: readonly DropdownEntry[];
    open?: boolean;
    disabled?: boolean;
    size?: DropdownSize;
    placement?: FloatingPlacement;
    direction?: FloatingDirection;
    loop?: boolean;
    closeOnAction?: boolean;
    hoverOpenDelay?: number;
    hoverCloseDelay?: number;
    submenuMode?: DropdownSubmenuMode;
    emptyText?: string;
    contentClass?: string;
    "aria-label"?: string;
    onOpenChange?: (open: boolean, detail: PopoverChangeDetail) => void;
    trigger: Snippet<[DropdownTriggerContext]>;
}
