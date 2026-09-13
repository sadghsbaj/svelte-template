<script module lang="ts">
    import { ListFilter } from "@lucide/svelte";

    export const icon = ListFilter;
</script>

<script lang="ts">
    import { Apple, Banana, Cherry, Citrus, Keyboard, Leaf } from "@lucide/svelte";
    import { Button, Select, type SelectOption } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const basicOptions: readonly SelectOption[] = [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "cherry", label: "Cherry" },
    ];
    const iconOptions: readonly SelectOption[] = [
        { value: "apple", label: "Apple", icon: Apple },
        { value: "banana", label: "Banana", icon: Banana },
        { value: "cherry", label: "Cherry", icon: Cherry },
        { value: "citrus", label: "Citrus", icon: Citrus },
    ];
    const disabledOptions: readonly SelectOption[] = [
        { value: "mint", label: "Mint", icon: Leaf },
        { value: "basil", label: "Basil (unavailable)", icon: Leaf, disabled: true },
        { value: "sage", label: "Sage", icon: Leaf },
    ];
    const detailedOptions: readonly SelectOption[] = [
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
    ];

    let basicValue = $state<string>();
    let iconValue = $state("banana");
    let keyboardValue = $state<string>();
    let disabledOptionValue = $state("mint");
    let detailedValue = $state("cherry");
    let elevatedValue = $state("banana");
    let formValue = $state<string>();
</script>

<PreviewPage>
    <PreviewHeader
        title="Select"
        description="Data-driven single selection with roving keyboard focus, typeahead, and native form semantics."
        icon={ListFilter}
    />

    <PreviewSection
        title="Basic"
        description="The selected value stays bindable without expanding the rendering API."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Placeholder" bg="elevation-1" class="h-36">
                <div class="flex flex-col items-center gap-3">
                    <Select options={basicOptions} bind:value={basicValue} class="w-52" />
                    <span class="text-xs text-weak">value: {basicValue ?? "undefined"}</span>
                </div>
            </PreviewCard>
            <PreviewCard label="Icons + selected value" bg="elevation-1" class="h-36">
                <Select options={iconOptions} bind:value={iconValue} class="w-52" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Descriptions + Sections"
        description="Secondary text and grouped options add hierarchy without changing selection behavior."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Soft" bg="elevation-1" class="h-40">
                <Select options={detailedOptions} bind:value={detailedValue} class="w-64" />
            </PreviewCard>
            <PreviewCard label="Elevated on elevation 0" bg="elevation-0" class="h-40">
                <Select
                    options={detailedOptions}
                    bind:value={elevatedValue}
                    variant="elevated"
                    class="w-64"
                />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Sizes">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-28">
                <Select options={basicOptions} value="apple" size="sm" class="w-44" />
            </PreviewCard>
            <PreviewCard label="Medium" bg="elevation-1" class="h-28">
                <Select options={basicOptions} value="banana" size="md" class="w-48" />
            </PreviewCard>
            <PreviewCard label="Large" bg="elevation-1" class="h-28">
                <Select options={basicOptions} value="cherry" size="lg" class="w-52" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Disabled States">
        <PreviewGrid cols={2}>
            <PreviewCard label="Disabled option" bg="elevation-1" class="h-32">
                <Select options={disabledOptions} bind:value={disabledOptionValue} class="w-56" />
            </PreviewCard>
            <PreviewCard label="Disabled select" bg="elevation-1" class="h-32">
                <Select options={basicOptions} value="banana" disabled class="w-52" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Keyboard + Typeahead"
        description="Arrow keys open and move, Home/End jump, and typing focuses the next matching enabled option."
    >
        <PreviewCard label="Try A, B, or C" bg="elevation-1" class="h-36">
            <div class="flex items-center gap-3">
                <Keyboard class="text-weak" size={18} />
                <Select options={iconOptions} bind:value={keyboardValue} class="w-56" />
            </div>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection
        title="Form"
        description="Required validation and submission use a visually hidden native select proxy."
    >
        <PreviewCard label="Required field" bg="elevation-1" class="h-40">
            <form class="flex items-center gap-3" onsubmit={(event) => event.preventDefault()}>
                <Select
                    options={basicOptions}
                    bind:value={formValue}
                    name="preview-fruit"
                    required
                    placeholder="Required fruit"
                    class="w-52"
                />
                <Button type="submit" variant="soft" color="accent" size="md">Submit</Button>
            </form>
        </PreviewCard>
    </PreviewSection>
</PreviewPage>
