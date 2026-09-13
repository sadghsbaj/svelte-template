<script lang="ts">
    import { Search, Sparkles } from "@lucide/svelte";
    import TextInput from "$components/_system/text-input/TextInput.svelte";
</script>

{#snippet searchIcon()}
    <Search data-testid="left-icon" />
{/snippet}

{#snippet sparklesIcon()}
    <Sparkles data-testid="right-icon" />
{/snippet}

<TextInput
    placeholder="Testing icons..."
    iconLeft={searchIcon}
    iconRight={sparklesIcon}
/>
