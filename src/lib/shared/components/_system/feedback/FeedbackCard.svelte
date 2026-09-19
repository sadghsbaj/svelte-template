<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { Check, CircleAlert, Info, TriangleAlert } from "@lucide/svelte";
    import { Button, CloseButton } from "$components";
    import { uuid } from "$utils";

    import {
        feedbackIconStyles,
        feedbackStyles,
        feedbackTitleStyles,
        type FeedbackStyleProps,
    } from "./feedback.styles";
    import type {
        FeedbackAction,
        FeedbackDescription,
        FeedbackIcon,
        FeedbackStatus,
    } from "./feedback.types";

    interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title">, FeedbackStyleProps {
        status?: FeedbackStatus;
        title: string;
        description?: FeedbackDescription;
        icon?: FeedbackIcon;
        leading?: Snippet;
        trailing?: Snippet;
        action?: FeedbackAction;
        dismissible?: boolean;
        closeButton?: boolean;
        closeLabel?: string;
        onDismiss?: () => void;
        onAction?: () => void;
        class?: string;
        element?: HTMLDivElement;
    }

    const defaultIcons: Record<FeedbackStatus, FeedbackIcon> = {
        base: Info,
        accent: Info,
        info: Info,
        success: Check,
        warning: TriangleAlert,
        danger: CircleAlert,
    };

    let {
        kind = "toast",
        status = "base",
        title,
        description,
        icon,
        leading,
        trailing,
        action,
        dismissible = true,
        closeButton = true,
        closeLabel = "Dismiss notification",
        onDismiss,
        onAction,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: Props = $props();

    const contentId = `feedback-content-${uuid()}`;
    const titleId = `${contentId}-title`;
    const descriptionId = `${contentId}-description`;
    const Icon = $derived(icon ?? defaultIcons[status]);
    const hasDescription = $derived(
        (typeof description === "string" && description.length > 0) ||
            (Array.isArray(description) && description.length > 0)
    );
    const hasTrailing = $derived(!!trailing || !!action);
    const hasClose = $derived(dismissible && closeButton && !!onDismiss);
    const computedClass = $derived(
        feedbackStyles({ kind, hasTrailing, hasClose, class: className })
    );
    const trailingClass = $derived.by(() => {
        const base =
            "col-start-3 row-start-1 ml-2px flex h-16px min-h-0 shrink-0 overflow-visible";
        if (!hasDescription) return `${base} items-center self-center`;
        if (kind === "toast") return `${base} row-span-2 items-center self-center`;
        if (action && !trailing) return `${base} items-start self-start`;
        return `${base} translate-y-4px items-start self-start`;
    });
    const closeClass = $derived.by(() => {
        const column = hasTrailing ? "col-start-4" : "col-start-3";
        const base = `${column} row-start-1 ml-1px flex h-16px min-h-0 items-center overflow-visible`;
        if (kind === "notification" && hasDescription) {
            return `${base} self-start translate-x-2px translate-y-4px`;
        }
        return `${base} self-center ${kind === "notification" ? "translate-x-2px" : ""}`;
    });

    function handleAction(): void {
        if (onAction) {
            onAction();
            return;
        }
        if (action) void action.onSelect();
    }
</script>

<div
    bind:this={element}
    {...restProps}
    role="group"
    aria-labelledby={titleId}
    aria-describedby={hasDescription ? descriptionId : undefined}
    data-slot={kind}
    data-status={status}
    class={computedClass}
>
    <span data-slot="feedback-leading" class={feedbackIconStyles({ status })} aria-hidden="true">
        {#if leading}
            {@render leading()}
        {:else}
            <Icon />
        {/if}
    </span>

    <div
        data-slot="feedback-title-row"
        class="col-start-2 row-start-1 flex h-16px min-w-0 items-center self-start"
    >
        <span id={titleId} data-slot="feedback-title" class={feedbackTitleStyles({ status })}>
            {title}
        </span>
    </div>

    {#if typeof description === "string" && description}
        <p
            id={descriptionId}
            data-slot="feedback-description"
            class="description-sm col-start-2 row-start-2 min-w-0 text-weak text-pretty"
        >
            {description}
        </p>
    {:else if Array.isArray(description) && description.length > 0}
        <ul
            id={descriptionId}
            data-slot="feedback-list"
            class="description-sm col-start-2 row-start-2 flex min-w-0 flex-col text-weak"
        >
            {#each description as item, index (`${item}-${index}`)}
                <li class="grid grid-cols-[6px_minmax(0,1fr)] items-start gap-7px">
                    <span
                        aria-hidden="true"
                        data-slot="feedback-list-dot"
                        class="size-4px rounded-full bg-current opacity-45"
                    ></span>
                    <span class="min-w-0 text-pretty">{item}</span>
                </li>
            {/each}
        </ul>
    {/if}

    {#if hasTrailing}
        <div
            data-slot="feedback-trailing"
            class={trailingClass}
        >
            {#if trailing}
                {@render trailing()}
            {:else if action}
                <Button
                    size="sm"
                    variant="ghost"
                    color={status === "danger" ? "danger" : "base"}
                    onclick={handleAction}
                >
                    {action.label}
                </Button>
            {/if}
        </div>
    {/if}

    {#if hasClose}
        <div data-slot="feedback-close" class={closeClass}>
            <CloseButton
                size={kind === "notification" ? "md" : "sm"}
                variant="soft"
                aria-label={closeLabel}
                onclick={onDismiss}
            />
        </div>
    {/if}
</div>

<style>
    :global([data-slot="notification"]),
    :global([data-slot="toast"]) {
        box-shadow:
            0 18px 44px -16px light-dark(rgb(0 0 0 / 20%), rgb(0 0 0 / 42%)),
            0 7px 18px -10px light-dark(rgb(0 0 0 / 13%), rgb(0 0 0 / 28%)),
            0 0 20px light-dark(transparent, rgb(255 255 255 / 2%));
    }

    [data-status="accent"] {
        --feedback-status-color: light-dark(var(--color-accent-600), var(--color-accent-400));
    }

    [data-status="info"] {
        --feedback-status-color: light-dark(var(--color-info-600), var(--color-info-400));
    }

    [data-status="success"] {
        --feedback-status-color: light-dark(var(--color-success-600), var(--color-success-400));
    }

    [data-status="warning"] {
        --feedback-status-color: light-dark(var(--color-warning-600), var(--color-warning-400));
    }

    [data-status="danger"] {
        --feedback-status-color: light-dark(var(--color-danger-600), var(--color-danger-400));
    }

    [data-status]:not([data-status="base"])
        :is([data-slot="feedback-leading"], [data-slot="feedback-title"]) {
        color: var(--feedback-status-color);
    }

    [data-slot="feedback-description"],
    [data-slot="feedback-list"] {
        margin: 2px 0 0;
    }

    [data-slot="feedback-list"] {
        padding: 0;
        list-style: none;
        row-gap: 0;
    }

    [data-slot="feedback-list-dot"] {
        margin-top: calc(0.5lh - 2px);
    }
</style>
