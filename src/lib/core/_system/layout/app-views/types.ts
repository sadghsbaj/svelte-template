import type { TransitionConfig } from "svelte/transition";

export type Direction = "forward" | "backward" | "none";

export type ViewTransitionFn = (
    node: Element,
    params?: Record<string, unknown>
) => TransitionConfig;

export type ViewTransitionOption =
    ViewTransitionFn | { in?: ViewTransitionFn; out?: ViewTransitionFn };

// --- Scroll Restoration Types ---

export interface StoredScrollState {
    pos: number;
    height: number;
}

export type ScrollFallbackAction = "top" | "clamp";

export interface ScrollConfig {
    session?: boolean;
    persist?: boolean;
}

// --- View Configurations ---

export interface ViewConfig<T extends string> {
    view: T;
    label?: string;
    parent: "root" | T;
    scroll?: false | ScrollConfig;
    animated?: boolean;
    transition?: ViewTransitionOption;
    disabled?: boolean;
    /** Whether back-stack auto-registration is enabled for this view (default: true) */
    stack?: boolean;
}

export interface ViewsConfig<T extends string> {
    persistKey?: string;
    scroll?: ScrollConfig;
    views: readonly ViewConfig<T>[];
    animated?: boolean;
    transition?: ViewTransitionOption;
    /** Whether back-stack auto-registration is enabled globally for all views (default: true) */
    stack?: boolean;
}
