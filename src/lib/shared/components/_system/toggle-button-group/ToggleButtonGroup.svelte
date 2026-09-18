<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Attachment } from "svelte/attachments";
    import type { HTMLAttributes } from "svelte/elements";
    import { rovingFocus as attachRovingFocus } from "$attachments";

    import { setToggleButtonGroupContext } from "./toggle-button-group.context";
    import { toggleButtonGroupStyles } from "./toggle-button-group.styles";

    export type ToggleButtonGroupOrientation = "horizontal" | "vertical";
    export type ToggleButtonGroupType = "single" | "multiple";
    export type ToggleButtonGroupValue = string | string[] | undefined;

    interface SharedToggleButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
        orientation?: ToggleButtonGroupOrientation;
        separators?: boolean;
        fullWidth?: boolean;
        rovingFocus?: boolean;
        loop?: boolean;
        children?: Snippet;
        class?: string;
        element?: HTMLDivElement | null;
    }

    export type ToggleButtonGroupProps = SharedToggleButtonGroupProps &
        ({ type: "single"; value?: string } | { type: "multiple"; value?: string[] });

    let {
        type,
        value = $bindable(),
        orientation = "horizontal",
        separators = false,
        fullWidth = false,
        rovingFocus = true,
        loop = true,
        role = "group",
        children,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: ToggleButtonGroupProps = $props();

    const computedClass = $derived(
        toggleButtonGroupStyles({
            orientation,
            fullWidth,
            class: className,
        })
    );

    function isPressed(itemValue: string): boolean {
        return type === "multiple"
            ? Array.isArray(value) && value.includes(itemValue)
            : value === itemValue;
    }

    function toggle(itemValue: string): void {
        if (type === "multiple") {
            const current = Array.isArray(value) ? value : [];
            value = current.includes(itemValue)
                ? current.filter((entry) => entry !== itemValue)
                : [...current, itemValue];
            return;
        }

        value = value === itemValue ? undefined : itemValue;
    }

    setToggleButtonGroupContext({ isPressed, toggle });

    const noRovingFocus: Attachment<HTMLDivElement> = () => {};
    const focusAttachment = $derived(
        rovingFocus
            ? attachRovingFocus<HTMLDivElement>({
                  selector: ':scope > [data-slot="toggle-button"]',
                  orientation,
                  loop,
                  initialItem: (_container, items) =>
                      items.find((item) => item.getAttribute("aria-pressed") === "true") ?? null,
              })
            : noRovingFocus
    );
</script>

<div
    bind:this={element}
    {...restProps}
    {role}
    data-slot="toggle-button-group"
    data-orientation={orientation}
    data-separators={separators ? "" : undefined}
    data-full-width={fullWidth ? "" : undefined}
    data-roving-focus={rovingFocus ? "" : undefined}
    class={computedClass}
    {@attach focusAttachment}
>
    {@render children?.()}
</div>

<style>
    :global([data-slot="toggle-button-group"] > [data-slot="toggle-button"]) {
        --squircle-shape: var(--squircle-smooth);

        isolation: auto !important;

        position: relative;
        border-radius: 0 !important;
        transform: none !important;
        backface-visibility: visible !important;
        will-change: auto !important;
    }

    :global([data-slot="toggle-button-group"] > [data-slot="toggle-button"]:active) {
        scale: 1 !important;
    }

    :global([data-slot="toggle-button-group"] > [data-slot="toggle-button"]:hover) {
        z-index: 1;
    }

    :global([data-slot="toggle-button-group"] > [data-slot="toggle-button"]:focus-visible) {
        z-index: 2;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="horizontal"][data-full-width]
            > [data-slot="toggle-button"]
    ) {
        flex: 1 1 0% !important;
        width: 0 !important;
        min-width: 0;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="horizontal"][data-separators]
            > [data-slot="toggle-button"]
            + [data-slot="toggle-button"]::before
    ) {
        content: "";
        position: absolute;
        inset-block-start: 25%;
        inset-inline-start: 0;
        width: 1px;
        height: 50%;
        background: light-dark(rgb(0 0 0 / 10%), rgb(255 255 255 / 12%));
        border-radius: 9999px;
        translate: -50% 0;
        pointer-events: none;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="horizontal"]
            > [data-slot="toggle-button"]:first-child
    ) {
        border-start-start-radius: 9999px !important;
        border-end-start-radius: 9999px !important;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="horizontal"]
            > [data-slot="toggle-button"]:last-child
    ) {
        border-start-end-radius: 9999px !important;
        border-end-end-radius: 9999px !important;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="vertical"] > [data-slot="toggle-button"]
    ) {
        width: 100% !important;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="vertical"][data-separators]
            > [data-slot="toggle-button"]
            + [data-slot="toggle-button"]::before
    ) {
        content: "";
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 25%;
        width: 50%;
        height: 1px;
        background: light-dark(rgb(0 0 0 / 10%), rgb(255 255 255 / 12%));
        border-radius: 9999px;
        translate: 0 -50%;
        pointer-events: none;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="vertical"]
            > [data-slot="toggle-button"]:first-child
    ) {
        border-start-start-radius: 9999px !important;
        border-start-end-radius: 9999px !important;
    }

    :global(
        [data-slot="toggle-button-group"][data-orientation="vertical"]
            > [data-slot="toggle-button"]:last-child
    ) {
        border-end-start-radius: 9999px !important;
        border-end-end-radius: 9999px !important;
    }
</style>
