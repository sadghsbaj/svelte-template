import { createViewState } from "$core/_system/layout/app-views/viewState.svelte";

export const viewState = createViewState({
    persistKey: "svelte-template-views",
    views: [
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
    ] as const,
});
