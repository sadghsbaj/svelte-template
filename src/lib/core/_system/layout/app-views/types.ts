import type { TransitionConfig } from "svelte/transition";

export type Direction = "forward" | "backward" | "none";

export type ViewTransitionFn = (
    node: Element,
    params?: Record<string, unknown>
) => TransitionConfig;

export type ViewTransitionMode = "waapi" | "svelte" | "none";

export interface ViewTransitionObject {
    mode?: ViewTransitionMode;
    in?: ViewTransitionFn;
    out?: ViewTransitionFn;
}

export type ViewTransitionOption =
    | ViewTransitionMode
    | ViewTransitionFn
    | ViewTransitionObject;

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
    transition?: ViewTransitionOption;
    disabled?: boolean;
    /** Whether back-stack auto-registration is enabled for this view (default: true) */
    stack?: boolean;
}

export interface ViewsConfig<T extends string> {
    persistKey?: string;
    scroll?: ScrollConfig;
    views: readonly ViewConfig<T>[];
    transition?: ViewTransitionOption;
    /** Whether back-stack auto-registration is enabled globally for all views (default: true) */
    stack?: boolean;
}
