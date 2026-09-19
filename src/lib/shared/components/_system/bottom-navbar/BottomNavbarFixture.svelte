<script lang="ts">
    import BottomNavbar from "./BottomNavbar.svelte";

    let { onValueChange }: { onValueChange?: (value: string) => void } = $props();
    let value = $state("home");

    const items = [
        { value: "home", label: "Home" },
        { value: "search", label: "Search" },
    ] as const;
</script>

<BottomNavbar position="static" {items} bind:value {onValueChange} />
<output data-bottom-navbar-value>{value}</output>
