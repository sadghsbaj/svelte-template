<script lang="ts">
    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    import NotificationHost from "$components/_system/notification/NotificationHost.svelte";
    import { notification } from "$components/_system/notification/notificationState.svelte";
    import ToastHost from "$components/_system/toast/ToastHost.svelte";
    import { toast } from "$components/_system/toast/toastState.svelte";

    export interface FeedbackHostProps {
        notificationLimit?: number;
        toastLimit?: number;
        avoidBottomNavbar?: boolean;
        bottomNavbarOffset?: string;
    }

    let {
        notificationLimit = 4,
        toastLimit = 4,
        avoidBottomNavbar = false,
        bottomNavbarOffset = "120px",
    }: FeedbackHostProps = $props();

    let compact = $state(false);
    const bottomClearance = $derived(avoidBottomNavbar ? bottomNavbarOffset : "0px");
    const toastAnnouncement = $derived(toast.announcement);

    $effect(() => {
        const media = window.matchMedia("(max-width: 639px)");
        const update = (): void => {
            compact = media.matches;
        };
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    });

    $effect(() => {
        const handleVisibility = (): void => {
            if (document.hidden) {
                notification.pauseAll("document-hidden");
                toast.pauseAll("document-hidden");
            } else {
                notification.resumeAll("document-hidden");
                toast.resumeAll("document-hidden");
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        handleVisibility();
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    });
</script>

<div
    data-slot="feedback-host"
    class="pointer-events-none fixed inset-0"
    style:--feedback-bottom-clearance={bottomClearance}
    {@attach layerAttach}
>
    {#if !compact}
        <div data-feedback-position="top-start" class="feedback-position feedback-start feedback-top">
            <ToastHost positions={["top-start"]} limit={toastLimit} />
        </div>
        <div data-feedback-position="top-end" class="feedback-position feedback-end feedback-top">
            <ToastHost positions={["top-end"]} limit={toastLimit} />
        </div>
        <div data-feedback-position="bottom-start" class="feedback-position feedback-start feedback-bottom">
            <ToastHost positions={["bottom-start"]} limit={toastLimit} />
        </div>
        <div data-feedback-position="bottom-end" class="feedback-position feedback-end feedback-bottom">
            <ToastHost positions={["bottom-end"]} limit={toastLimit} />
        </div>
    {/if}

    <div data-feedback-position="top-center" class="feedback-position feedback-center feedback-top">
        <NotificationHost limit={notificationLimit} />
        <ToastHost
            positions={compact ? ["top-start", "top-center", "top-end"] : ["top-center"]}
            limit={toastLimit}
        />
    </div>

    <div data-feedback-position="bottom-center" class="feedback-position feedback-center feedback-bottom">
        <ToastHost
            positions={compact ? ["bottom-start", "bottom-center", "bottom-end"] : ["bottom-center"]}
            limit={toastLimit}
        />
    </div>

    <div class="sr-only" aria-live="polite" aria-atomic="true">
        {#if toastAnnouncement?.priority === "polite"}
            {#key toastAnnouncement.token}{toastAnnouncement.text}{/key}
        {/if}
    </div>
    <div class="sr-only" aria-live="assertive" aria-atomic="true">
        {#if toastAnnouncement?.priority === "assertive"}
            {#key toastAnnouncement.token}{toastAnnouncement.text}{/key}
        {/if}
    </div>
</div>

<style>
    .feedback-position {
        position: absolute;
        display: flex;
        width: min(544px, calc(100vw - 32px));
        flex-direction: column;
        gap: 10px;
    }

    .feedback-top {
        inset-block-start: max(16px, env(safe-area-inset-top, 0px));
    }

    .feedback-bottom {
        inset-block-end: calc(
            max(16px, env(safe-area-inset-bottom, 0px)) + var(--feedback-bottom-clearance)
        );
    }

    .feedback-start {
        inset-inline-start: max(16px, env(safe-area-inset-left, 0px));
        width: min(384px, calc(100vw - 32px));
    }

    .feedback-end {
        inset-inline-end: max(16px, env(safe-area-inset-right, 0px));
        width: min(384px, calc(100vw - 32px));
    }

    .feedback-center {
        inset-inline-start: 50%;
        transform: translateX(-50%);
    }

    [data-feedback-position="bottom-center"] {
        width: min(384px, calc(100vw - 32px));
    }

</style>
