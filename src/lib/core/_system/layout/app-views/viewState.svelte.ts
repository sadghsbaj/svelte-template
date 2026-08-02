import { SvelteSet } from "svelte/reactivity";

import { appStack } from "$core/_system/stack/appStack.svelte";

import type {
    Direction,
    StoredScrollState,
    ViewConfig,
    ViewsConfig,
    ViewTransitionFn,
    ViewTransitionOption,
} from "./types";
import { ViewScrollManager } from "./view-scroll";
import { viewIn, viewOut } from "./view-svelte-transition";

export type ViewScopeChangeListener = (rootView: string) => void;
const scopeChangeListeners = new SvelteSet<ViewScopeChangeListener>();

/**
 * Registers a listener callback invoked when the active view root scope changes.
 *
 * @param listener - Callback receiving the active root view scope name.
 * @returns Cleanup function to unregister the listener.
 */
export function onViewScopeChange(listener: ViewScopeChangeListener): () => void {
    scopeChangeListeners.add(listener);
    return () => {
        scopeChangeListeners.delete(listener);
    };
}

export class ViewState<T extends string> {
    activeView = $state<T>(undefined as unknown as T);
    fromView = $state<T | null>(null);
    private scrollManager: ViewScrollManager<T>;
    private subviewUnregister: (() => void) | null = null;

    constructor(public readonly config: ViewsConfig<T>) {
        if (!config.views?.length) {
            throw new Error("ViewsConfig must contain at least one view definition");
        }
        this.activeView = this.resolveInitialView();
        this.scrollManager = new ViewScrollManager(
            (view) => this.getConfig(view),
            () => this.config
        );
        this.syncStack(this.activeView);
    }

    destroy(): void {
        if (!this.subviewUnregister) return;

        this.subviewUnregister();
        this.subviewUnregister = null;
    }

    measureAndSave(el: HTMLElement | null, view: T = this.activeView): void {
        this.scrollManager.measureAndSave(el, view);
    }

    restoreScroll(el: HTMLElement | null, view: T = this.activeView): void {
        this.scrollManager.restoreScroll(el, view);
    }

    private resolveInitialView(): T {
        const fallback =
            this.config.views.find((v) => !v.disabled)?.view ?? this.config.views[0].view;

        if (!this.config.persistKey || typeof window === "undefined") {
            return fallback;
        }

        try {
            const saved = localStorage.getItem(this.config.persistKey);
            if (saved && this.config.views.some((v) => v.view === saved && !v.disabled)) {
                return saved as T;
            }
        } catch {
            // silent
        }

        return fallback;
    }

    getConfig(view: T): ViewConfig<T> | undefined {
        return this.config.views.find((v) => v.view === view);
    }

    get activeConfig(): ViewConfig<T> {
        return this.getConfig(this.activeView) ?? this.config.views[0];
    }

    get activeLabel(): string {
        return this.activeConfig.label ?? this.activeView;
    }

    get firstView(): T {
        return this.config.views[0].view;
    }

    get lastView(): T {
        return this.config.views.at(-1)!.view;
    }

    get currentIndex(): number {
        return this.config.views.findIndex((v) => v.view === this.activeView);
    }

    get prevView(): T | null {
        for (let i = this.currentIndex - 1; i >= 0; i--) {
            const v = this.config.views[i];
            if (v && !this.isDisabled(v.view)) {
                return v.view;
            }
        }
        return null;
    }

    get nextView(): T | null {
        for (let i = this.currentIndex + 1; i < this.config.views.length; i++) {
            const v = this.config.views[i];
            if (v && !this.isDisabled(v.view)) {
                return v.view;
            }
        }
        return null;
    }

    get direction(): Direction {
        if (!this.fromView) return "none";
        const fromIndex = this.config.views.findIndex((v) => v.view === this.fromView);
        if (fromIndex === -1 || this.currentIndex === fromIndex) return "none";

        return this.currentIndex > fromIndex ? "forward" : "backward";
    }

    isCurrent(view: T): boolean {
        return this.activeView === view;
    }

    isAnimated(view: T = this.activeView): boolean {
        if (this.config.animated === false) return false;

        const targetConfig = this.getConfig(view);
        return targetConfig?.animated !== false;
    }

    isDisabled(view: T): boolean {
        return this.getConfig(view)?.disabled ?? false;
    }

    private syncStack(targetView: T): void {
        const root = this.getRootView(targetView);
        appStack.setScope(root);

        for (const listener of scopeChangeListeners) {
            listener(root);
        }

        if (this.subviewUnregister) {
            this.subviewUnregister();
            this.subviewUnregister = null;
        }

        if (this.config.stack === false) return;

        const targetConfig = this.getConfig(targetView);
        if (targetConfig?.stack === false) return;

        const parent = this.getParent(targetView);
        if (parent !== "root" && !this.isDisabled(parent)) {
            this.subviewUnregister = appStack.register(() => this.setView(parent), {
                priority: "subview",
                scope: root,
            });
        }
    }

    setView(targetView: T): boolean {
        if (this.activeView === targetView) return false;
        if (this.isDisabled(targetView)) return false;

        this.fromView = this.activeView;
        this.activeView = targetView;
        this.syncStack(targetView);

        if (this.config.persistKey && typeof window !== "undefined") {
            try {
                localStorage.setItem(this.config.persistKey, targetView);
            } catch {
                // silent
            }
        }

        return true;
    }

    next(): boolean {
        if (!this.nextView) return false;
        return this.setView(this.nextView);
    }

    previous(): boolean {
        if (!this.prevView) return false;
        return this.setView(this.prevView);
    }

    savePosition(view: T, state: StoredScrollState): void {
        this.scrollManager.savePosition(view, state);
    }

    private resolveOption(
        option: ViewTransitionOption | undefined,
        type: "in" | "out"
    ): ViewTransitionFn | undefined {
        if (!option) return undefined;

        if (typeof option === "function") return option;

        const fn = option[type];
        return typeof fn === "function" ? fn : undefined;
    }

    getParent(view: T = this.activeView): "root" | T {
        return this.getConfig(view)?.parent ?? "root";
    }

    getRootView(view: T = this.activeView): T {
        const visited = new SvelteSet<T>();
        let current: T = view;
        while (current) {
            if (visited.has(current)) {
                return view;
            }
            visited.add(current);
            const parent = this.getParent(current);
            if (parent === "root") {
                return current;
            }
            current = parent;
        }
        return view;
    }

    getInTransition(view: T = this.activeView): ViewTransitionFn {
        const viewConfig = this.getConfig(view);

        return (
            this.resolveOption(viewConfig?.transition, "in") ??
            this.resolveOption(this.config.transition, "in") ??
            viewIn
        );
    }

    getOutTransition(view: T = this.activeView): ViewTransitionFn {
        const viewConfig = this.getConfig(view);

        return (
            this.resolveOption(viewConfig?.transition, "out") ??
            this.resolveOption(this.config.transition, "out") ??
            viewOut
        );
    }
}

export function createViewState<T extends string>(config: ViewsConfig<T>) {
    return new ViewState<T>(config);
}
