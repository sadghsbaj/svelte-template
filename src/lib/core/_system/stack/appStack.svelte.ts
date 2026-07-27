import { SvelteSet } from "svelte/reactivity";

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
    private _entries = $state<StackEntry[]>([]);
    private _activeScope = $state<string>("global");
    private _onRootPop = $state<OnRootPopAction>("none");
    private _config = $state<AppStackConfig>({
        enabled: true,
        interceptBrowserBack: true,
        allowedPriorities: undefined,
    });

    private listenerBound = false;
    private sequenceCounter = 0;
    private cachedAllowedPriorities: SvelteSet<number> | Set<number> | null = null;
    private boundPopStateListener: ((e: PopStateEvent) => void) | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.bindGlobalEvents();
        }
    }

    get entries(): StackEntry[] {
        return this._entries;
    }

    get activeScope(): string {
        return this._activeScope;
    }

    get onRootPop(): OnRootPopAction {
        return this._onRootPop;
    }

    set onRootPop(value: OnRootPopAction) {
        this._onRootPop = value;
    }

    get config(): AppStackConfig {
        return this._config;
    }

    configure(newConfig: Partial<AppStackConfig>): void {
        this._config = {
            ...this._config,
            ...newConfig,
        };
        this.updateAllowedPrioritiesCache();
    }

    get size(): number {
        return this._entries.length;
    }

    scopeSize(scope: string = this._activeScope): number {
        return this._entries.filter(
            (entry) =>
                (entry.scope === "global" || entry.scope === scope) &&
                this.isPriorityAllowed(entry.priority)
        ).length;
    }

    get canGoBack(): boolean {
        if (this._config.enabled === false) return false;
        return this._entries.some(
            (entry) =>
                (entry.scope === "global" || entry.scope === this._activeScope) &&
                this.isPriorityAllowed(entry.priority)
        );
    }

    private updateAllowedPrioritiesCache(): void {
        if (!this._config.allowedPriorities || this._config.allowedPriorities.length === 0) {
            this.cachedAllowedPriorities = null;
        } else {
            const allowedSet = new SvelteSet<number>();
            for (const p of this._config.allowedPriorities) {
                const resolved = this.resolvePriority(p);
                allowedSet.add(resolved);
            }
            this.cachedAllowedPriorities = allowedSet;
        }
    }

    private resolvePriority(priority?: StackPriority): number {
        if (typeof priority === "number") return priority;
        if (typeof priority === "string" && priority in STACK_PRIORITY_MAP) {
            return STACK_PRIORITY_MAP[priority as keyof typeof STACK_PRIORITY_MAP];
        }
        return STACK_PRIORITY_MAP.overlay;
    }

    private isPriorityAllowed(priority: number): boolean {
        if (this.cachedAllowedPriorities === null) {
            return true;
        }
        return this.cachedAllowedPriorities.has(priority);
    }

    register(action: () => void, options?: StackRegisterOptions): () => void {
        const id = options?.id || uuid();
        const priority = this.resolvePriority(options?.priority);
        const scope = options?.scope ?? "global";

        const entry: StackEntry = {
            id,
            action,
            priority,
            scope,
            createdAt: Date.now(),
            sequence: ++this.sequenceCounter,
        };

        this._entries.push(entry);

        return () => {
            this.unregister(id);
        };
    }

    unregister(idOrAction: string | (() => void)): boolean {
        const index =
            typeof idOrAction === "string"
                ? this._entries.findIndex((entry) => entry.id === idOrAction)
                : this._entries.findLastIndex((entry) => entry.action === idOrAction);

        if (index !== -1) {
            this._entries.splice(index, 1);
            return true;
        }

        return false;
    }

    pop(targetScope: string = this._activeScope, isFromPopState: boolean = false): boolean {
        if (this._config.enabled === false) return false;

        let candidate: StackEntry | null = null;

        for (let i = 0; i < this._entries.length; i++) {
            const entry = this._entries[i];
            if (
                (entry.scope === "global" || entry.scope === targetScope) &&
                this.isPriorityAllowed(entry.priority)
            ) {
                if (
                    !candidate ||
                    entry.priority > candidate.priority ||
                    (entry.priority === candidate.priority && entry.sequence >= candidate.sequence)
                ) {
                    candidate = entry;
                }
            }
        }

        if (!candidate) {
            this.handleRootPop(isFromPopState);
            return false;
        }

        this.unregister(candidate.id);
        try {
            candidate.action();
        } catch (error) {
            console.error("Error executing stack action:", error);
        }
        return true;
    }

    clear(scope?: string): void {
        if (!scope) {
            this._entries = [];
        } else {
            this._entries = this._entries.filter((entry) => entry.scope !== scope);
        }
    }

    setScope(scope: string): void {
        this._activeScope = scope;
    }

    private handleRootPop(isFromPopState: boolean = false): void {
        if (typeof this._onRootPop === "function") {
            this._onRootPop();
        } else if (this._onRootPop === "exit" && typeof window !== "undefined") {
            if (!isFromPopState) {
                window.history.back();
            }
        }
    }

    private handlePopState = (_e: PopStateEvent): void => {
        if (this._config.enabled !== false && this._config.interceptBrowserBack !== false) {
            this.pop(this._activeScope, true);
        }
    };

    private bindGlobalEvents(): void {
        if (this.listenerBound || typeof window === "undefined") return;

        this.boundPopStateListener = this.handlePopState;
        window.addEventListener("popstate", this.boundPopStateListener);

        this.listenerBound = true;
    }

    unbindGlobalEvents(): void {
        if (typeof window !== "undefined" && this.boundPopStateListener) {
            window.removeEventListener("popstate", this.boundPopStateListener);
            this.boundPopStateListener = null;
        }
        this.listenerBound = false;
    }

    destroy(): void {
        this.unbindGlobalEvents();
        this.clear();
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
    let currentAction = action;

    const attachment = (_node: Element) => {
        const unregister = targetStack.register(() => currentAction(), options);

        const cleanup = () => {
            unregister();
        };
        cleanup.update = (newAction: () => void) => {
            currentAction = newAction;
        };
        return cleanup;
    };

    attachment.update = (newAction: () => void) => {
        currentAction = newAction;
    };

    return attachment;
}

