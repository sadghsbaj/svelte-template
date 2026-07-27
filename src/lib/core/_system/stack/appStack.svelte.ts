import { uuid } from "$utils/_system";

import type {
    AppStackConfig,
    OnRootPopAction,
    StackEntry,
    StackPriority,
    StackRegisterOptions,
} from "./types";
import { STACK_PRIORITY_MAP } from "./types";

export class AppStackManager {
    entries = $state<StackEntry[]>([]);
    activeScope = $state<string>("global");
    onRootPop = $state<OnRootPopAction>("none");
    config = $state<AppStackConfig>({
        enabled: true,
        interceptBrowserBack: true,
        allowedPriorities: undefined,
    });

    private listenerBound = false;

    constructor() {
        if (typeof window !== "undefined") {
            this.bindGlobalEvents();
        }
    }

    configure(newConfig: Partial<AppStackConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig,
        };
    }

    get size(): number {
        return this.entries.length;
    }

    get canGoBack(): boolean {
        if (this.config.enabled === false) return false;
        return this.entries.some(
            (entry) =>
                (entry.scope === "global" || entry.scope === this.activeScope) &&
                this.isPriorityAllowed(entry.priority)
        );
    }

    private resolvePriority(priority?: StackPriority): number {
        if (typeof priority === "number") return priority;
        if (typeof priority === "string" && priority in STACK_PRIORITY_MAP) {
            return STACK_PRIORITY_MAP[priority];
        }
        return STACK_PRIORITY_MAP.overlay;
    }

    private isPriorityAllowed(priority: number): boolean {
        if (!this.config.allowedPriorities || this.config.allowedPriorities.length === 0) {
            return true;
        }

        const allowedNumbers = this.config.allowedPriorities.map((p) =>
            typeof p === "number" ? p : STACK_PRIORITY_MAP[p]
        );

        return allowedNumbers.includes(priority);
    }

    register(action: () => void, options?: StackRegisterOptions): () => void {
        const id = options?.id ?? uuid();
        const priority = this.resolvePriority(options?.priority);
        const scope = options?.scope ?? "global";

        const entry: StackEntry = {
            id,
            action,
            priority,
            scope,
            createdAt: Date.now(),
        };

        this.entries.push(entry);

        return () => {
            this.unregister(id);
        };
    }

    unregister(idOrAction: string | (() => void)): boolean {
        const index = this.entries.findIndex((entry) =>
            typeof idOrAction === "string" ? entry.id === idOrAction : entry.action === idOrAction
        );

        if (index !== -1) {
            this.entries.splice(index, 1);
            return true;
        }

        return false;
    }

    pop(targetScope: string = this.activeScope): boolean {
        if (this.config.enabled === false) return false;

        const matchingEntries = this.entries.filter(
            (entry) =>
                (entry.scope === "global" || entry.scope === targetScope) &&
                this.isPriorityAllowed(entry.priority)
        );

        if (matchingEntries.length === 0) {
            this.handleRootPop();
            return false;
        }

        // Find candidate with highest priority (and newest createdAt for ties -> LIFO)
        let candidate = matchingEntries[0];
        for (let i = 1; i < matchingEntries.length; i++) {
            const current = matchingEntries[i];
            if (
                current.priority > candidate.priority ||
                (current.priority === candidate.priority && current.createdAt >= candidate.createdAt)
            ) {
                candidate = current;
            }
        }

        this.unregister(candidate.id);
        candidate.action();
        return true;
    }

    clear(scope?: string): void {
        if (!scope) {
            this.entries = [];
        } else {
            this.entries = this.entries.filter((entry) => entry.scope !== scope);
        }
    }

    setScope(scope: string): void {
        this.activeScope = scope;
    }

    private handleRootPop(): void {
        if (typeof this.onRootPop === "function") {
            this.onRootPop();
        } else if (this.onRootPop === "exit" && typeof window !== "undefined") {
            window.history.back();
        }
    }

    private bindGlobalEvents(): void {
        if (this.listenerBound || typeof window === "undefined") return;

        window.addEventListener("popstate", (e) => {
            if (this.config.enabled !== false && this.config.interceptBrowserBack !== false) {
                if (this.canGoBack) {
                    e.preventDefault();
                    this.pop();
                }
            }
        });

        this.listenerBound = true;
    }
}

export const appStack = new AppStackManager();

/**
 * Svelte 5 Attachment helper to register a stack action on element mount,
 * and automatically unregister it on element unmount.
 */
export function stackAttach(
    action: () => void,
    options?: StackRegisterOptions,
    targetStack: AppStackManager = appStack
) {
    return (_node: Element) => {
        const unregister = targetStack.register(action, options);
        return () => {
            unregister();
        };
    };
}
