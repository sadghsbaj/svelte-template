<script lang="ts">
    import { onDestroy, type Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    import { copyActionStyles } from "./copy-action.styles";

    interface Props extends Omit<HTMLButtonAttributes, "children"> {
        as?: "button" | "span";
        copied?: boolean;
        duration?: number;
        strokeWidth?: number;
        class?: string;
        element?: HTMLElement | null;
        icon?: Snippet<[{ copied: boolean }]>;
        children?: Snippet<[{ copied: boolean }]>;
    }

    let {
        as = "button",
        copied = $bindable(),
        duration = 2000,
        strokeWidth = 2,
        class: className = "",
        element = $bindable(null),
        icon,
        children,
        onclick,
        ...restProps
    }: Props = $props();

    let isInternalCopied = $state(false);
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const activeCopied = $derived(copied !== undefined ? copied : isInternalCopied);

    function handleClick(event: MouseEvent): void {
        onclick?.(event as never);
        if (event.defaultPrevented) return;

        if (timerId !== null) clearTimeout(timerId);

        if (copied !== undefined) {
            copied = true;
        } else {
            isInternalCopied = true;
        }

        timerId = setTimeout(() => {
            if (copied !== undefined) {
                copied = false;
            } else {
                isInternalCopied = false;
            }
            timerId = null;
        }, duration);
    }

    onDestroy(() => {
        if (timerId !== null) clearTimeout(timerId);
    });

    const computedClass = $derived(
        copyActionStyles({
            as,
            copied: activeCopied,
            class: className,
        })
    );
</script>

<svelte:element
    this={as}
    bind:this={element}
    type={as === "button" ? "button" : undefined}
    class={computedClass}
    onclick={handleClick}
    aria-label={restProps["aria-label"] ?? (activeCopied ? "Copied" : "Copy to clipboard")}
    {...restProps}
>
    {#if icon}
        {@render icon({ copied: activeCopied })}
    {:else if children}
        {@render children({ copied: activeCopied })}
    {:else}
        <!-- Copy Icon -->
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
            class="copy-icon"
            class:is-hidden={activeCopied}
            aria-hidden="true"
        >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>

        <!-- Checkmark Icon -->
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
            class="check-icon"
            class:is-active={activeCopied}
            aria-hidden="true"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>

        <!-- Green Micro-Confetti / Sparkle Burst -->
        {#if activeCopied}
            <span class="particles" aria-hidden="true">
                <span class="particle particle-0"></span>
                <span class="particle particle-1"></span>
                <span class="particle particle-2"></span>
                <span class="particle particle-3"></span>
                <span class="particle particle-4"></span>
                <span class="particle particle-5"></span>
            </span>
        {/if}
    {/if}
</svelte:element>

<style>
    .copy-icon {
        width: 100%;
        height: 100%;
        display: block;
        transform: scale(1) rotate(0deg);
        opacity: 1;
        transition:
            transform 200ms var(--ease-cubic-out),
            opacity 180ms var(--ease-sine-out);
    }

    .copy-icon.is-hidden {
        transform: scale(0.6) rotate(-12deg);
        opacity: 0;
        pointer-events: none;
        transition:
            transform 200ms var(--ease-cubic-out),
            opacity 150ms var(--ease-sine-out);
    }

    .check-icon {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        transform: scale(0.5) rotate(-15deg);
        opacity: 0;
        pointer-events: none;
        filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-success-500) 40%, transparent));
        transition:
            transform 200ms var(--ease-cubic-out),
            opacity 150ms var(--ease-sine-out);
    }

    .check-icon.is-active {
        transform: scale(1) rotate(0deg);
        opacity: 1;
        transition:
            transform 260ms var(--ease-back-out),
            opacity 180ms var(--ease-sine-out);
    }

    /* Green Micro-Sparkle Particles */
    .particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .particle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2.5px;
        height: 2.5px;
        border-radius: 9999px;
        background-color: var(--color-success-500);
        opacity: 0;
    }

    .particle-0 {
        animation: burst-0 420ms var(--ease-quart-out) forwards;
    }
    .particle-1 {
        animation: burst-1 420ms var(--ease-quart-out) forwards;
    }
    .particle-2 {
        animation: burst-2 420ms var(--ease-quart-out) forwards;
    }
    .particle-3 {
        animation: burst-3 420ms var(--ease-quart-out) forwards;
    }
    .particle-4 {
        animation: burst-4 420ms var(--ease-quart-out) forwards;
    }
    .particle-5 {
        animation: burst-5 420ms var(--ease-quart-out) forwards;
    }

    @keyframes burst-0 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        40% {
            transform: translate(calc(-50% + 12px), calc(-50% - 3px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + 15px), calc(-50% - 4px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes burst-1 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        40% {
            transform: translate(calc(-50% + 7px), calc(-50% - 13px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + 9px), calc(-50% - 16px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes burst-2 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        40% {
            transform: translate(calc(-50% - 7px), calc(-50% - 13px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% - 9px), calc(-50% - 16px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes burst-3 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        40% {
            transform: translate(calc(-50% - 12px), calc(-50% - 2px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% - 15px), calc(-50% - 3px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes burst-4 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        40% {
            transform: translate(calc(-50% - 7px), calc(-50% + 11px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% - 9px), calc(-50% + 14px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes burst-5 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        40% {
            transform: translate(calc(-50% + 7px), calc(-50% + 11px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + 9px), calc(-50% + 14px)) scale(0);
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .copy-icon,
        .check-icon,
        .particles {
            animation: none !important;
            transition: none !important;
        }
    }
</style>
