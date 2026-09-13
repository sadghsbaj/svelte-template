<script lang="ts">
    import { Textarea } from "$components";

    let { value = $bindable("Hello world\nSecond line") } = $props();
</script>

{#snippet leftIcon()}
    <svg data-testid="left-icon" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>
{/snippet}

{#snippet rightIcon()}
    <svg data-testid="right-icon" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>
{/snippet}

{#snippet customFooter()}
    <div data-testid="custom-footer" class="flex justify-between w-full">
        <button type="button" data-testid="footer-action">Send</button>
        <span data-testid="footer-count">12 chars</span>
    </div>
{/snippet}

<Textarea
    bind:value
    iconLeft={leftIcon}
    iconRight={rightIcon}
    footer={customFooter}
/>
