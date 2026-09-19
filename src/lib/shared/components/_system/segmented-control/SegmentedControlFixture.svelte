<script lang="ts">
    import SegmentedControl from "./SegmentedControl.svelte";
    import SegmentedControlItem from "./SegmentedControlItem.svelte";

    interface Props {
        initialValue?: string;
        layout?: "equal" | "auto";
        disabled?: boolean;
        disabledMiddle?: boolean;
        separators?: boolean;
        preventLastSelection?: boolean;
    }

    let {
        initialValue = "second",
        layout = "equal",
        disabled = false,
        disabledMiddle = false,
        separators = false,
        preventLastSelection = false,
    }: Props = $props();

    let value = $derived(initialValue);
</script>

<SegmentedControl bind:value {layout} {disabled} {separators} aria-label="View density">
    <SegmentedControlItem value="first">First</SegmentedControlItem>
    <SegmentedControlItem value="second" disabled={disabledMiddle}>Second</SegmentedControlItem>
    <SegmentedControlItem
        value="third"
        onclick={(event) => {
            if (preventLastSelection) event.preventDefault();
        }}>Third</SegmentedControlItem
    >
</SegmentedControl>

<output data-segmented-value>{value}</output>
