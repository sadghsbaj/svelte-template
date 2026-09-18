<script lang="ts">
    import Button from "$components/_system/button/Button.svelte";

    import ButtonGroup, { type ButtonGroupOrientation } from "./ButtonGroup.svelte";

    let {
        orientation = "horizontal",
        variant = "outline",
        separators = false,
        class: className = "",
    }: {
        orientation?: ButtonGroupOrientation;
        variant?: "elevated" | "outline" | "soft";
        separators?: boolean;
        class?: string;
    } = $props();
</script>

<ButtonGroup {orientation} {separators} class={className} aria-label="History">
    <Button {variant} color="base">First</Button>
    <Button {variant} color="base">Middle</Button>
    <Button {variant} color="base">Last</Button>
</ButtonGroup>
