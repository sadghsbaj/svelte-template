<script lang="ts">
    import type { Attachment } from "svelte/attachments";

    import Popover from "$components/_system/popover/Popover.svelte";
    import type { PopoverTriggerContext } from "$components/_system/popover/popover.types";

    import { dropdownContentStyles } from "./dropdown.styles";
    import type { DropdownProps, DropdownTriggerContext } from "./dropdown.types";
    import DropdownLevel from "./DropdownLevel.svelte";

    let {
        items,
        open = $bindable(false),
        disabled = false,
        size = "md",
        placement = "bottom-start",
        direction = "auto",
        loop = true,
        closeOnAction = true,
        hoverOpenDelay = 120,
        hoverCloseDelay = 260,
        emptyText = "No actions available",
        contentClass = "",
        "aria-label": ariaLabel = "Actions",
        onOpenChange,
        trigger: triggerSnippet,
    }: DropdownProps = $props();

    let focusIntent = $state<"first" | "last" | null>(null);
    let contentElement = $state<HTMLDivElement>();
    const contentClassName = $derived(dropdownContentStyles({ class: contentClass }));

    const closeRoot = (): void => {
        open = false;
    };

    const resolveInitialFocus = (content: HTMLElement): HTMLElement | null => {
        const availableItems = [
            ...content.querySelectorAll<HTMLElement>("[data-dropdown-item]"),
        ].filter((item) => item.ariaDisabled !== "true");
        return focusIntent === "last"
            ? (availableItems.at(-1) ?? null)
            : (availableItems.at(0) ?? null);
    };

    const focusMenuItem = (intent: "first" | "last"): void => {
        const content = contentElement;
        if (!content) return;
        const availableItems = [
            ...content.querySelectorAll<HTMLElement>("[data-dropdown-item]"),
        ].filter((item) => item.ariaDisabled !== "true");
        const target = intent === "last" ? availableItems.at(-1) : availableItems.at(0);
        target?.focus({ preventScroll: true, focusVisible: true });
    };

    const handleTriggerPointerDown = (): void => {
        focusIntent = null;
    };

    const handleTriggerClick = (event: MouseEvent): void => {
        if (event.detail === 0) focusIntent = "first";
    };

    const enhanceTrigger = (context: PopoverTriggerContext): DropdownTriggerContext => {
        const attachment: Attachment<HTMLElement> = (element) => {
            const cleanupPopover = context.attachment(element);
            const handleKeyDown = (event: KeyboardEvent): void => {
                if (event.defaultPrevented || disabled) return;
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    focusIntent = event.key === "ArrowDown" ? "first" : "last";
                    if (context.open) focusMenuItem(focusIntent);
                    else context.openPopover("trigger", event);
                } else if (["Enter", " ", "Spacebar"].includes(event.key)) {
                    focusIntent = "first";
                }
            };
            element.addEventListener("pointerdown", handleTriggerPointerDown);
            element.addEventListener("keydown", handleKeyDown);
            element.addEventListener("click", handleTriggerClick);
            return () => {
                cleanupPopover?.();
                element.removeEventListener("pointerdown", handleTriggerPointerDown);
                element.removeEventListener("keydown", handleKeyDown);
                element.removeEventListener("click", handleTriggerClick);
            };
        };
        return { ...context, attachment };
    };
</script>

<Popover
    bind:open
    {disabled}
    {placement}
    offset={6}
    {direction}
    modal={false}
    dismiss={{ outsidePointer: true, escape: true, focusOutside: true, anchorDetached: true }}
    initialFocus={focusIntent ? resolveInitialFocus : false}
    restoreFocus="auto"
    role="menu"
    animation="default"
    bind:element={contentElement}
    aria-label={ariaLabel}
    class={contentClassName}
    onOpenChange={(nextOpen, detail) => {
        if (!nextOpen) focusIntent = null;
        onOpenChange?.(nextOpen, detail);
    }}
>
    {#snippet trigger(popoverContext)}
        {@render triggerSnippet?.(enhanceTrigger(popoverContext))}
    {/snippet}

    <DropdownLevel
        {items}
        {size}
        {direction}
        {loop}
        {closeOnAction}
        {hoverOpenDelay}
        {hoverCloseDelay}
        {emptyText}
        {focusIntent}
        depth={0}
        path={[]}
        {closeRoot}
    />
</Popover>
