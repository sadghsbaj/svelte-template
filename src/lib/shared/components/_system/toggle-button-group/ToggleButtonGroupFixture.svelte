<script lang="ts">
    import ToggleButton from "$components/_system/toggle-button/ToggleButton.svelte";

    import ToggleButtonGroup, {
        type ToggleButtonGroupOrientation,
        type ToggleButtonGroupType,
    } from "./ToggleButtonGroup.svelte";

    let {
        type = "single",
        orientation = "horizontal",
        separators = false,
        fullWidth = false,
        rovingFocus = true,
        loop = true,
        disabledMiddle = false,
        singleValue = $bindable("second"),
        multipleValue = $bindable(["first", "third"]),
    }: {
        type?: ToggleButtonGroupType;
        orientation?: ToggleButtonGroupOrientation;
        separators?: boolean;
        fullWidth?: boolean;
        rovingFocus?: boolean;
        loop?: boolean;
        disabledMiddle?: boolean;
        singleValue?: string;
        multipleValue?: string[];
    } = $props();
</script>

{#if type === "single"}
    <ToggleButtonGroup
        type="single"
        bind:value={singleValue}
        {orientation}
        {separators}
        {fullWidth}
        {rovingFocus}
        {loop}
        aria-label="Single choice"
    >
        <ToggleButton value="first">First</ToggleButton>
        <ToggleButton value="second" disabled={disabledMiddle}>Second</ToggleButton>
        <ToggleButton value="third">Third</ToggleButton>
    </ToggleButtonGroup>
    <output data-group-value>{singleValue ?? ""}</output>
{:else}
    <ToggleButtonGroup
        type="multiple"
        bind:value={multipleValue}
        {orientation}
        {separators}
        {fullWidth}
        {rovingFocus}
        {loop}
        aria-label="Multiple choices"
    >
        <ToggleButton value="first">First</ToggleButton>
        <ToggleButton value="second" disabled={disabledMiddle}>Second</ToggleButton>
        <ToggleButton value="third">Third</ToggleButton>
    </ToggleButtonGroup>
    <output data-group-value>{multipleValue.join(",")}</output>
{/if}
