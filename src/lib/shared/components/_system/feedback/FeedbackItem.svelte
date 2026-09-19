<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
    import { middleClick, pan, type PanEndEvent, type PanMoveEvent } from "$attachments";

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

    function updateSwipe(event: PanMoveEvent): void {
        swipeX = event.resistedDelta.x;
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

    function handlePanEnd(event: PanEndEvent): void {
        onResume("drag");
        onResume("press");
        if (event.isSwipe && dismissible) {
            swipeDirection = event.delta.x < 0 ? -1 : 1;
            onDismiss("swipe");
            return;
        }
        void resetSwipe();
    }

    function handlePointerEnter(event: PointerEvent): void {
        if (event.pointerType !== "touch") onPause("hover");
    }

    function handlePointerLeave(event: PointerEvent): void {
        if (event.pointerType !== "touch") onResume("hover");
    }

    function handlePointerDown(event: PointerEvent): void {
        if (!pauseOnInteraction || event.button !== 0) return;
        activePointerId = event.pointerId;
        onPause("press");
    }

    function releasePointer(event: PointerEvent): void {
        if (activePointerId !== event.pointerId) return;
        activePointerId = null;
        onResume("press");
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

<svelte:window onpointerup={releasePointer} onpointercancel={releasePointer} />

<div bind:this={motionElement} data-slot="feedback-motion" data-phase={phase}>
    <!-- Interaction semantics are provided by the rendered notification/toast card. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        bind:this={swipeElement}
        data-slot="feedback-swipe"
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
        {@attach pan({
            enabled: dismissible,
            axis: "x",
            swipeDistanceThreshold: 56,
            swipeVelocityThreshold: 0.55,
            onPanStart: () => onPause("drag"),
            onPan: updateSwipe,
            onPanEnd: handlePanEnd,
            onCancel: () => {
                onResume("drag");
                onResume("press");
                void resetSwipe();
            },
        })}
    >
        {@render children?.()}
    </div>
</div>
