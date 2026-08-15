import { createViewState } from "$core/_system/layout/app-views/view-state/viewState.svelte";

export const viewState = createViewState({
    persistKey: "svelte-template-views",
    views: [
        // @template-remove-start
        {
            view: "components",
            label: "Components",
            parent: "root",
        },
        {
            view: "playground",
            label: "Playground",
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
