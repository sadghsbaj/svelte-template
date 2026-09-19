<script lang="ts">
    import FeedbackCard from "$components/_system/feedback/FeedbackCard.svelte";

    import type { NotificationProps } from "./notification.types";

    let {
        status = "base",
        title,
        description,
        icon,
        leading,
        trailing,
        action,
        dismissible = true,
        closeButton = false,
        closeLabel = "Dismiss notification",
        onDismiss,
        onAction,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: NotificationProps = $props();
</script>

<FeedbackCard
    {...restProps}
    kind="notification"
    {status}
    {title}
    {description}
    {icon}
    {leading}
    {trailing}
    {action}
    {dismissible}
    {closeButton}
    {closeLabel}
    {onDismiss}
    {onAction}
    class={className}
    bind:element
/>
