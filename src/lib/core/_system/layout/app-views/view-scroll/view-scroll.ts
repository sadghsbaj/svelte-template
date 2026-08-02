import { SvelteMap } from "svelte/reactivity";

import type {
    ScrollConfig,
    StoredScrollState,
    ViewConfig,
    ViewsConfig,
} from "$core/_system/layout/app-views/types";

export class ViewScrollManager<T extends string> {
    private sessionScrollMap = new SvelteMap<T, StoredScrollState>();

    constructor(
        private getConfig: (view: T) => ViewConfig<T> | undefined,
        private getGlobalConfig: () => ViewsConfig<T>
    ) {}

    private get scrollStorageKey(): string | null {
        const globalConfig = this.getGlobalConfig();
        return globalConfig.persistKey ? `${globalConfig.persistKey}_scroll_state` : null;
    }

    getResolvedScrollConfig(view: T): Required<ScrollConfig> {
        const viewConfig = this.getConfig(view);

        if (viewConfig?.scroll === false) {
            return { session: false, persist: false };
        }

        const globalScroll = this.getGlobalConfig().scroll;
        const localScroll = typeof viewConfig?.scroll === "object" ? viewConfig.scroll : undefined;

        const session = localScroll?.session ?? globalScroll?.session ?? false;
        const persistKey = this.getGlobalConfig().persistKey;
        const persist = persistKey
            ? (localScroll?.persist ?? globalScroll?.persist ?? false)
            : false;

        return { session, persist };
    }

    measureAndSave(el: HTMLElement | null, view: T): void {
        if (!el) return;
        const { session, persist } = this.getResolvedScrollConfig(view);
        if (!session && !persist) return;

        const state: StoredScrollState = {
            pos: el.scrollTop,
            height: el.scrollHeight,
        };

        if (session) {
            this.sessionScrollMap.set(view, state);
        }

        if (persist && this.scrollStorageKey && typeof window !== "undefined") {
            try {
                const all = this.readPersistedScrollPositions();
                all[view] = state;
                localStorage.setItem(this.scrollStorageKey, JSON.stringify(all));
            } catch {
                // silent
            }
        }
    }

    restoreScroll(el: HTMLElement | null, view: T): void {
        if (!el || typeof window === "undefined") return;

        const { session, persist } = this.getResolvedScrollConfig(view);
        if (!session && !persist) return;

        let saved: StoredScrollState | null = null;

        if (session && this.sessionScrollMap.has(view)) {
            saved = this.sessionScrollMap.get(view)!;
        } else if (persist && this.scrollStorageKey) {
            const all = this.readPersistedScrollPositions();
            saved = all[view] ?? null;
        }

        if (!saved) return;

        // 1:1 Height check rule: only restore if current height is identical to saved height
        if (Math.abs(el.scrollHeight - saved.height) <= 3) {
            el.scrollTop = saved.pos;
        }
    }

    savePosition(view: T, state: StoredScrollState): void {
        const { session, persist } = this.getResolvedScrollConfig(view);
        if (!session && !persist) return;

        if (session) {
            this.sessionScrollMap.set(view, state);
        }

        if (persist && this.scrollStorageKey && typeof window !== "undefined") {
            try {
                const all = this.readPersistedScrollPositions();
                all[view] = state;
                localStorage.setItem(this.scrollStorageKey, JSON.stringify(all));
            } catch {
                // silent
            }
        }
    }

    private readPersistedScrollPositions(): Record<string, StoredScrollState> {
        if (!this.scrollStorageKey || typeof window === "undefined") return {};
        try {
            const raw = localStorage.getItem(this.scrollStorageKey);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
                ? (parsed as Record<string, StoredScrollState>)
                : {};
        } catch {
            return {};
        }
    }
}
