<script lang="ts">
    import { onDestroy } from "svelte";

    import { appInertState } from "$core/_system/layout/app-layer/layer.svelte";

    import Floating from "$components/_system/floating/Floating.svelte";
    import type {
        FloatingAnchorValue,
        FloatingContext,
        FloatingPositionResult,
    } from "$components/_system/floating/floating.types";
    import { focusTrap } from "$attachments/_system/focus-trap.attach";
    import { getActiveElement } from "$attachments/_system/focus.utils";

    import { runPopoverAnimation, waitForPopoverAnimation } from "./popover.animation";
    import {
        connectPopoverTabBridge,
        focusPopoverTarget,
        isValidFocusTarget,
        resolveInitialFocus,
        resolveRestoreTarget,
        shouldRestoreFocus,
    } from "./popover.focus";
    import {
        createPopoverParentContext,
        popoverBranchContains,
        popoverOwnsNode,
        registerPopover,
    } from "./popover.stack.svelte";
    import { popoverTrigger } from "./popover.trigger";
    import type {
        PopoverChangeDetail,
        PopoverCloseReason,
        PopoverContentContext,
        PopoverDismissDetail,
        PopoverDismissOptions,
        PopoverOpenReason,
        PopoverPhase,
        PopoverProps,
        PopoverReason,
        PopoverTriggerContext,
    } from "./popover.types";

    let {
        open = $bindable(false),
        disabled = false,
        anchor,
        placement = "bottom",
        offset = 6,
        padding = 8,
        flip = true,
        shift = true,
        boundary = "viewport",
        direction = "auto",
        trackPosition = false,
        dismiss = true,
        modal = false,
        initialFocus = "auto",
        restoreFocus = "auto",
        role = "dialog",
        animation = "default",
        element = $bindable(),
        triggerElement = $bindable(),
        onOpenChange,
        onDismiss,
        onPositionChange,
        onPositionError,
        trigger,
        children: childSnippet,
        class: className = "",
        style = "",
        ...restProps
    }: PopoverProps = $props();

    const instanceId = $props.id();
    const triggerId = `popover-${instanceId}-trigger`;
    const contentId = `popover-${instanceId}-content`;
    const parent = createPopoverParentContext();

    let phase = $state<PopoverPhase>("closed");
    let present = $state(false);
    let zIndex = $state(1);
    let floatingElement = $state<HTMLDivElement>();
    let motionElement = $state<HTMLDivElement>();
    let latestFloating: FloatingContext | null = null;
    let observedOpen = false;
    let initialized = false;
    let pendingDetail: PopoverChangeDetail | null = null;
    let approvedDismiss = false;
    let opener: HTMLElement | null = null;
    let focusWasMoved = false;
    let keyboardOpen = false;
    let assignedContentTabIndex = false;
    let lifecycle = 0;
    let ownAnimation: Animation | null = null;
    let unregisterStack: (() => void) | null = null;

    const dismissOptions = $derived<Required<PopoverDismissOptions>>({
        outsidePointer:
            dismiss === true || (typeof dismiss === "object" && dismiss.outsidePointer !== false),
        escape: dismiss === true || (typeof dismiss === "object" && dismiss.escape !== false),
        focusOutside: typeof dismiss === "object" && dismiss.focusOutside === true,
        anchorDetached:
            dismiss === true || (typeof dismiss === "object" && dismiss.anchorDetached !== false),
    });

    const makeDetail = (reason: PopoverReason, event?: Event): PopoverChangeDetail => ({
        reason,
        event,
        trigger: triggerElement ?? null,
        content: element ?? null,
    });

    const openPopover = (reason: PopoverOpenReason = "programmatic", event?: Event): void => {
        if (disabled || open) return;
        opener = triggerElement ?? getActiveElement();
        keyboardOpen = reason === "trigger" && event instanceof MouseEvent && event.detail === 0;
        pendingDetail = makeDetail(reason, event);
        open = true;
    };

    const close = (reason: PopoverCloseReason = "programmatic", event?: Event): void => {
        if (!open) return;
        const detail = makeDetail(reason, event) as PopoverDismissDetail;
        if (onDismiss?.(detail) === false) return;
        approvedDismiss = true;
        pendingDetail = detail;
        open = false;
    };

    const toggle = (event?: Event): void => {
        if (open) close("trigger", event);
        else openPopover("trigger", event);
    };

    const cancelOwnAnimation = (): void => {
        ownAnimation?.cancel();
        ownAnimation = null;
        if (motionElement) {
            motionElement.style.transformOrigin = "";
            motionElement.style.willChange = "";
        }
    };

    const applyInitialFocus = (): void => {
        if (!element) return;
        const hadTabIndex = element.hasAttribute("tabindex");
        const target = resolveInitialFocus(element, initialFocus, modal, keyboardOpen);
        focusWasMoved = focusPopoverTarget(element, target);
        if (!focusWasMoved && modal && initialFocus !== false) {
            focusWasMoved = focusPopoverTarget(element, element);
        }
        assignedContentTabIndex = !hadTabIndex && element.hasAttribute("tabindex");
    };

    const restoreOnClose = (detail: PopoverDismissDetail): void => {
        const active = getActiveElement();
        const inside = popoverBranchContains(parent.id, active);
        if (shouldRestoreFocus(restoreFocus, detail.reason, focusWasMoved, inside)) {
            const target = resolveRestoreTarget(restoreFocus, detail, opener);
            if (isValidFocusTarget(target)) target.focus({ preventScroll: true });
        }
        if (assignedContentTabIndex && element) element.removeAttribute("tabindex");
        assignedContentTabIndex = false;
        focusWasMoved = false;
    };

    const enter = async (floating: FloatingContext): Promise<void> => {
        if (!open || phase !== "positioning") return;
        const token = ++lifecycle;
        cancelOwnAnimation();
        phase = "entering";
        applyInitialFocus();
        try {
            if (motionElement)
                ownAnimation = runPopoverAnimation(
                    motionElement,
                    "enter",
                    pendingDetail?.reason ?? "programmatic",
                    floating,
                    animation
                );
        } catch {
            ownAnimation = null;
        }
        await waitForPopoverAnimation(ownAnimation);
        if (token !== lifecycle || !open) return;
        cancelOwnAnimation();
        phase = "open";
    };

    const exit = async (detail: PopoverDismissDetail): Promise<void> => {
        const token = ++lifecycle;
        cancelOwnAnimation();
        phase = "exiting";
        restoreOnClose(detail);
        try {
            if (motionElement && latestFloating)
                ownAnimation = runPopoverAnimation(
                    motionElement,
                    "exit",
                    detail.reason,
                    latestFloating,
                    animation
                );
        } catch {
            ownAnimation = null;
        }
        await waitForPopoverAnimation(ownAnimation);
        if (token !== lifecycle || open) return;
        cancelOwnAnimation();
        present = false;
        phase = "closed";
        latestFloating = null;
    };

    const captureFloating = (floating: FloatingContext): PopoverContentContext => {
        latestFloating = floating;
        if (floating.positioned && phase === "positioning")
            queueMicrotask(() => void enter(floating));
        return {
            open,
            present,
            phase,
            disabled,
            triggerId,
            contentId,
            triggerElement: triggerElement ?? null,
            element: element ?? null,
            openPopover,
            close,
            toggle,
            ...floating,
            updatePosition: floating.update,
        };
    };

    const handlePositionChange = (result: FloatingPositionResult): void => {
        onPositionChange?.(result);
        const positionedFloating: FloatingContext = {
            ...result,
            positioned: true,
            update: latestFloating?.update ?? (() => {}),
        };
        latestFloating = positionedFloating;
        if (phase === "positioning") queueMicrotask(() => void enter(positionedFloating));
    };

    const triggerAttachment = $derived(
        popoverTrigger({
            id: triggerId,
            contentId,
            open,
            present,
            role,
            disabled,
            setElement: (next) => {
                triggerElement = next ?? undefined;
            },
            toggle,
        })
    );
    const triggerContext = $derived<PopoverTriggerContext>({
        attachment: triggerAttachment,
        open,
        disabled,
        triggerId,
        contentId,
        openPopover,
        close,
        toggle,
    });
    const trapAttachment = $derived(
        focusTrap({
            enabled: modal && open,
            initialFocus: false,
            restoreFocus: false,
            setAriaModal: false,
            allowOutsideClick: true,
        })
    );
    const resolvedAnchor = $derived(anchor ?? triggerElement ?? null);

    $effect(() => {
        if (!initialized) {
            initialized = true;
            observedOpen = open;
            if (open && !disabled) {
                opener = triggerElement ?? getActiveElement();
                present = true;
                phase = "positioning";
            } else if (open) {
                open = false;
                observedOpen = false;
            }
            return;
        }
        if (open === observedOpen) return;
        if (open && disabled) {
            open = false;
            return;
        }

        if (!open) {
            const detail = (pendingDetail ?? makeDetail("programmatic")) as PopoverDismissDetail;
            if (!approvedDismiss && onDismiss?.(detail) === false) {
                open = true;
                pendingDetail = null;
                return;
            }
            approvedDismiss = false;
            observedOpen = false;
            onOpenChange?.(false, detail);
            void exit(detail);
        } else {
            observedOpen = true;
            if (!pendingDetail) opener = triggerElement ?? getActiveElement();
            const detail = pendingDetail ?? makeDetail("programmatic");
            present = true;
            phase = "positioning";
            onOpenChange?.(true, detail);
            if (latestFloating?.positioned)
                queueMicrotask(() => void enter(latestFloating as FloatingContext));
        }
        pendingDetail = null;
    });

    $effect(() => {
        if (!disabled || !open) return;
        const detail = makeDetail("programmatic") as PopoverDismissDetail;
        onDismiss?.(detail);
        approvedDismiss = true;
        pendingDetail = detail;
        open = false;
    });

    $effect(() => {
        if (!present) return;
        unregisterStack = registerPopover({
            id: parent.id,
            parentId: parent.parentId,
            trigger: () => triggerElement ?? null,
            content: () => element ?? null,
            canDismiss: (reason) => {
                if (!open) return false;
                if (reason === "escape") return dismissOptions.escape;
                if (reason === "outside-pointer") return dismissOptions.outsidePointer;
                return dismissOptions.focusOutside;
            },
            dismiss: close,
            setZIndex: (next) => {
                zIndex = next;
            },
        });
        return () => {
            unregisterStack?.();
            unregisterStack = null;
        };
    });

    $effect(() => {
        if (!open || modal || !triggerElement || !element) return;
        return connectPopoverTabBridge(
            triggerElement,
            element,
            (node) => popoverOwnsNode(parent.id, node),
            (node) => popoverBranchContains(parent.id, node)
        );
    });

    $effect(() => {
        if (!modal || !open) return;
        appInertState.block();
        return () => appInertState.unblock();
    });

    $effect(() => {
        if (!open || !dismissOptions.anchorDetached) return;
        const value = typeof resolvedAnchor === "function" ? resolvedAnchor() : resolvedAnchor;
        const anchorElement =
            value instanceof HTMLElement
                ? value
                : value && "contextElement" in value && value.contextElement instanceof HTMLElement
                  ? value.contextElement
                  : null;
        if (!anchorElement) return;
        const observer = new MutationObserver(() => {
            if (!anchorElement.isConnected) close("anchor-detached");
        });
        observer.observe(document, { childList: true, subtree: true });
        if (!anchorElement.isConnected) close("anchor-detached");
        return () => observer.disconnect();
    });

    onDestroy(cancelOwnAnimation);
</script>

{@render trigger?.(triggerContext)}

{#if present}
    <Floating
        anchor={resolvedAnchor as FloatingAnchorValue | null}
        {placement}
        {offset}
        {padding}
        {flip}
        {shift}
        {boundary}
        {direction}
        {trackPosition}
        bind:element={floatingElement}
        onPositionChange={handlePositionChange}
        {onPositionError}
        style={`z-index:${zIndex}`}
    >
        {#snippet children(floating)}
            <div bind:this={motionElement}>
                <div
                    {...restProps}
                    bind:this={element}
                    id={contentId}
                    {role}
                    aria-modal={modal ? "true" : undefined}
                    inert={!open ? true : undefined}
                    class={className}
                    style={`${style ? `${style};` : ""}${!open ? "pointer-events:none;" : ""}`}
                    data-popover-phase={phase}
                    {@attach trapAttachment}
                >
                    {@render childSnippet?.(captureFloating(floating))}
                </div>
            </div>
        {/snippet}
    </Floating>
{/if}
