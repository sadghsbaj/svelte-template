import { createViewState } from "$core/_system/layout/app-views/viewState.svelte";

export const viewState = createViewState({
    persistKey: "svelte-template-views",
    views: [
        {
            view: "home",
            label: "Home",
            parent: "root",
        },
    ] as const,
});
