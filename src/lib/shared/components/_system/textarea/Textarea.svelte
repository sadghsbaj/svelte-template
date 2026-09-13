<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLTextareaAttributes } from "svelte/elements";
    import {
        autoResize as autoResizeAttach,
        disableInteraction,
        type AutoResizeOptions,
    } from "$attachments";
    import { uuid } from "$utils";

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
            invalid?: boolean;
            disabled?: boolean;
            focusRing?: boolean;
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
        variant = "soft",
        size = "md",
        invalid = false,
        disabled = false,
        focusRing = true,
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

    const effectiveRows = $derived(
        typeof autoResize === "object" && autoResize.minRows !== undefined
            ? autoResize.minRows
            : rows
    );

    const hasFooter = $derived(Boolean(footer || showCount || maxlength !== undefined));

    const containerComputedClass = $derived(
        textareaContainerStyles({
            variant,
            invalid,
            class: className,
        })
    );

    const textareaComputedClass = $derived(
        textareaElementStyles({
            size,
            invalid,
            hasFooter,
            hasIconLeft: Boolean(iconLeft),
            hasIconRight: Boolean(iconRight),
            class: textareaClass,
        })
    );

    const iconLeftClass = $derived(
        textareaIconStyles({
            size,
            position: "left",
            invalid,
        })
    );

    const iconRightClass = $derived(
        textareaIconStyles({
            size,
            position: "right",
            invalid,
        })
    );

    const footerComputedClass = $derived(
        textareaFooterStyles({
            size,
        })
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

    function parsePixels(value: string | undefined): number {
        if (!value) return 0;
        const match = /^[-+]?\d*\.?\d+/.exec(value);
        if (!match) return 0;
        const num = Number(match[0]);
        return Number.isFinite(num) ? num : 0;
    }

    function getComputedLineHeight(el: HTMLTextAreaElement, computed: CSSStyleDeclaration): number {
        const raw = computed.lineHeight;
        if (raw && raw !== "normal") {
            const parsed = parsePixels(raw);
            if (parsed > 0) return parsed;
        }
        const fontSize = parsePixels(computed.fontSize);
        return (fontSize > 0 ? fontSize : 14) * 1.35;
    }

    function getClickLine(el: HTMLTextAreaElement, clientY: number): number {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const pt = parsePixels(computed.paddingTop);
        const lh = getComputedLineHeight(el, computed);
        const relY = clientY - rect.top - pt + el.scrollTop;
        return Math.max(0, Math.floor(relY / lh));
    }

    function getLineRange(
        el: HTMLTextAreaElement,
        targetLine: number
    ): { start: number; end: number } {
        const text = el.value ?? "";
        if (!text) {
            return { start: 0, end: 0 };
        }

        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const pl = parsePixels(computed.paddingLeft);
        const pr = parsePixels(computed.paddingRight);
        const rawWidth = el.clientWidth > 0 ? el.clientWidth : rect.width;
        const contentWidth = Math.max(0, rawWidth - pl - pr);

        const mirror = document.createElement("div");
        mirror.style.position = "absolute";
        mirror.style.visibility = "hidden";
        mirror.style.pointerEvents = "none";
        mirror.style.top = "-9999px";
        mirror.style.left = "-9999px";
        mirror.style.width = `${contentWidth}px`;
        mirror.style.font = computed.font;
        mirror.style.fontSize = computed.fontSize;
        mirror.style.fontFamily = computed.fontFamily;
        mirror.style.fontWeight = computed.fontWeight;
        mirror.style.letterSpacing = computed.letterSpacing;
        mirror.style.lineHeight = computed.lineHeight;
        mirror.style.whiteSpace = "pre-wrap";
        mirror.style.wordBreak = computed.wordBreak;
        mirror.style.overflowWrap = computed.overflowWrap;
        mirror.style.boxSizing = "border-box";

        const textNode = document.createTextNode(text);
        mirror.append(textNode);
        document.body.append(mirror);

        const mirrorRect = mirror.getBoundingClientRect();
        const range = document.createRange();

        // Measure actual rendered line height in the mirror container
        const tSpan = document.createElement("div");
        tSpan.innerHTML = "<span>A</span><br><span>B</span>";
        mirror.append(tSpan);
        const first = tSpan.firstElementChild as HTMLElement | null;
        const last = tSpan.lastElementChild as HTMLElement | null;
        const measuredLh =
            first && last && last.offsetTop > first.offsetTop
                ? last.offsetTop - first.offsetTop
                : getComputedLineHeight(el, computed);
        tSpan.remove();

        function getLineOfChar(offset: number): number {
            range.setStart(textNode, offset);
            range.setEnd(textNode, Math.min(offset + 1, text.length));
            const r = range.getBoundingClientRect();
            return Math.floor((r.top - mirrorRect.top) / measuredLh);
        }

        function findStartOfLine(lineIdx: number): number {
            let low = 0;
            let high = text.length - 1;
            let result = text.length;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (getLineOfChar(mid) >= lineIdx) {
                    result = mid;
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }
            return result;
        }

        function findEndOfLine(lineIdx: number): number {
            let low = 0;
            let high = text.length - 1;
            let result = 0;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (getLineOfChar(mid) <= lineIdx) {
                    result = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
            if (text[result] === "\n") {
                return result;
            }
            let endPos = result + 1;
            if (endPos < text.length && text[endPos - 1] === " ") {
                while (endPos > 0 && text[endPos - 1] === " ") {
                    endPos--;
                }
            }
            return endPos;
        }

        const start = findStartOfLine(targetLine);
        const end = Math.max(start, findEndOfLine(targetLine));
        mirror.remove();

        return { start, end };
    }

    function handleContainerMouseDown(event: MouseEvent): void {
        if (disabled || typeof document === "undefined") return;
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button'], input")) {
            return;
        }
        if (!element) return;

        const rect = element.getBoundingClientRect();

        // 1. Click above textarea
        if (event.clientY < rect.top) {
            event.preventDefault();
            element.focus();
            element.setSelectionRange(0, 0);
            return;
        }

        // 2. Click below textarea
        if (event.clientY > rect.bottom) {
            event.preventDefault();
            element.focus();
            const len = element.value.length;
            element.setSelectionRange(len, len);
            return;
        }

        const computed = window.getComputedStyle(element);
        const pl = parsePixels(computed.paddingLeft);
        const pr = parsePixels(computed.paddingRight);

        const inRightPadding = event.clientX > rect.right - pr;
        const inLeftPadding = event.clientX < rect.left + pl;

        if (inRightPadding || inLeftPadding || target !== element) {
            event.preventDefault();
            element.focus();

            const clickLine = getClickLine(element, event.clientY);
            const { start, end } = getLineRange(element, clickLine);

            if (inLeftPadding) {
                element.setSelectionRange(start, start);
            } else {
                element.setSelectionRange(end, end);
            }
        }
    }

    function handleContainerClick(event: MouseEvent): void {
        if (disabled || typeof document === "undefined") return;
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button'], input")) {
            return;
        }
        if (!element) return;

        if (
            element.selectionStart !== null &&
            element.selectionEnd !== null &&
            element.selectionStart !== element.selectionEnd
        ) {
            return;
        }

        const rect = element.getBoundingClientRect();

        // 1. Click above textarea
        if (event.clientY < rect.top) {
            element.focus();
            element.setSelectionRange(0, 0);
            return;
        }

        // 2. Click below textarea
        if (event.clientY > rect.bottom) {
            element.focus();
            const len = element.value.length;
            element.setSelectionRange(len, len);
            return;
        }

        const computed = window.getComputedStyle(element);
        const pl = parsePixels(computed.paddingLeft);
        const pr = parsePixels(computed.paddingRight);

        const inRightPadding = event.clientX > rect.right - pr;
        const inLeftPadding = event.clientX < rect.left + pl;

        const clickLine = getClickLine(element, event.clientY);
        const { start, end } = getLineRange(element, clickLine);

        if (inLeftPadding) {
            element.setSelectionRange(start, start);
            return;
        }

        if (inRightPadding) {
            element.setSelectionRange(end, end);
            return;
        }

        const curPos = element.selectionStart ?? 0;
        if (curPos > end) {
            element.setSelectionRange(end, end);
        }
    }

    function handleFooterClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button'], input")) {
            return;
        }
        if (!element) return;
        element.focus();
        const len = element.value.length;
        element.setSelectionRange(len, len);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    id={containerId}
    role="group"
    class={containerComputedClass}
    {@attach disableInteraction({ enabled: disabled })}
    onmousedown={handleContainerMouseDown}
    onclick={handleContainerClick}
>
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
        rows={effectiveRows}
        maxlength={maxlength}
        aria-invalid={invalid ? "true" : undefined}
        class={textareaComputedClass}
        style={textareaComputedStyle}
        {@attach focusAttach({
            focusTarget: `#${containerId}`,
            color: focusColor,
            enabled: focusRing,
        })}
        {@attach resolvedAutoResize}
    ></textarea>

    {#if iconRight}
        <span class="{iconRightClass} [&>svg]:size-full [&>svg]:stroke-[2.25px]">
            {@render iconRight()}
        </span>
    {/if}

    {#if footer}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class={footerComputedClass} onclick={handleFooterClick}>
            {@render footer()}
        </div>
    {:else if showCount || maxlength !== undefined}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class={footerComputedClass} onclick={handleFooterClick}>
            <span class="text-xs font-500 text-weak ml-auto tabular-nums">
                {value?.length ?? 0}{maxlength !== undefined ? ` / ${maxlength}` : ""}
            </span>
        </div>
    {/if}
</div>
