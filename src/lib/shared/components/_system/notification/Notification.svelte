<script lang="ts">
    import { Check, CircleAlert, Info, TriangleAlert } from "@lucide/svelte";
    import { uuid } from "$utils";

    import {
        notificationIconStyles,
        notificationStyles,
        notificationTitleStyles,
    } from "./notification.styles";
    import type { NotificationIcon, NotificationProps, NotificationStatus } from "./notification.types";

    const defaultIcons: Record<NotificationStatus, NotificationIcon> = {
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
        items = [],
        icon,
        leading,
        trailing,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: NotificationProps = $props();

    const contentId = `notification-content-${uuid()}`;
    const titleId = `${contentId}-title`;
    const descriptionId = `${contentId}-description`;
    const listId = `${contentId}-list`;
    const Icon = $derived(icon ?? defaultIcons[status]);
    const hasDescription = $derived(typeof description === "string" && description.length > 0);
    const resolvedItems = $derived([
        ...(Array.isArray(description) ? description : []),
        ...items,
    ]);
    const hasList = $derived(resolvedItems.length > 0);
    const hasBody = $derived(hasDescription || hasList);
    const describedBy = $derived(
        [hasDescription ? descriptionId : null, hasList ? listId : null]
            .filter(Boolean)
            .join(" ") || undefined
    );
    const hasTrailing = $derived(!!trailing);
    const computedClass = $derived(
        notificationStyles({ hasBody, hasTrailing, class: className })
    );
</script>

<div
    bind:this={element}
    {...restProps}
    role="group"
    aria-labelledby={titleId}
    aria-describedby={describedBy}
    data-slot="notification"
    data-status={status}
    data-has-body={hasBody ? "" : undefined}
    data-has-trailing={hasTrailing ? "" : undefined}
    class={computedClass}
>
    <div
        data-slot="notification-message"
        class="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-start gap-x-10px"
    >
        <span
            data-slot="notification-leading"
            class={notificationIconStyles({ status })}
            aria-hidden="true"
        >
            {#if leading}
                {@render leading()}
            {:else}
                <Icon />
            {/if}
        </span>

        <div data-slot="notification-content" class="min-w-0">
            <div data-slot="notification-title-row">
                <span
                    id={titleId}
                    data-slot="notification-title"
                    class={notificationTitleStyles({ status })}
                >
                    {title}
                </span>
            </div>

            {#if hasDescription}
                <p
                    id={descriptionId}
                    data-slot="notification-description"
                    class="min-w-0 text-xs font-400 leading-4 text-weak text-pretty"
                >
                    {description}
                </p>
            {/if}

            {#if hasList}
                <ul
                    id={listId}
                    data-slot="notification-list"
                    class="flex min-w-0 flex-col text-xs font-400 leading-4 text-weak"
                >
                    {#each resolvedItems as item, index (`${item}-${index}`)}
                        <li class="grid grid-cols-[6px_minmax(0,1fr)] items-start gap-7px">
                            <span
                                aria-hidden="true"
                                data-slot="notification-list-dot"
                                class="size-4px rounded-full bg-current opacity-45"
                            ></span>
                            <span class="min-w-0 text-pretty">{item}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>

    {#if trailing}
        <div
            data-slot="notification-trailing"
            class="flex shrink-0 items-start {hasBody ? 'self-start' : 'self-center'}"
        >
            {@render trailing()}
        </div>
    {/if}
</div>

<style>
    [data-slot="notification"] {
        box-sizing: border-box;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        align-items: center;
        width: 100%;
        min-width: 0;
        max-width: 544px;
        padding: 14px;
        column-gap: 12px;
        box-shadow:
            0 18px 44px -16px light-dark(rgb(0 0 0 / 20%), rgb(0 0 0 / 42%)),
            0 7px 18px -10px light-dark(rgb(0 0 0 / 13%), rgb(0 0 0 / 28%)),
            0 0 20px light-dark(transparent, rgb(255 255 255 / 2%));
    }

    [data-slot="notification"][data-has-trailing] {
        grid-template-columns: minmax(0, 1fr) auto;
    }

    [data-slot="notification"][data-has-body] {
        align-items: start;
    }

    [data-slot="notification-message"] {
        display: grid;
        grid-template-columns: 16px minmax(0, 1fr);
        align-items: start;
        min-width: 0;
        column-gap: 10px;
    }

    [data-slot="notification-leading"] {
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: start;
        width: 16px;
        height: 16px;
    }

    [data-slot="notification-leading"] :global(svg) {
        width: 16px;
        height: 16px;
    }

    [data-slot="notification-content"] {
        min-width: 0;
    }

    [data-slot="notification-title-row"] {
        display: flex;
        align-items: center;
        height: 16px;
        min-width: 0;
    }

    [data-slot="notification-title"] {
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

    [data-slot="notification-description"],
    [data-slot="notification-list"] {
        margin: 4px 0 0;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
    }

    [data-slot="notification-trailing"] {
        display: flex;
        flex-shrink: 0;
        align-items: flex-start;
    }

    [data-slot="notification"][data-has-body] [data-slot="notification-trailing"] {
        align-self: start;
    }

    [data-slot="notification"]:not([data-has-body]) [data-slot="notification-trailing"] {
        align-self: center;
    }

    [data-status="accent"] {
        --notification-status-color: light-dark(
            var(--color-accent-600),
            var(--color-accent-400)
        );
    }

    [data-status="info"] {
        --notification-status-color: light-dark(var(--color-info-600), var(--color-info-400));
    }

    [data-status="success"] {
        --notification-status-color: light-dark(
            var(--color-success-600),
            var(--color-success-400)
        );
    }

    [data-status="warning"] {
        --notification-status-color: light-dark(
            var(--color-warning-600),
            var(--color-warning-400)
        );
    }

    [data-status="danger"] {
        --notification-status-color: light-dark(
            var(--color-danger-600),
            var(--color-danger-400)
        );
    }

    [data-status]:not([data-status="base"])
        :is([data-slot="notification-leading"], [data-slot="notification-title"]) {
        color: var(--notification-status-color);
    }

    [data-slot="notification-list"] {
        padding: 0;
        list-style: none;
        row-gap: 4px;
    }

    [data-slot="notification-list-dot"] {
        margin-top: calc(0.5lh - 2px);
    }
</style>
