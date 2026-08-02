import { createViewState } from "$core/_system/layout/app-views/viewState.svelte";

export const viewState = createViewState({
    persistKey: "svelte-template-views",
    views: [
        // @template-remove-start
        {
            view: "home",
            label: "Home",
            parent: "root",
        },
        {
            view: "stats",
            label: "Stats",
            parent: "root",
        },
        {
            view: "settings",
            label: "Settings",
            parent: "root",
        },
        // @template-remove-end
    ] as const,
});
