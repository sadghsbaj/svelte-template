<script lang="ts">
    import { Check, CircleAlert, Info, TriangleAlert } from "@lucide/svelte";
    import { uuid } from "$utils";

    import { toastIconStyles, toastStyles, toastTitleStyles } from "./toast.styles";
    import type { ToastIcon, ToastProps, ToastStatus } from "./toast.types";

    const defaultIcons: Record<ToastStatus, ToastIcon> = {
        base: Info,
        accent: Info,
        info: Info,
        success: Check,
        warning: TriangleAlert,
        danger: CircleAlert,
    };

    let {
        status = "base",
        title,
        description,
        icon,
        leading,
        trailing,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: ToastProps = $props();

    const contentId = `toast-content-${uuid()}`;
    const titleId = `${contentId}-title`;
    const descriptionId = `${contentId}-description`;
    const Icon = $derived(icon ?? defaultIcons[status]);
    const hasDescription = $derived(!!description);
    const hasTrailing = $derived(!!trailing);
    const computedClass = $derived(toastStyles({ hasTrailing, class: className }));
</script>

<div
    bind:this={element}
    {...restProps}
    role="group"
    aria-labelledby={titleId}
    aria-describedby={hasDescription ? descriptionId : undefined}
    data-slot="toast"
    data-status={status}
    data-has-description={hasDescription ? "" : undefined}
    data-has-trailing={hasTrailing ? "" : undefined}
    class={computedClass}
>
    <div
        data-slot="toast-message"
        class="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-start gap-x-10px"
    >
        <span data-slot="toast-leading" class={toastIconStyles({ status })} aria-hidden="true">
            {#if leading}
                {@render leading()}
            {:else}
                <Icon />
            {/if}
        </span>

        <div data-slot="toast-content" class="min-w-0">
            <div data-slot="toast-title-row">
                <span id={titleId} data-slot="toast-title" class={toastTitleStyles({ status })}>
                    {title}
                </span>
            </div>

            {#if description}
                <p
                    id={descriptionId}
                    data-slot="toast-description"
                    class="min-w-0 truncate text-xs font-400 leading-4 text-weak"
                >
                    {description}
                </p>
            {/if}
        </div>
    </div>

    {#if trailing}
        <div data-slot="toast-trailing">
            {@render trailing()}
        </div>
    {/if}
</div>

<style>
    [data-slot="toast"] {
        box-sizing: border-box;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        align-items: center;
        width: 100%;
        min-width: 0;
        max-width: 384px;
        padding: 14px;
        column-gap: 12px;
        box-shadow:
            0 18px 44px -16px light-dark(rgb(0 0 0 / 20%), rgb(0 0 0 / 42%)),
            0 7px 18px -10px light-dark(rgb(0 0 0 / 13%), rgb(0 0 0 / 28%)),
            0 0 20px light-dark(transparent, rgb(255 255 255 / 2%));
    }

    [data-slot="toast"][data-has-trailing] {
        grid-template-columns: minmax(0, 1fr) auto;
    }

    [data-slot="toast-message"] {
        display: grid;
        grid-template-columns: 16px minmax(0, 1fr);
        align-items: start;
        min-width: 0;
        column-gap: 10px;
    }

    [data-slot="toast-leading"] {
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: start;
        width: 16px;
        height: 16px;
    }

    [data-slot="toast-leading"] :global(svg) {
        width: 16px;
        height: 16px;
    }

    [data-slot="toast-content"] {
        min-width: 0;
    }

    [data-slot="toast-title-row"] {
        display: flex;
        align-items: center;
        height: 16px;
        min-width: 0;
    }

    [data-slot="toast-title"] {
        display: block;
        width: 100%;
        min-width: 0;
        overflow: clip visible;
        font-size: 14px;
        font-weight: 600;
        line-height: 16px;
        letter-spacing: -0.025em;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-box-trim: trim-both;
        text-box-edge: cap alphabetic;
    }

    [data-slot="toast-description"] {
        margin: 4px 0 0;
        overflow: hidden;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    [data-slot="toast-trailing"] {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        align-self: center;
    }

    [data-status="accent"] {
        --toast-status-color: light-dark(var(--color-accent-600), var(--color-accent-400));
    }

    [data-status="info"] {
        --toast-status-color: light-dark(var(--color-info-600), var(--color-info-400));
    }

    [data-status="success"] {
        --toast-status-color: light-dark(var(--color-success-600), var(--color-success-400));
    }

    [data-status="warning"] {
        --toast-status-color: light-dark(var(--color-warning-600), var(--color-warning-400));
    }

    [data-status="danger"] {
        --toast-status-color: light-dark(var(--color-danger-600), var(--color-danger-400));
    }

    [data-status]:not([data-status="base"])
        :is([data-slot="toast-leading"], [data-slot="toast-title"]) {
        color: var(--toast-status-color);
    }
</style>
