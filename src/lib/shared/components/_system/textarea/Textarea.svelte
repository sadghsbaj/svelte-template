<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLTextareaAttributes } from "svelte/elements";
    import {
        autoResize as autoResizeAttach,
        disableInteraction,
        type AutoResizeOptions,
    } from "$attachments";
    import { cn, uuid } from "$utils";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import {
        textareaContainerStyles,
        textareaElementStyles,
        textareaFooterStyles,
        textareaIconStyles,
        type TextareaStyleProps,
    } from "./textarea.styles";

    export type TextareaAutoResizeOption =
        | boolean
        | (Omit<AutoResizeOptions, "axis"> & {
              axis?: "vertical" | "both";
          });

    type Props = TextareaStyleProps &
        Omit<HTMLTextareaAttributes, "class" | "disabled" | "size"> & {
            value?: string;
            label?: string;
            invalid?: boolean;
            disabled?: boolean;
            rows?: number;
            autoResize?: TextareaAutoResizeOption;
            resize?: "none" | "vertical" | "horizontal" | "both";
            showCount?: boolean;
            maxlength?: number;
            iconLeft?: Snippet;
            iconRight?: Snippet;
            footer?: Snippet;
            class?: string;
            textareaClass?: string;
            element?: HTMLTextAreaElement;
        };

    let {
        value = $bindable(""),
        label,
        variant = "soft",
        size = "md",
        invalid = false,
        disabled = false,
        rows = 3,
        autoResize = false,
        resize = "none",
        showCount = false,
        maxlength,
        iconLeft,
        iconRight,
        footer,
        id,
        class: className = "",
        textareaClass = "",
        element = $bindable(),
        placeholder = "",
        ...restProps
    }: Props = $props();

    const defaultId = `textarea-${uuid()}`;
    const textareaId = $derived(id ?? defaultId);
    const containerId = $derived(`${textareaId}-container`);

    const containerComputedClass = $derived(
        textareaContainerStyles({
            variant,
            size,
            invalid,
            class: className,
        })
    );

    const textareaComputedClass = $derived(
        textareaElementStyles({
            size,
            invalid,
            class: textareaClass,
        })
    );

    const iconLeftClass = $derived(
        textareaIconStyles({
            size,
            invalid,
        })
    );

    const footerComputedClass = $derived(
        textareaFooterStyles({
            size,
        })
    );

    const bodyClass = $derived(
        cn(
            "flex items-start w-full min-w-0",
            size === "sm" ? "gap-2" : size === "lg" ? "gap-3" : "gap-2.5"
        )
    );

    const focusColor = $derived(invalid ? "var(--color-danger-500)" : undefined);

    const resolvedAutoResize = $derived.by(() => {
        if (!autoResize) {
            return autoResizeAttach(false);
        }
        if (typeof autoResize === "object") {
            return autoResizeAttach({
                axis: autoResize.axis ?? "vertical",
                minRows: autoResize.minRows ?? rows,
                maxRows: autoResize.maxRows,
                minHeight: autoResize.minHeight,
                maxHeight: autoResize.maxHeight,
            });
        }
        return autoResizeAttach({
            axis: "vertical",
            minRows: rows,
        });
    });

    const textareaComputedStyle = $derived(
        [
            resize && !autoResize ? `resize: ${resize};` : "resize: none;",
            restProps.style,
        ]
            .filter(Boolean)
            .join(" ")
    );

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
        if (target?.closest("button, a, [role='button'], input")) {
            return;
        }

        if (!element) return;

        // Direct click inside <textarea>: native browser caret placement
        if (target === element) {
            return;
        }

        // Container padding, gap, icon, or footer empty space clicked.
        // Prevent default so browser never flashes caret to 0 on mousedown!
        event.preventDefault();

        element.focus();
        const rect = element.getBoundingClientRect();

        // 1. Click above the textarea element (top padding / top icon area above line 1)
        if (event.clientY < rect.top) {
            element.setSelectionRange(0, 0);
            return;
        }

        const len = element.value.length;

        // 2. Click below the textarea element (footer area or bottom padding)
        if (event.clientY > rect.bottom) {
            element.setSelectionRange(len, len);
            return;
        }

        // 3. Click left of the textarea (left icon, left padding)
        if (event.clientX < rect.left) {
            const offset = getCaretOffsetFromPoint(rect.left + 2, event.clientY);
            if (offset !== null) {
                element.setSelectionRange(offset, offset);
                return;
            }
            element.setSelectionRange(0, 0);
            return;
        }

        // 4. Click right of the textarea (right icon, right padding)
        if (event.clientX > rect.right) {
            const offset = getCaretOffsetFromPoint(rect.right - 2, event.clientY);
            if (offset !== null) {
                element.setSelectionRange(offset, offset);
                return;
            }
            element.setSelectionRange(len, len);
            return;
        }

        // 5. Fallback within boundaries
        const offset = getCaretOffsetFromPoint(event.clientX, event.clientY);
        if (offset !== null) {
            element.setSelectionRange(offset, offset);
            return;
        }

        element.setSelectionRange(len, len);
    }

    function handleContainerClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button'], input")) {
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

        if (target === element) {
            return;
        }

        const rect = element.getBoundingClientRect();
        element.focus();

        if (event.clientY < rect.top) {
            element.setSelectionRange(0, 0);
            return;
        }

        const len = element.value.length;

        if (event.clientY > rect.bottom) {
            element.setSelectionRange(len, len);
            return;
        }

        if (event.clientX < rect.left) {
            const offset = getCaretOffsetFromPoint(rect.left + 2, event.clientY);
            if (offset !== null) {
                element.setSelectionRange(offset, offset);
                return;
            }
            element.setSelectionRange(0, 0);
            return;
        }

        if (event.clientX > rect.right) {
            const offset = getCaretOffsetFromPoint(rect.right - 2, event.clientY);
            if (offset !== null) {
                element.setSelectionRange(offset, offset);
                return;
            }
            element.setSelectionRange(len, len);
            return;
        }

        const offset = getCaretOffsetFromPoint(event.clientX, event.clientY);
        if (offset !== null) {
            element.setSelectionRange(offset, offset);
            return;
        }

        element.setSelectionRange(len, len);
    }
</script>

{#snippet field()}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        id={containerId}
        role="group"
        class={containerComputedClass}
        onmousedown={handleContainerMouseDown}
        onclick={handleContainerClick}
        {@attach disableInteraction({ enabled: disabled })}
    >
        <div class={bodyClass}>
            {#if iconLeft}
                <span class="{iconLeftClass} [&>svg]:size-full [&>svg]:stroke-[2.25px]">
                    {@render iconLeft()}
                </span>
            {/if}

            <textarea
                {...restProps}
                bind:this={element}
                bind:value
                id={textareaId}
                {placeholder}
                {disabled}
                {rows}
                maxlength={maxlength}
                aria-invalid={invalid ? "true" : undefined}
                class={textareaComputedClass}
                style={textareaComputedStyle}
                {@attach focusAttach({ focusTarget: `#${containerId}`, color: focusColor })}
                {@attach resolvedAutoResize}
            ></textarea>

            {#if iconRight}
                <span
                    class="shrink-0 flex-center {invalid
                        ? 'text-danger-solid-1'
                        : 'text-weak'} [&>svg]:pointer-events-none {size === 'lg' ? 'mt-3px' : 'mt-2px'}"
                >
                    {@render iconRight()}
                </span>
            {/if}
        </div>

        {#if footer}
            <div class={footerComputedClass}>
                {@render footer()}
            </div>
        {:else if showCount || maxlength !== undefined}
            <div class={footerComputedClass}>
                <span class="text-xs font-500 text-weak ml-auto tabular-nums">
                    {value?.length ?? 0}{maxlength !== undefined ? ` / ${maxlength}` : ""}
                </span>
            </div>
        {/if}
    </div>
{/snippet}

{#if label}
    <div class="flex flex-col gap-1.5 w-full">
        <label for={textareaId} class="text-xs font-600 text-weak select-none">
            {label}
        </label>
        {@render field()}
    </div>
{:else}
    {@render field()}
{/if}
