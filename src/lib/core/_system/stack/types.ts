export type StackPriorityPreset = "overlay" | "subview" | "root";

export type StackPriority = StackPriorityPreset | number;

export type OnRootPopAction = "none" | "exit" | (() => void);

export interface AppStackConfig {
    /** Whether the back-stack system is active (default: true) */
    enabled?: boolean;

    /** Whether browser popstate (back button / gestures) are intercepted (default: true) */
    interceptBrowserBack?: boolean;

    /** Allowed priority presets or numeric values (default: all allowed) */
    allowedPriorities?: (StackPriorityPreset | number)[];
}

export interface StackRegisterOptions {
    id?: string;
    priority?: StackPriority;
    scope?: string;
}

export interface StackEntry {
    id: string;
    action: () => void;
    priority: number;
    scope: string;
    createdAt: number;
}

export const STACK_PRIORITY_MAP: Record<StackPriorityPreset, number> = {
    overlay: 100,
    subview: 50,
    root: 10,
};
