<script module lang="ts">
    import { ListFilterPlus } from "@lucide/svelte";

    export const icon = ListFilterPlus;
</script>

<script lang="ts">
    import { Apple, Banana, Cherry, Citrus, Search } from "@lucide/svelte";
    import { Combobox, type ComboboxOption } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const options: readonly ComboboxOption[] = [
        {
            value: "apple",
            label: "Apple",
            description: "Crisp and lightly sweet",
            section: "Orchard fruit",
            icon: Apple,
        },
        {
            value: "cherry",
            label: "Cherry",
            description: "Bright, tart, and juicy",
            section: "Orchard fruit",
            icon: Cherry,
        },
        {
            value: "banana",
            label: "Banana",
            description: "Creamy with a mellow sweetness",
            section: "Tropical fruit",
            icon: Banana,
        },
        {
            value: "citrus",
            label: "Citrus",
            description: "Fresh with a sharp finish",
            section: "Tropical fruit",
            icon: Citrus,
        },
        {
            value: "unavailable",
            label: "Unavailable fruit",
            description: "Temporarily out of season",
            section: "Seasonal",
            disabled: true,
        },
    ];

    let value = $state<string>();
    let query = $state<string>();
    let elevatedValue = $state("banana");
</script>

<PreviewPage>
    <PreviewHeader
        title="Combobox"
        description="TextInput composition with filtered single selection and input-owned focus."
        icon={ListFilterPlus}
    />

    <PreviewSection
        title="Search + Select"
        description="Type to filter, use Arrow keys without leaving the input, then commit with Enter or pointer."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Soft" bg="elevation-1" class="h-40">
                <div class="flex w-60 flex-col gap-2">
                    <Combobox
                        {options}
                        bind:value
                        bind:inputValue={query}
                        placeholder="Find a fruit"
                        aria-label="Fruit"
                        class="w-full"
                    />
                    <span class="text-xs text-weak">
                        value: {value ?? "undefined"}, query: {query ?? ""}
                    </span>
                </div>
            </PreviewCard>
            <PreviewCard label="Elevated on elevation 0" bg="elevation-0" class="h-40">
                <Combobox {options} bind:value={elevatedValue} variant="elevated" class="w-60" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Sizes + States">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-28">
                <Combobox {options} size="sm" placeholder="Search" class="w-44" />
            </PreviewCard>
            <PreviewCard label="Large invalid" bg="elevation-1" class="h-28">
                <Combobox {options} size="lg" invalid value="cherry" class="w-52" />
            </PreviewCard>
            <PreviewCard label="Disabled" bg="elevation-1" class="h-28">
                <Combobox {options} disabled value="apple" class="w-48" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Custom Filter"
        description="Callbacks can replace the default contains match."
    >
        <PreviewCard label="Prefix-only labels" bg="elevation-1" class="h-32">
            <div class="flex items-center gap-3">
                <Search class="text-weak" size={18} />
                <Combobox
                    {options}
                    filter={(option, nextQuery) =>
                        option.label.toLowerCase().startsWith(nextQuery.trim().toLowerCase())}
                    placeholder="Starts with..."
                    class="w-56"
                />
            </div>
        </PreviewCard>
    </PreviewSection>
</PreviewPage>
