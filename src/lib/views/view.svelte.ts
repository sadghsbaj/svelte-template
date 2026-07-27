import { createViewState } from "$core/_system/layout/app-views/viewState.svelte";

export const viewState = createViewState({
    persistKey: "svelte-template-views",
    scroll: {
        // @template-remove-start
        session: true,
        persist: true,
        // @template-remove-end
    },
    views: [
        // @template-remove-start
        {
            view: "demo",
            label: "Demo Preview",
            parent: "root",
        },
        // @template-remove-end
    ] as const,
});
