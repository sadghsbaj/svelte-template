<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";
    import { uuid } from "$utils";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import {
        textInputContainerStyles,
        textInputIconStyles,
        textInputInputStyles,
        type TextInputStyleProps,
    } from "./text-input.styles";

    type Props = TextInputStyleProps &
        Omit<HTMLInputAttributes, "class" | "disabled" | "size"> & {
            value?: string;
            invalid?: boolean;
            disabled?: boolean;
            focusRing?: boolean;
            iconLeft?: Snippet;
            iconRight?: Snippet;
            class?: string;
            inputClass?: string;
            element?: HTMLInputElement;
            containerElement?: HTMLDivElement;
        };

    let {
        value = $bindable(""),
        variant = "soft",
        size = "md",
        invalid = false,
        disabled = false,
        focusRing = true,
        iconLeft,
        iconRight,
        id,
        class: className = "",
        inputClass = "",
        element = $bindable(),
        containerElement = $bindable(),
        type = "text",
        placeholder = "",
        ...restProps
    }: Props = $props();

    const defaultId = `text-input-${uuid()}`;
    const inputId = $derived(id ?? defaultId);
    const containerId = $derived(`${inputId}-container`);

    const containerClass = $derived(
        textInputContainerStyles({
            variant,
            size,
            invalid,
            class: className,
        })
    );

    const inputComputedClass = $derived(
        textInputInputStyles({
            size,
            invalid,
            class: inputClass,
        })
    );

    const iconLeftClass = $derived(
        textInputIconStyles({
            size,
            invalid,
        })
    );

    const focusColor = $derived(invalid ? "var(--color-danger-500)" : undefined);

    function getCaretOffsetFromPoint(x: number, y: number): number | null {
        if (typeof document === "undefined") return null;

        // W3C standard (Chromium 129+, Gecko/Firefox)
        if (typeof document.caretPositionFromPoint === "function") {
            const pos = document.caretPositionFromPoint(x, y);
            if (pos && typeof pos.offset === "number") {
                return pos.offset;
            }
        }

        // WebKit legacy fallback (Safari)
        const doc = document as unknown as {
            caretRangeFromPoint?: (x: number, y: number) => Range | null;
        };
        if (typeof doc.caretRangeFromPoint === "function") {
            const range = doc.caretRangeFromPoint(x, y);
            if (range && typeof range.startOffset === "number") {
                return range.startOffset;
            }
        }

        return null;
    }

    function handleContainerMouseDown(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button']")) {
            return;
        }

        if (!element) return;

        // If the user clicked directly inside <input>, let the browser's native caret handler run
        if (target === element) {
            return;
        }

        // User clicked in the container (top/bottom area, padding, icon, gap).
        // Prevent default so the browser never sets the caret to 0 on mousedown!
        event.preventDefault();

        element.focus();
        const rect = element.getBoundingClientRect();

        // 1. Click left of the input (left padding, left icon, left gap)
        if (event.clientX < rect.left) {
            element.setSelectionRange(0, 0);
            return;
        }

        const len = element.value.length;

        // 2. Click right of the input (right padding, trailing icon, right gap)
        if (event.clientX > rect.right) {
            element.setSelectionRange(len, len);
            return;
        }

        // 3. Click above or below the text:
        const centerY = rect.top + rect.height / 2;
        const offset = getCaretOffsetFromPoint(event.clientX, centerY);
        if (offset !== null) {
            element.setSelectionRange(offset, offset);
            return;
        }

        element.setSelectionRange(len, len);
    }

    function handleContainerClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button']")) {
            return;
        }

        if (!element) return;

        // Preserve active drag-selection if user selected a range
        if (
            element.selectionStart !== null &&
            element.selectionEnd !== null &&
            element.selectionStart !== element.selectionEnd
        ) {
            return;
        }

        // If clicked on the input itself, native caret placement already finished
        if (target === element) {
            return;
        }

        const rect = element.getBoundingClientRect();
        element.focus();

        // 1. Click left of the input (left padding, left icon, left gap)
        if (event.clientX < rect.left) {
            element.setSelectionRange(0, 0);
            return;
        }

        const len = element.value.length;

        // 2. Click right of the input (right padding, trailing icon, right gap)
        if (event.clientX > rect.right) {
            element.setSelectionRange(len, len);
            return;
        }

        // 3. Click within horizontal boundaries of the input:
        const centerY = rect.top + rect.height / 2;
        const offset = getCaretOffsetFromPoint(event.clientX, centerY);
        if (offset !== null) {
            element.setSelectionRange(offset, offset);
            return;
        }

        element.setSelectionRange(len, len);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    bind:this={containerElement}
    id={containerId}
    role="group"
    class={containerClass}
    onmousedown={handleContainerMouseDown}
    onclick={handleContainerClick}
    {@attach disableInteraction({ enabled: disabled })}
>
    {#if iconLeft}
        <span class="{iconLeftClass} [&>svg]:size-full [&>svg]:stroke-[2.25px]">
            {@render iconLeft()}
        </span>
    {/if}

    <input
        {...restProps}
        bind:this={element}
        bind:value
        id={inputId}
        {type}
        {placeholder}
        {disabled}
        aria-invalid={invalid ? "true" : undefined}
        class={inputComputedClass}
        {@attach focusAttach({
            focusTarget: `#${containerId}`,
            color: focusColor,
            enabled: focusRing,
        })}
    />

    {#if iconRight}
        <span
            class="shrink-0 flex-center {invalid
                ? 'text-danger-solid-1'
                : 'text-weak'} [&>svg]:pointer-events-none"
        >
            {@render iconRight()}
        </span>
    {/if}
</div>
