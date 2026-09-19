import { Component, FlaskConical, Settings } from "@lucide/svelte";

import { createViewState } from "$core/_system/layout/app-views/view-state/viewState.svelte";

export const viewState = createViewState({
    persistKey: "svelte-template-views",
    views: [
        // @template-remove-start
        {
            view: "components",
            label: "Components",
            icon: Component,
            parent: "root",
        },
        {
            view: "playground",
            label: "Playground",
            icon: FlaskConical,
            parent: "root",
        },
        {
            view: "settings",
            label: "Settings",
            icon: Settings,
            parent: "root",
        },
        // @template-remove-end
    ] as const,
});

export type ViewItem = (typeof viewState.views)[number];
export type { ViewConfig } from "$core/_system/layout/app-views/types";
