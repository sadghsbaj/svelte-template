<script lang="ts" generics="T extends string">
    import { tick } from "svelte";
    import { disableInteraction } from "$attachments";

    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    import {
        runBottomNavbarAnimation,
        waitForBottomNavbarAnimation,
    } from "./bottom-navbar.animation";
    import { bottomNavbarItemStyles, bottomNavbarStyles } from "./bottom-navbar.styles";
    import type {
        BottomNavbarItem,
        BottomNavbarProps,
        BottomNavbarSelectDetail,
    } from "./bottom-navbar.types";

    let {
        mode = "manual",
        items = [],
        value = $bindable(),
        viewState,
        exclude = [],
        visible = true,
        animation = "default",
        size = "responsive",
        labels = "auto",
        orientation = "responsive",
        position = "fixed",
        offset = "48px",
        class: className = "",
        element = $bindable(),
        onValueChange,
        "aria-label": ariaLabel = "Primary navigation",
        ...restProps
    }: BottomNavbarProps<T> = $props();

    let surface: HTMLDivElement | undefined = $state();
    let track: HTMLDivElement | undefined = $state();
    let present = $state(true);
    let indicatorX = $state(0);
    let indicatorWidth = $state(0);
    let indicatorReady = $state(false);
    let indicatorFrame: number | null = null;
    let visibilitySequence = 0;
    let visibilityInitialized = false;
    let activeAnimation: Animation | null = null;

    const resolvedItems = $derived.by((): BottomNavbarItem<T>[] => {
        if (mode !== "views" || !viewState) {
            return items.filter((item) => !item.hidden);
        }

        return viewState.rootViews
            .filter((config) => !exclude.includes(config.view))
            .map((config) => ({
                value: config.view,
                label: config.label ?? config.view,
                icon: config.icon,
                disabled: config.disabled,
            }));
    });

    const activeValue = $derived(mode === "views" && viewState ? viewState.getRootView() : value);
    const computedClass = $derived(bottomNavbarStyles({ size, class: className }));

    function getButtons(): HTMLButtonElement[] {
        if (!track) return [];
        return [...track.querySelectorAll<HTMLButtonElement>('[data-slot="bottom-navbar-item"]')];
    }

    function scheduleIndicatorUpdate(
        _activeValue = activeValue,
        _itemCount = resolvedItems.length,
        _present = present
    ): void {
        if (indicatorFrame !== null) return;

        indicatorFrame = requestAnimationFrame(() => {
            indicatorFrame = null;
            if (!track || !present) return;

            const selected = getButtons().find((button) => button.dataset.value === activeValue);
            if (!selected) {
                indicatorReady = false;
                indicatorWidth = 0;
                return;
            }

            const trackRect = track.getBoundingClientRect();
            const selectedRect = selected.getBoundingClientRect();
            indicatorX = selectedRect.left - trackRect.left;
            indicatorWidth = selectedRect.width;

            if (!indicatorReady) {
                requestAnimationFrame(() => {
                    indicatorReady = true;
                });
            }
        });
    }

    function select(item: BottomNavbarItem<T>, event: MouseEvent): void {
        if (item.disabled || item.value === activeValue) return;

        const detail: BottomNavbarSelectDetail<T> = { item, event };
        item.onSelect?.(detail);
        if (event.defaultPrevented) return;

        if (mode === "views" && viewState) {
            if (!viewState.setView(item.value)) return;
        } else {
            value = item.value;
        }

        onValueChange?.(item.value);
    }

    function handleItemClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
        const value = event.currentTarget.dataset.value;
        const item = resolvedItems.find((candidate) => candidate.value === value);
        if (item) select(item, event);
    }

    function cancelActiveAnimation(): void {
        activeAnimation?.cancel();
    }

    function releaseFocus(): void {
        if (!surface || typeof document === "undefined") return;
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement && surface.contains(activeElement)) {
            activeElement.blur();
        }
    }

    async function updateVisibility(nextVisible: boolean, sequence: number): Promise<void> {
        if (!surface) return;

        activeAnimation?.cancel();
        activeAnimation = null;

        if (nextVisible) {
            present = true;
            await tick();
            if (sequence !== visibilitySequence || !surface) return;
            scheduleIndicatorUpdate();
        } else {
            releaseFocus();
        }

        activeAnimation = runBottomNavbarAnimation(
            surface,
            nextVisible ? "enter" : "exit",
            animation
        );
        const runningAnimation = activeAnimation;
        await waitForBottomNavbarAnimation(runningAnimation);

        if (sequence !== visibilitySequence) return;
        runningAnimation?.cancel();
        activeAnimation = null;
        surface.style.willChange = "";

        if (!nextVisible) present = false;
    }

    $effect(() => {
        scheduleIndicatorUpdate(activeValue, resolvedItems.length, present);
    });

    $effect(() => {
        if (!track || !surface) return;

        const resizeObserver = new ResizeObserver(() => scheduleIndicatorUpdate());
        resizeObserver.observe(track);
        resizeObserver.observe(surface);

        const mutationObserver = new MutationObserver(() => scheduleIndicatorUpdate());
        mutationObserver.observe(track, { childList: true, subtree: true, characterData: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            if (indicatorFrame !== null) cancelAnimationFrame(indicatorFrame);
            indicatorFrame = null;
        };
    });

    $effect(() => {
        if (!surface) return;
        const nextVisible = visible;

        if (!visibilityInitialized) {
            visibilityInitialized = true;
            present = nextVisible;
            return;
        }

        visibilitySequence += 1;
        void updateVisibility(nextVisible, visibilitySequence);

        return cancelActiveAnimation;
    });
</script>

<nav
    bind:this={element}
    {...restProps}
    aria-label={ariaLabel}
    aria-hidden={!visible ? "true" : undefined}
    data-slot="bottom-navbar"
    data-position={position}
    data-visible={visible ? "" : undefined}
    hidden={!present}
    inert={!visible}
    style:--bottom-navbar-offset={offset}
    {@attach layerAttach}
>
    <div
        bind:this={surface}
        data-slot="bottom-navbar-surface"
        data-size={size}
        data-labels={labels}
        data-orientation={orientation}
        class={computedClass}
    >
        <div bind:this={track} data-slot="bottom-navbar-track">
            <span
                aria-hidden="true"
                data-slot="bottom-navbar-indicator"
                data-ready={indicatorReady ? "" : undefined}
                class="squircle-smooth"
                style:transform={`translate3d(${indicatorX}px, 0, 0)`}
                style:width={`${indicatorWidth}px`}
            ></span>

            {#each resolvedItems as item (item.value)}
                <button
                    type="button"
                    aria-current={item.value === activeValue ? "page" : undefined}
                    aria-label={item.label}
                    data-slot="bottom-navbar-item"
                    data-state={item.value === activeValue ? "active" : "inactive"}
                    data-value={item.value}
                    class={bottomNavbarItemStyles()}
                    onclick={handleItemClick}
                    {@attach disableInteraction({ enabled: item.disabled ?? false })}
                >
                    {#if item.icon}
                        {const IconComponent = item.icon}
                        <IconComponent aria-hidden="true" />
                    {/if}
                    <span data-slot="bottom-navbar-label" class="text-trim-truncate">
                        {item.label}
                    </span>
                </button>
            {/each}
        </div>
    </div>
</nav>

<style>
    [data-slot="bottom-navbar"] {
        z-index: 0;
        display: flex;
        justify-content: center;
        pointer-events: none;
    }

    [data-slot="bottom-navbar"][data-position="fixed"] {
        position: fixed;
        inset-block-end: calc(env(safe-area-inset-bottom, 0px) + var(--bottom-navbar-offset));
        inset-inline: max(20px, 6vw, env(safe-area-inset-left), env(safe-area-inset-right));
    }

    [data-slot="bottom-navbar"][data-position="static"] {
        position: relative;
        width: 100%;
    }

    [data-slot="bottom-navbar-surface"] {
        container: bottom-navbar / inline-size;
        box-shadow:
            0 20px 48px -16px light-dark(rgb(0 0 0 / 18%), rgb(0 0 0 / 45%)),
            0 8px 20px -10px light-dark(rgb(0 0 0 / 12%), rgb(0 0 0 / 30%)),
            0 0 32px 2px light-dark(transparent, rgb(255 255 255 / 4%));
    }

    [data-slot="bottom-navbar-track"] {
        position: relative;
        display: flex;
        width: 100%;
        min-width: 0;
        height: 100%;
    }

    [data-slot="bottom-navbar-indicator"] {
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        z-index: 0;
        background: light-dark(var(--color-base-800), var(--color-base-100));
        border-radius: 9999px;
        opacity: 0;
        pointer-events: none;
    }

    [data-slot="bottom-navbar-indicator"][data-ready] {
        opacity: 1;
        transition:
            transform 220ms var(--ease-cubic-out),
            width 220ms var(--ease-cubic-out);
    }

    :global([data-slot="bottom-navbar-item"]) {
        flex-direction: row;
    }

    :global([data-slot="bottom-navbar-item"][data-state="active"]) {
        color: light-dark(var(--color-base-50), var(--color-base-950));
        cursor: default;
    }

    :global([data-slot="bottom-navbar-item"][data-state="inactive"]) {
        color: var(--color-text-main);
        cursor: pointer;
    }

    @media (hover: hover) and (pointer: fine) {
        :global(
            [data-slot="bottom-navbar-item"][data-state="inactive"]:not(
                    :disabled,
                    [aria-disabled="true"],
                    [aria-busy="true"]
                ):hover
        ) {
            color: var(--color-text-strong);
        }
    }

    @media (hover: none) and (pointer: coarse) {
        [data-slot="bottom-navbar-surface"] {
            box-shadow:
                0 20px 48px -16px light-dark(rgb(0 0 0 / 18%), rgb(0 0 0 / 48%)),
                0 8px 20px -10px light-dark(rgb(0 0 0 / 12%), rgb(0 0 0 / 32%)),
                0 0 38px 4px light-dark(transparent, rgb(255 255 255 / 6%));
        }
    }

    [data-slot="bottom-navbar-surface"][data-orientation="vertical"]
        :global([data-slot="bottom-navbar-item"]),
    [data-slot="bottom-navbar-surface"][data-orientation="responsive"]
        :global([data-slot="bottom-navbar-item"]) {
        flex-direction: column;
        gap: 4px;
    }

    [data-slot="bottom-navbar-surface"][data-labels="hidden"]
        :global([data-slot="bottom-navbar-label"]) {
        position: absolute;
        margin: -1px;
        width: 1px;
        height: 1px;
        padding: 0;
        overflow: hidden;
        white-space: nowrap;
        clip-path: inset(50%);
    }

    @container bottom-navbar (min-width: 420px) {
        [data-slot="bottom-navbar-surface"][data-orientation="responsive"]
            :global([data-slot="bottom-navbar-item"]) {
            flex-direction: row;
            gap: 6px;
        }
    }

    @container bottom-navbar (max-width: 400px) {
        :global([data-slot="bottom-navbar-item"]) {
            padding-inline: 6px;
        }
    }

    @container bottom-navbar (max-width: 280px) {
        [data-slot="bottom-navbar-surface"][data-labels="auto"]
            :global([data-slot="bottom-navbar-label"]) {
            position: absolute;
            margin: -1px;
            width: 1px;
            height: 1px;
            padding: 0;
            overflow: hidden;
            white-space: nowrap;
            clip-path: inset(50%);
        }
    }
</style>
