<script lang="ts">
    import { onDestroy } from "svelte";
    import type { Attachment } from "svelte/attachments";
    import { ChevronRight } from "@lucide/svelte";
    import { disableInteraction, rovingFocus } from "$attachments";

    import { focusAttach } from "$core/_system/focus/focus.attach";

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
        drilldown?: boolean;
        onDrilldownDepthChange?: (depth: number) => void;
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
        drilldown = false,
        onDrilldownDepthChange,
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
    let drilldownStack = $state<{ submenu: DropdownSubmenu; parentKey: string }[]>([]);

    const contentClassName = dropdownContentStyles();
    const logicalSubmenuSide = $derived<"left" | "right">(isRtl ? "left" : "right");
    const defaultSubmenuSide = $derived(branchDirection?.side ?? logicalSubmenuSide);
    const requestedSubmenuSide = $derived(depth === 0 ? logicalSubmenuSide : defaultSubmenuSide);
    const currentItems = $derived(drilldownStack.at(-1)?.submenu.items ?? items);
    const currentPath = $derived([...path, ...drilldownStack.map((entry) => entry.submenu.id)]);
    const currentPrefix = $derived(
        drilldownStack.length === 0
            ? `level-${depth}`
            : `drill-${drilldownStack.map((entry) => entry.submenu.id).join("-")}`
    );
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

    const findSubmenu = (
        entries: readonly DropdownEntry[],
        id: string | undefined
    ): DropdownSubmenu | undefined => {
        if (!id) return undefined;
        for (const entry of entries) {
            if (entry.type === "submenu" && entry.id === id) return entry;
            if (entry.type === "section") {
                const nested = findSubmenu(entry.items, id);
                if (nested) return nested;
            }
        }
        return undefined;
    };

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

    const focusDrilldownItem = (
        intent: "first" | "last",
        parentKey?: string,
        focusVisible = true
    ): void => {
        queueMicrotask(() => {
            if (parentKey && itemElements[parentKey]) {
                itemElements[parentKey]?.focus({ preventScroll: true, focusVisible });
                return;
            }
            const availableItems = [
                ...(menuElement?.querySelectorAll<HTMLElement>(
                    "[data-dropdown-item]:not([data-dropdown-back])"
                ) ?? []),
            ].filter((item) => item.ariaDisabled !== "true");
            const target = intent === "last" ? availableItems.at(-1) : availableItems.at(0);
            target?.focus({ preventScroll: true, focusVisible });
        });
    };

    const enterDrilldown = (
        submenu: DropdownSubmenu,
        parentKey: string,
        intent: "first" | "last" = "first",
        focusVisible = true
    ): void => {
        if (submenu.disabled) return;
        drilldownStack.push({ submenu, parentKey });
        onDrilldownDepthChange?.(drilldownStack.length);
        focusDrilldownItem(intent, undefined, focusVisible);
    };

    const leaveDrilldown = (focusVisible = true): void => {
        const current = drilldownStack.pop();
        if (!current) return;
        onDrilldownDepthChange?.(drilldownStack.length);
        focusDrilldownItem("first", current.parentKey, focusVisible);
    };

    const activateSubmenu = (
        submenu: DropdownSubmenu,
        key: string,
        intent: "first" | "last" | null = "first",
        focusVisible = true
    ): void => {
        if (drilldown) enterDrilldown(submenu, key, intent ?? "first", focusVisible);
        else openSubmenu(key, intent);
    };

    const handleAction = (item: DropdownAction, event: MouseEvent): void => {
        if (item.disabled) return;
        const shouldClose = item.closeOnAction ?? closeOnAction;
        if (shouldClose) closeRoot();
        queueMicrotask(() => {
            void item.onAction({ item, event, path: currentPath, close: closeRoot });
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

        if (event.key === "Escape" && drilldown && drilldownStack.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            leaveDrilldown();
            return;
        }

        const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
        const backwardKey = isRtl ? "ArrowRight" : "ArrowLeft";
        if (event.key === forwardKey && target.dataset.dropdownSubmenu === "true") {
            event.preventDefault();
            event.stopPropagation();
            const submenu = findSubmenu(currentItems, target.dataset.dropdownId);
            if (submenu) activateSubmenu(submenu, target.dataset.dropdownKey as string, "first");
        } else if (
            event.key === backwardKey &&
            ((drilldown && drilldownStack.length > 0) || (!drilldown && depth > 0))
        ) {
            event.preventDefault();
            event.stopPropagation();
            if (drilldown) leaveDrilldown();
            else closeLevel?.();
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

    $effect(() => {
        if (drilldown || drilldownStack.length === 0) return;
        drilldownStack = [];
        onDrilldownDepthChange?.(0);
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
                data-dropdown-id={submenu.id}
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
                onclick={(event) => activateSubmenu(submenu, key, "first", event.detail === 0)}
                onfocus={() => {
                    if (openSubmenuId && openSubmenuId !== key) openSubmenuId = null;
                }}
                onpointermove={handlePointerMove}
                onpointerenter={(event) => {
                    if (!drilldown && event.pointerType === "mouse" && !submenu.disabled)
                        openSubmenu(key, null, false);
                }}
                onpointerleave={(event) => {
                    if (event.pointerType === "mouse") closeSubmenu(key, true);
                }}
                {@attach captureItem(key)}
                {@attach disableInteraction({ enabled: submenu.disabled === true })}
                {@attach focusAttach({ enabled: false })}
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

            {#if !drilldown && openSubmenuId === key}
                <Popover
                    open
                    triggerElement={itemElements[key]}
                    anchor={itemElements[key]}
                    placement={requestedSubmenuSide === "left" ? "left-start" : "right-start"}
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
                {@attach focusAttach({ enabled: false })}
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
    {#if drilldownStack.length > 0}
        <button
            type="button"
            role="menuitem"
            tabindex="-1"
            data-dropdown-item
            data-dropdown-back
            data-dropdown-label="Back"
            class={dropdownItemStyles({ size })}
            onclick={(event) => leaveDrilldown(event.detail === 0)}
            {@attach focusAttach({ enabled: false })}
        >
            <ChevronRight
                aria-hidden="true"
                class={["shrink-0 text-weak", isRtl ? "" : "rotate-180"]}
            />
            <span class="truncate font-500 leading-normal text-strong">Back</span>
        </button>
        <div class={selectionSectionLabelStyles({ size })}>
            {drilldownStack.at(-1)?.submenu.label}
        </div>
    {/if}
    {#if currentItems.length === 0}
        <div class="px-10px py-8px text-sm text-weak select-none">{emptyText}</div>
    {:else}
        {@render renderEntries(currentItems, currentPrefix)}
    {/if}
</div>
