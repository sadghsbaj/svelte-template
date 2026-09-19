import type { Component } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type { ViewState } from "$core/_system/layout/app-views/view-state/viewState.svelte";

export type BottomNavbarMode = "manual" | "views";
export type BottomNavbarSize = "sm" | "md" | "lg" | "responsive";
export type BottomNavbarLabels = "always" | "auto" | "hidden";
export type BottomNavbarOrientation = "horizontal" | "vertical" | "responsive";
export type BottomNavbarPosition = "fixed" | "static";

export interface BottomNavbarItem<T extends string = string> {
    value: T;
    label: string;
    icon?: Component;
    disabled?: boolean;
    hidden?: boolean;
    onSelect?: (detail: BottomNavbarSelectDetail<T>) => void;
}

export interface BottomNavbarSelectDetail<T extends string = string> {
    item: BottomNavbarItem<T>;
    event: MouseEvent;
}

export interface BottomNavbarAnimationContext {
    phase: "enter" | "exit";
    reducedMotion: boolean;
}

export type BottomNavbarAnimation = (
    element: HTMLElement,
    context: BottomNavbarAnimationContext
) => Animation | null;

export interface BottomNavbarProps<T extends string = string>
    extends Omit<HTMLAttributes<HTMLElement>, "children" | "class" | "hidden"> {
    mode?: BottomNavbarMode;
    items?: readonly BottomNavbarItem<T>[];
    value?: T;
    viewState?: ViewState<T>;
    exclude?: readonly T[];
    visible?: boolean;
    animation?: "default" | "none" | BottomNavbarAnimation;
    size?: BottomNavbarSize;
    labels?: BottomNavbarLabels;
    orientation?: BottomNavbarOrientation;
    position?: BottomNavbarPosition;
    offset?: string;
    class?: string;
    element?: HTMLElement | null;
    onValueChange?: (value: T) => void;
}
