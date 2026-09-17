<script lang="ts">
    import { onDestroy, type Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    import { copyActionStyles } from "./copy-action.styles";

    export type CopyActionStatus = "idle" | "pending" | "copied" | "error";

    interface Props extends Omit<HTMLButtonAttributes, "children"> {
        as?: "button" | "span";
        copied?: boolean;
        status?: CopyActionStatus;
        duration?: number;
        strokeWidth?: number;
        preventSpam?: boolean;
        class?: string;
        element?: HTMLElement | null;
        icon?: Snippet<[{ status: CopyActionStatus; copied: boolean; error: boolean; pending: boolean }]>;
        children?: Snippet<[{ status: CopyActionStatus; copied: boolean; error: boolean; pending: boolean }]>;
    }

    let {
        as = "button",
        copied = $bindable(),
        status = $bindable(),
        duration = 2000,
        strokeWidth = 2,
        preventSpam = true,
        class: className = "",
        element = $bindable(null),
        icon,
        children,
        onclick,
        ...restProps
    }: Props = $props();

    let internalStatus = $state<CopyActionStatus>("idle");
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let pendingTimerId: ReturnType<typeof setTimeout> | null = null;

    const activeStatus = $derived.by<CopyActionStatus>(() => {
        if (status !== undefined) return status;
        if (copied !== undefined) return copied ? "copied" : "idle";
        return internalStatus;
    });

    const isPending = $derived(activeStatus === "pending");
    const isCopied = $derived(activeStatus === "copied");
    const isError = $derived(activeStatus === "error");
    const isFeedback = $derived(isCopied || isError);
    const isLocked = $derived(activeStatus !== "idle");

    function setStatus(newStatus: CopyActionStatus): void {
        if (status !== undefined) {
            status = newStatus;
        }
        if (copied !== undefined) {
            copied = newStatus === "copied";
        }
        internalStatus = newStatus;

        if (newStatus === "copied" || newStatus === "error") {
            timerId = setTimeout(() => {
                if (status !== undefined) {
                    status = "idle";
                }
                if (copied !== undefined) {
                    copied = false;
                }
                internalStatus = "idle";
                timerId = null;
            }, duration);
        }
    }

    async function handleClick(event: MouseEvent): Promise<void> {
        if (event.defaultPrevented) return;
        if (preventSpam && isLocked) return;

        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (pendingTimerId !== null) {
            clearTimeout(pendingTimerId);
            pendingTimerId = null;
        }

        const result = onclick?.(event as never);

        if (result instanceof Promise) {
            pendingTimerId = setTimeout(() => {
                if (activeStatus === "idle") {
                    setStatus("pending");
                }
                pendingTimerId = null;
            }, 150);

            try {
                await result;
                if (pendingTimerId !== null) {
                    clearTimeout(pendingTimerId);
                    pendingTimerId = null;
                }
                setStatus("copied");
            } catch {
                if (pendingTimerId !== null) {
                    clearTimeout(pendingTimerId);
                    pendingTimerId = null;
                }
                setStatus("error");
            }
        } else {
            setStatus("copied");
        }
    }

    onDestroy(() => {
        if (timerId !== null) clearTimeout(timerId);
        if (pendingTimerId !== null) clearTimeout(pendingTimerId);
    });

    const computedClass = $derived(
        copyActionStyles({
            as,
            status: activeStatus,
            locked: preventSpam && isLocked,
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
    aria-label={restProps["aria-label"] ??
        (isCopied
            ? "Copied"
            : isError
              ? "Failed to copy"
              : isPending
                ? "Copying..."
                : "Copy to clipboard")}
    {...restProps}
>
    {#if icon}
        {@render icon({ status: activeStatus, copied: isCopied, error: isError, pending: isPending })}
    {:else if children}
        {@render children({ status: activeStatus, copied: isCopied, error: isError, pending: isPending })}
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
            class:is-hidden={isFeedback}
            class:is-pending={isPending}
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
            class="status-icon check-icon"
            class:is-active={isCopied}
            aria-hidden="true"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>

        <!-- X (Error) Icon -->
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
            class="status-icon x-icon"
            class:is-active={isError}
            aria-hidden="true"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>

        <!-- Celebration / Feedback Micro-Sparkles Burst -->
        {#if isFeedback}
            <span class="particles" class:is-error={isError} aria-hidden="true">
                <!-- 4-point micro-stars -->
                <svg viewBox="0 0 16 16" class="particle star star-1">
                    <path d="M8 0C8 4.4 11.6 8 16 8C11.6 8 8 11.6 8 16C8 11.6 4.4 8 0 8C4.4 8 8 4.4 8 0Z" />
                </svg>
                <svg viewBox="0 0 16 16" class="particle star star-2">
                    <path d="M8 0C8 4.4 11.6 8 16 8C11.6 8 8 11.6 8 16C8 11.6 4.4 8 0 8C4.4 8 8 4.4 8 0Z" />
                </svg>

                <!-- Dynamic micro-accent sparks -->
                <span class="particle dot dot-1"></span>
                <span class="particle dot dot-2"></span>
                <span class="particle dot dot-3"></span>
                <span class="particle dot dot-4"></span>
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

    .copy-icon.is-pending {
        animation: copy-pulse 1.2s var(--ease-sine-in-out) infinite;
    }

    .copy-icon.is-hidden {
        transform: scale(0.6) rotate(-12deg);
        opacity: 0;
        pointer-events: none;
        transition:
            transform 200ms var(--ease-cubic-out),
            opacity 150ms var(--ease-sine-out);
    }

    @keyframes copy-pulse {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.45;
            transform: scale(0.96);
        }
    }

    .status-icon {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        transform: scale(0.5) rotate(-15deg);
        opacity: 0;
        pointer-events: none;
        transition:
            transform 200ms var(--ease-cubic-out),
            opacity 150ms var(--ease-sine-out);
    }

    .status-icon.is-active {
        transform: scale(1) rotate(0deg);
        opacity: 1;
        transition:
            transform 260ms var(--ease-back-out),
            opacity 180ms var(--ease-sine-out);
    }

    .check-icon {
        color: var(--copy-action-check-color, var(--color-success-500));
        filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-success-500) 40%, transparent));
    }

    .x-icon {
        color: var(--copy-action-error-color, var(--color-danger-500));
        filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-danger-500) 40%, transparent));
    }

    /* Celebration / Feedback Micro-Sparkles */
    .particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
        --sparkle-color: var(--copy-action-check-color, var(--color-success-500));
    }

    .particles.is-error {
        --sparkle-color: var(--copy-action-error-color, var(--color-danger-500));
    }

    .particle {
        position: absolute;
        top: 50%;
        left: 50%;
        opacity: 0;
        pointer-events: none;
    }

    .particle.star {
        fill: currentColor;
        color: var(--sparkle-color);
    }

    .particle.dot {
        border-radius: 9999px;
        background-color: var(--sparkle-color);
    }

    /* Star 1: Primary top-right sparkle above checkmark peak */
    .star-1 {
        width: 6.5px;
        height: 6.5px;
        animation: star-burst-1 460ms var(--ease-quart-out) forwards;
    }

    /* Star 2: Accent bottom-left starlet */
    .star-2 {
        width: 5px;
        height: 5px;
        animation: star-burst-2 420ms var(--ease-quart-out) 35ms forwards;
    }

    /* Dot 1: Satellite spark shooting up-left */
    .dot-1 {
        width: 2.2px;
        height: 2.2px;
        animation: dot-burst-1 380ms var(--ease-quart-out) 15ms forwards;
    }

    /* Dot 2: High top-right spark */
    .dot-2 {
        width: 2px;
        height: 2px;
        animation: dot-burst-2 400ms var(--ease-quart-out) 40ms forwards;
    }

    /* Dot 3: Dynamic right spark */
    .dot-3 {
        width: 1.8px;
        height: 1.8px;
        animation: dot-burst-3 360ms var(--ease-quart-out) 20ms forwards;
    }

    /* Dot 4: Bottom-right spark */
    .dot-4 {
        width: 2.2px;
        height: 2.2px;
        animation: dot-burst-4 410ms var(--ease-quart-out) 50ms forwards;
    }

    @keyframes star-burst-1 {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
        }
        25% {
            transform: translate(calc(-50% + 9px), calc(-50% - 8px)) scale(1.3) rotate(45deg);
            opacity: 1;
        }
        60% {
            transform: translate(calc(-50% + 12px), calc(-50% - 10px)) scale(0.9) rotate(70deg);
            opacity: 0.9;
        }
        100% {
            transform: translate(calc(-50% + 14px), calc(-50% - 11px)) scale(0) rotate(90deg);
            opacity: 0;
        }
    }

    @keyframes star-burst-2 {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
        }
        30% {
            transform: translate(calc(-50% - 8px), calc(-50% + 5px)) scale(1.15) rotate(-30deg);
            opacity: 1;
        }
        65% {
            transform: translate(calc(-50% - 11px), calc(-50% + 7px)) scale(0.85) rotate(-50deg);
            opacity: 0.8;
        }
        100% {
            transform: translate(calc(-50% - 12px), calc(-50% + 8px)) scale(0) rotate(-65deg);
            opacity: 0;
        }
    }

    @keyframes dot-burst-1 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        45% {
            transform: translate(calc(-50% - 7px), calc(-50% - 10px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% - 9px), calc(-50% - 12px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes dot-burst-2 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        45% {
            transform: translate(calc(-50% + 5px), calc(-50% - 12px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + 7px), calc(-50% - 15px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes dot-burst-3 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        45% {
            transform: translate(calc(-50% + 11px), calc(-50% + 1px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + 14px), calc(-50% + 2px)) scale(0);
            opacity: 0;
        }
    }

    @keyframes dot-burst-4 {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        45% {
            transform: translate(calc(-50% + 7px), calc(-50% + 9px)) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + 9px), calc(-50% + 12px)) scale(0);
            opacity: 0;
        }
    }
</style>
