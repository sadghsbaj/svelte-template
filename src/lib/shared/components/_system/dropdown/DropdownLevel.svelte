<script lang="ts">
    import { onDestroy } from "svelte";
    import type { Attachment } from "svelte/attachments";
    import { ChevronRight } from "@lucide/svelte";
    import { disableInteraction, rovingFocus } from "$attachments";

    import type { FloatingSide } from "$components/_system/floating/floating.types";
    import Kbd from "$components/_system/kbd/Kbd.svelte";
    import Popover from "$components/_system/popover/Popover.svelte";
    import type { PopoverDismissDetail } from "$components/_system/popover/popover.types";
    import {
        selectionSectionLabelStyles,
        selectionSectionStyles,
    } from "$components/_system/selection/selection.styles";

    import {
        dropdownContentStyles,
        dropdownItemStyles,
        dropdownSeparatorStyles,
    } from "./dropdown.styles";
    import type {
        DropdownAction,
        DropdownEntry,
        DropdownSize,
        DropdownSubmenu,
    } from "./dropdown.types";
    import DropdownLevel from "./DropdownLevel.svelte";

    interface Props {
        items: readonly DropdownEntry[];
        size: DropdownSize;
        direction: "auto" | "ltr" | "rtl";
        loop: boolean;
        closeOnAction: boolean;
        hoverOpenDelay: number;
        hoverCloseDelay: number;
        emptyText: string;
        focusIntent: "first" | "last" | null;
        depth: number;
        path: readonly string[];
        closeRoot: () => void;
        closeLevel?: () => void;
        onPointerEnterLevel?: () => void;
        onPointerLeaveLevel?: () => void;
        branchDirection?: { side: "left" | "right" };
    }

    let {
        items,
        size,
        direction,
        loop,
        closeOnAction,
        hoverOpenDelay,
        hoverCloseDelay,
        emptyText,
        focusIntent,
        depth,
        path,
        closeRoot,
        closeLevel,
        onPointerEnterLevel: notifyParentPointerEnter,
        onPointerLeaveLevel,
        branchDirection,
    }: Props = $props();

    const instanceId = $props.id();
    let menuElement = $state<HTMLDivElement>();
    let openSubmenuId = $state<string | null>(null);
    let childFocusIntent = $state<"first" | "last" | null>(null);
    let isRtl = $state(false);
    let submenuBranches = $state<Record<string, { side: "left" | "right" } | undefined>>({});
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const itemElements = $state<Record<string, HTMLButtonElement | undefined>>({});

    const contentClassName = dropdownContentStyles();
    const defaultSubmenuSide = $derived(branchDirection?.side ?? (isRtl ? "left" : "right"));
    const rovingAttachment = $derived(
        rovingFocus({
            selector: "[data-dropdown-item]",
            orientation: "vertical",
            loop,
            typeahead: {
                getText: (item) => item.dataset.dropdownLabel ?? "",
            },
            initialItem: (_container, availableItems) =>
                focusIntent === "last" ? (availableItems.at(-1) ?? null) : null,
        })
    );

    const clearOpenTimer = (): void => {
        if (openTimer) clearTimeout(openTimer);
        openTimer = undefined;
    };

    const clearCloseTimer = (): void => {
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = undefined;
    };

    const keepBranchOpen = (): void => {
        clearCloseTimer();
        notifyParentPointerEnter?.();
    };

    const captureItem =
        (key: string): Attachment<HTMLButtonElement> =>
        (element) => {
            itemElements[key] = element;
            return () => {
                if (itemElements[key] === element) delete itemElements[key];
            };
        };

    const openSubmenu = (key: string, intent: "first" | "last" | null, immediate = true): void => {
        clearOpenTimer();
        clearCloseTimer();
        const apply = (): void => {
            childFocusIntent = intent;
            if (!branchDirection) submenuBranches[key] = { side: defaultSubmenuSide };
            openSubmenuId = key;
        };
        if (immediate || hoverOpenDelay <= 0) apply();
        else openTimer = setTimeout(apply, hoverOpenDelay);
    };

    const closeSubmenu = (key: string, delayed = false): void => {
        clearOpenTimer();
        clearCloseTimer();
        const apply = (): void => {
            if (!branchDirection) delete submenuBranches[key];
            if (openSubmenuId === key) openSubmenuId = null;
        };
        if (!delayed || hoverCloseDelay <= 0) apply();
        else closeTimer = setTimeout(apply, hoverCloseDelay);
    };

    const focusItem = (key: string): void => {
        queueMicrotask(() => itemElements[key]?.focus({ preventScroll: true }));
    };

    const handleAction = (item: DropdownAction, event: MouseEvent): void => {
        if (item.disabled) return;
        const shouldClose = item.closeOnAction ?? closeOnAction;
        if (shouldClose) closeRoot();
        queueMicrotask(() => {
            void item.onAction({ item, event, path, close: closeRoot });
        });
    };

    const handleSubmenuDismiss = (detail: PopoverDismissDetail): void => {
        if (detail.reason === "outside-pointer" || detail.reason === "anchor-detached") closeRoot();
    };

    const captureSubmenuSide = (key: string, side: FloatingSide): void => {
        if (side !== "left" && side !== "right") return;
        const branch = branchDirection ?? submenuBranches[key];
        if (branch) branch.side = side;
    };

    const resolveSubmenuFocus = (content: HTMLElement): HTMLElement | null => {
        const availableItems = [
            ...content.querySelectorAll<HTMLElement>("[data-dropdown-item]"),
        ].filter((item) => item.ariaDisabled !== "true");
        return childFocusIntent === "last"
            ? (availableItems.at(-1) ?? null)
            : (availableItems.at(0) ?? null);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
        const target =
            event.target instanceof Element
                ? event.target.closest<HTMLElement>("[data-dropdown-item]")
                : null;
        if (!target || target.closest("[data-roving-focus-container]") !== menuElement) return;

        if (event.key === "Tab") {
            closeRoot();
            return;
        }

        const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
        const backwardKey = isRtl ? "ArrowRight" : "ArrowLeft";
        if (event.key === forwardKey && target.dataset.dropdownSubmenu === "true") {
            event.preventDefault();
            event.stopPropagation();
            openSubmenu(target.dataset.dropdownKey as string, "first");
        } else if (event.key === backwardKey && depth > 0) {
            event.preventDefault();
            event.stopPropagation();
            closeLevel?.();
        }
    };

    const handlePointerMove = (event: PointerEvent): void => {
        if (event.pointerType !== "mouse" || closeTimer) return;
        const target = event.currentTarget as HTMLButtonElement;
        if (target.ariaDisabled !== "true" && document.activeElement !== target) {
            target.focus({ preventScroll: true });
        }
    };

    $effect(() => {
        const menu = menuElement;
        if (!menu) return;
        const resolvedDirection =
            direction === "auto" ? getComputedStyle(menu).direction : direction;
        isRtl = resolvedDirection === "rtl";
    });

    onDestroy(() => {
        clearOpenTimer();
        clearCloseTimer();
    });
</script>

{#snippet renderEntries(entries: readonly DropdownEntry[], prefix: string)}
    {#each entries as entry, index (`${prefix}-${entry.id}-${index}`)}
        {const key = `${prefix}-${entry.id}-${index}`}
        {#if entry.type === "section"}
            {#if entry.items.length > 0}
                <div
                    role="group"
                    aria-labelledby={`${instanceId}-${key}-label`}
                    class={selectionSectionStyles({ separated: index > 0 })}
                >
                    <div
                        id={`${instanceId}-${key}-label`}
                        class={selectionSectionLabelStyles({ size })}
                    >
                        {entry.label}
                    </div>
                    {@render renderEntries(entry.items, key)}
                </div>
            {/if}
        {:else if entry.type === "separator"}
            <div role="separator" class={dropdownSeparatorStyles}></div>
        {:else if entry.type === "submenu"}
            {const submenu = entry as DropdownSubmenu}
            {const submenuContentId = `${instanceId}-${key}-menu`}
            <button
                type="button"
                role="menuitem"
                tabindex="-1"
                data-dropdown-item
                data-dropdown-submenu="true"
                data-dropdown-submenu-side={branchDirection?.side ??
                    submenuBranches[key]?.side ??
                    defaultSubmenuSide}
                data-dropdown-key={key}
                data-dropdown-label={submenu.label}
                aria-haspopup="menu"
                aria-expanded={openSubmenuId === key}
                aria-controls={openSubmenuId === key ? submenuContentId : undefined}
                class={dropdownItemStyles({
                    size,
                    described: Boolean(submenu.description),
                    submenuOpen: openSubmenuId === key,
                })}
                onclick={() => openSubmenu(key, "first")}
                onfocus={() => {
                    if (openSubmenuId && openSubmenuId !== key) openSubmenuId = null;
                }}
                onpointermove={handlePointerMove}
                onpointerenter={(event) => {
                    if (event.pointerType === "mouse" && !submenu.disabled)
                        openSubmenu(key, null, false);
                }}
                onpointerleave={(event) => {
                    if (event.pointerType === "mouse") closeSubmenu(key, true);
                }}
                {@attach captureItem(key)}
                {@attach disableInteraction({ enabled: submenu.disabled === true })}
            >
                {#if submenu.icon}
                    {const ItemIcon = submenu.icon}
                    <ItemIcon aria-hidden="true" class="shrink-0 text-weak" />
                {/if}
                <span class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate font-500 leading-normal text-strong">{submenu.label}</span
                    >
                    {#if submenu.description}
                        <span class="truncate text-xs font-400 leading-normal text-weak">
                            {submenu.description}
                        </span>
                    {/if}
                </span>
                <ChevronRight
                    aria-hidden="true"
                    class={[
                        "shrink-0 text-weak t-rotate-200-cubic-out",
                        (branchDirection?.side ??
                            submenuBranches[key]?.side ??
                            defaultSubmenuSide) === "left" && "rotate-180",
                    ]}
                />
            </button>

            {#if openSubmenuId === key}
                <Popover
                    open
                    triggerElement={itemElements[key]}
                    anchor={itemElements[key]}
                    placement={(branchDirection?.side ??
                        submenuBranches[key]?.side ??
                        defaultSubmenuSide) === "left"
                        ? "left-start"
                        : "right-start"}
                    offset={4}
                    flip={depth === 0}
                    {direction}
                    modal={false}
                    dismiss={{
                        outsidePointer: true,
                        escape: true,
                        focusOutside: true,
                        anchorDetached: true,
                    }}
                    initialFocus={childFocusIntent ? resolveSubmenuFocus : false}
                    restoreFocus="auto"
                    role="menu"
                    animation="default"
                    id={submenuContentId}
                    aria-label={submenu.label}
                    class={contentClassName}
                    onDismiss={handleSubmenuDismiss}
                    onPositionChange={(result) => captureSubmenuSide(key, result.side)}
                    onOpenChange={(nextOpen) => {
                        if (!nextOpen) closeSubmenu(key);
                    }}
                >
                    <DropdownLevel
                        items={submenu.items}
                        {size}
                        {direction}
                        {loop}
                        {closeOnAction}
                        {hoverOpenDelay}
                        {hoverCloseDelay}
                        {emptyText}
                        focusIntent={childFocusIntent}
                        depth={depth + 1}
                        path={[...path, submenu.id]}
                        {closeRoot}
                        closeLevel={() => {
                            closeSubmenu(key);
                            focusItem(key);
                        }}
                        onPointerEnterLevel={keepBranchOpen}
                        onPointerLeaveLevel={() => closeSubmenu(key, true)}
                        branchDirection={branchDirection ?? submenuBranches[key]}
                    />
                </Popover>
            {/if}
        {:else}
            {const action = entry as DropdownAction}
            {const labelId = `${instanceId}-${key}-label`}
            {const descriptionId = `${instanceId}-${key}-description`}
            <button
                type="button"
                role="menuitem"
                tabindex="-1"
                data-dropdown-item
                data-dropdown-key={key}
                data-dropdown-label={action.label}
                aria-labelledby={labelId}
                aria-describedby={action.description ? descriptionId : undefined}
                class={dropdownItemStyles({
                    size,
                    described: Boolean(action.description),
                })}
                onclick={(event) => handleAction(action, event)}
                onfocus={() => {
                    if (openSubmenuId) openSubmenuId = null;
                }}
                onpointermove={handlePointerMove}
                {@attach captureItem(key)}
                {@attach disableInteraction({ enabled: action.disabled === true })}
            >
                {#if action.icon}
                    {const ItemIcon = action.icon}
                    <ItemIcon
                        aria-hidden="true"
                        class={["shrink-0", action.danger ? "text-danger-500" : "text-weak"]}
                    />
                {/if}
                <span class="flex min-w-0 flex-1 flex-col">
                    <span
                        id={labelId}
                        class={[
                            "truncate font-500 leading-normal",
                            action.danger ? "text-danger-500" : "text-strong",
                        ]}
                    >
                        {action.label}
                    </span>
                    {#if action.description}
                        <span
                            id={descriptionId}
                            class="truncate text-xs font-400 leading-normal text-weak"
                        >
                            {action.description}
                        </span>
                    {/if}
                </span>
                {#if action.shortcut}
                    <Kbd combo={action.shortcut} {size} variant="ghost" aria-hidden="true" />
                {/if}
            </button>
        {/if}
    {/each}
{/snippet}

<div
    bind:this={menuElement}
    role="presentation"
    data-dropdown-depth={depth}
    data-dropdown-branch-side={branchDirection?.side}
    onkeydown={handleKeyDown}
    onpointerenter={keepBranchOpen}
    onpointerleave={onPointerLeaveLevel}
    {@attach rovingAttachment}
>
    {#if items.length === 0}
        <div class="px-10px py-8px text-sm text-weak select-none">{emptyText}</div>
    {:else}
        {@render renderEntries(items, `level-${depth}`)}
    {/if}
</div>
