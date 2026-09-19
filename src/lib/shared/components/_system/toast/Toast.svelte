<script lang="ts">
    import FeedbackCard from "$components/_system/feedback/FeedbackCard.svelte";

    import type { ToastProps } from "./toast.types";

    let {
        status = "base",
        title,
        description,
        icon,
        leading,
        trailing,
        action,
        dismissible = true,
        closeButton = true,
        closeLabel = "Dismiss toast",
        onDismiss,
        onAction,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: ToastProps = $props();
</script>

<FeedbackCard
    {...restProps}
    kind="toast"
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
