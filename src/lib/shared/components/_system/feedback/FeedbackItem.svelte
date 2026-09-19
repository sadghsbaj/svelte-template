<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
    import { middleClick } from "$attachments";

    import {
        runFeedbackAnimation,
        runSwipeExit,
        runSwipeReset,
        waitForFeedbackAnimation,
        type FeedbackEdge,
    } from "./feedback.animation";
    import type {
        FeedbackDismissReason,
        FeedbackPauseReason,
        FeedbackPhase,
    } from "./feedback.types";

    interface Props {
        phase: FeedbackPhase;
        dismissReason?: FeedbackDismissReason;
        edge: FeedbackEdge;
        dismissible: boolean;
        pauseOnInteraction: boolean;
        onEntered: () => void;
        onExited: () => void;
        onDismiss: (reason: FeedbackDismissReason) => void;
        onPause: (reason: FeedbackPauseReason) => void;
        onResume: (reason: FeedbackPauseReason) => void;
        children?: Snippet;
    }

    let {
        phase,
        dismissReason,
        edge,
        dismissible,
        pauseOnInteraction,
        onEntered,
        onExited,
        onDismiss,
        onPause,
        onResume,
        children,
    }: Props = $props();

    let motionElement: HTMLDivElement;
    let swipeElement: HTMLDivElement;
    let activeAnimation: Animation | null = null;
    let swipeAnimation: Animation | null = null;
    let swipeX = 0;
    let swipeDirection: -1 | 1 = 1;
    let lifecycle = 0;
    let exitStarted = false;
    let activePointerId: number | null = null;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let horizontalDrag = false;
    let verticalGesture = false;

    function cancelAnimation(): void {
        activeAnimation?.cancel();
        activeAnimation = null;
        if (motionElement) motionElement.style.willChange = "";
    }

    function cancelSwipeAnimation(): void {
        swipeAnimation?.cancel();
        swipeAnimation = null;
        if (swipeElement) swipeElement.style.willChange = "";
    }

    function clearSwipeStyles(): void {
        if (!swipeElement) return;
        swipeElement.style.transform = "";
        swipeElement.style.opacity = "";
        swipeElement.style.willChange = "";
        swipeX = 0;
    }

    async function enter(): Promise<void> {
        const token = ++lifecycle;
        cancelAnimation();
        activeAnimation = runFeedbackAnimation(motionElement, "enter", edge);
        await waitForFeedbackAnimation(activeAnimation);
        if (token !== lifecycle || phase === "exiting") return;
        cancelAnimation();
        onEntered();
    }

    async function exit(): Promise<void> {
        if (exitStarted) return;
        exitStarted = true;
        const token = ++lifecycle;
        cancelAnimation();
        cancelSwipeAnimation();

        activeAnimation =
            dismissReason === "swipe"
                ? runSwipeExit(swipeElement, swipeX, swipeDirection)
                : runFeedbackAnimation(motionElement, "exit", edge);
        await waitForFeedbackAnimation(activeAnimation);
        if (token !== lifecycle) return;
        cancelAnimation();
        cancelSwipeAnimation();
        onExited();
    }

    function updateSwipe(x: number): void {
        swipeX = x;
        swipeDirection = swipeX < 0 ? -1 : 1;
        const width = Math.max(1, swipeElement.offsetWidth);
        swipeElement.style.transform = `translate3d(${swipeX}px, 0, 0)`;
        swipeElement.style.opacity = String(Math.max(0.35, 1 - Math.abs(swipeX) / width));
    }

    async function resetSwipe(): Promise<void> {
        cancelSwipeAnimation();
        swipeAnimation = runSwipeReset(swipeElement, swipeX);
        await waitForFeedbackAnimation(swipeAnimation);
        cancelSwipeAnimation();
        clearSwipeStyles();
    }

    function handlePointerEnter(event: PointerEvent): void {
        if (event.pointerType !== "touch") onPause("hover");
    }

    function handlePointerLeave(event: PointerEvent): void {
        if (event.pointerType !== "touch") onResume("hover");
    }

    function handlePointerDown(event: PointerEvent): void {
        if (event.button !== 0 || activePointerId !== null) return;
        activePointerId = event.pointerId;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        horizontalDrag = false;
        verticalGesture = false;
        cancelSwipeAnimation();
        clearSwipeStyles();
        if (pauseOnInteraction) onPause("press");
    }

    function handlePointerMove(event: PointerEvent): void {
        if (activePointerId !== event.pointerId) return;
        if (!dismissible || verticalGesture) return;

        const dx = event.clientX - pointerStartX;
        const dy = event.clientY - pointerStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (!horizontalDrag && Math.hypot(dx, dy) >= 8) {
            if (absY > absX * 1.2) {
                verticalGesture = true;
                clearSwipeStyles();
                if (pauseOnInteraction) onResume("press");
                return;
            }
            if (absX >= absY) {
                horizontalDrag = true;
                if (pauseOnInteraction) {
                    onResume("press");
                    onPause("drag");
                }
            }
        }

        // Follow horizontal finger movement immediately; the release threshold alone
        // decides whether this becomes a dismiss or a snap-back.
        updateSwipe(dx);
        if (horizontalDrag && event.cancelable) event.preventDefault();
    }

    function releasePointer(event: PointerEvent): void {
        if (activePointerId !== event.pointerId) return;
        const wasHorizontal = horizontalDrag;
        const wasVertical = verticalGesture;
        activePointerId = null;
        horizontalDrag = false;
        verticalGesture = false;
        if (pauseOnInteraction) {
            onResume("press");
            onResume("drag");
        }

        const width = Math.max(1, swipeElement.offsetWidth);
        const dismissThreshold = Math.min(44, Math.max(28, width * 0.18));
        if (!wasVertical && wasHorizontal && Math.abs(swipeX) >= dismissThreshold) {
            swipeDirection = swipeX < 0 ? -1 : 1;
            onDismiss("swipe");
            return;
        }
        if (swipeX !== 0) void resetSwipe();
    }

    function cancelPointer(event: PointerEvent): void {
        if (activePointerId !== event.pointerId) return;
        activePointerId = null;
        horizontalDrag = false;
        verticalGesture = false;
        if (pauseOnInteraction) {
            onResume("press");
            onResume("drag");
        }
        if (swipeX !== 0) void resetSwipe();
    }

    function handleFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !swipeElement.contains(next)) onResume("focus");
    }

    function shouldHandleMiddleClick(event: MouseEvent): boolean {
        const target = event.target;
        if (!(target instanceof Element)) return true;
        return !target.closest("a, button, input, select, textarea, [role='button']");
    }

    onMount(() => {
        if (phase !== "exiting") queueMicrotask(() => void enter());
    });

    $effect(() => {
        if (phase === "exiting") void exit();
    });

    onDestroy(() => {
        ++lifecycle;
        cancelAnimation();
        cancelSwipeAnimation();
    });
</script>

<svelte:window
    onpointermove={handlePointerMove}
    onpointerup={releasePointer}
    onpointercancel={cancelPointer}
/>

<div bind:this={motionElement} data-slot="feedback-motion" data-phase={phase}>
    <!-- Interaction semantics are provided by the rendered notification/toast card. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        bind:this={swipeElement}
        data-slot="feedback-swipe"
        style:touch-action="pan-y"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onpointerdown={handlePointerDown}
        onfocusin={() => onPause("focus")}
        onfocusout={handleFocusOut}
        {@attach middleClick({
            enabled: dismissible,
            shouldHandle: shouldHandleMiddleClick,
            onMiddleClick: () => onDismiss("middle-click"),
        })}
    >
        {@render children?.()}
    </div>
</div>
