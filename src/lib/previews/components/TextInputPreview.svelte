<script module lang="ts">
    import { Text } from "@lucide/svelte";

    export const icon = Text;
</script>

<script lang="ts">
    import {
        Check,
        Eye,
        EyeOff,
        Lock,
        Mail,
        Search,
        Sparkles,
        User,
        X,
    } from "@lucide/svelte";
    import { TextInput, textInputActionStyles } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let textOnly = $state("Borderless UI");
    let softInput = $state("");
    let elevatedInput = $state("");

    let smallVal = $state("Small query");
    let mediumVal = $state("Medium action");
    let largeVal = $state("Large statement");

    let searchVal = $state("Monochrome design");
    let mailVal = $state("colin@example.com");

    let password = $state("superSecret123!");
    let showPassword = $state(false);

    let clearableText = $state("Click X to clear me");

    let disabledVal = $state("Protected system value");
    let invalidVal = $state("invalid.email.format");

    let labeledVal = $state("Colin");
</script>

{#snippet searchIcon()}
    <Search />
{/snippet}

{#snippet mailIcon()}
    <Mail />
{/snippet}

{#snippet checkIcon()}
    <Check class="text-success-500" />
{/snippet}

{#snippet sparklesIcon()}
    <Sparkles class="text-accent-500" />
{/snippet}

{#snippet userIcon()}
    <User />
{/snippet}

{#snippet lockIcon()}
    <Lock />
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="TextInput"
        description="Borderless text entry element built with generous squircle curves, monotone background elevations, and flexible action icon slots."
        icon={Text}
    />

    <!-- Variants -->
    <PreviewSection
        title="Surface Variants"
        description="Soft on matching surfaces without shadows, and elevated with subtle depth."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Soft on Elevation 1" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        variant="soft"
                        placeholder="Soft input surface..."
                        bind:value={softInput}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Elevated on Elevation 0" bg="elevation-0" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        variant="elevated"
                        placeholder="Elevated surface with shadow..."
                        bind:value={elevatedInput}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes -->
    <PreviewSection
        title="Sizes"
        description="Harmonized typography and icon scaling across sizes."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        size="sm"
                        placeholder="Search..."
                        iconLeft={searchIcon}
                        bind:value={smallVal}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        size="md"
                        placeholder="Search..."
                        iconLeft={searchIcon}
                        bind:value={mediumVal}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        size="lg"
                        placeholder="Search..."
                        iconLeft={searchIcon}
                        bind:value={largeVal}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Icon Configurations -->
    <PreviewSection
        title="Icon Configurations"
        description="Clean spacing across text-only, leading icons, trailing icons, and dual icons."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Text Only" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        placeholder="Enter description..."
                        bind:value={textOnly}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Icon Left + Text" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        placeholder="Search workspace..."
                        iconLeft={searchIcon}
                        bind:value={searchVal}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Text + Icon Right" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        placeholder="AI Prompt..."
                        iconRight={sparklesIcon}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Dual Icons" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs">
                    <TextInput
                        placeholder="Account email..."
                        iconLeft={mailIcon}
                        iconRight={checkIcon}
                        bind:value={mailVal}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Interactive Action Icons -->
    <PreviewSection
        title="Interactive Action Icons"
        description="Clickable action buttons embedded cleanly inside the input slot without borders."
    >
        <PreviewGrid cols={2}>
            <!-- Password Toggle -->
            <PreviewCard label="Password Toggle Action" bg="elevation-1" class="h-36">
                <div class="w-full max-w-xs">
                    <TextInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password..."
                        iconLeft={lockIcon}
                        bind:value={password}
                    >
                        {#snippet iconRight()}
                            <button
                                type="button"
                                onclick={() => (showPassword = !showPassword)}
                                class={textInputActionStyles({ size: "md" })}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {#if showPassword}
                                    <EyeOff />
                                {:else}
                                    <Eye />
                                {/if}
                            </button>
                        {/snippet}
                    </TextInput>
                </div>
            </PreviewCard>

            <!-- Clear Action -->
            <PreviewCard label="Clear Action" bg="elevation-1" class="h-36">
                <div class="w-full max-w-xs">
                    <TextInput
                        placeholder="Type to clear..."
                        iconLeft={searchIcon}
                        bind:value={clearableText}
                    >
                        {#snippet iconRight()}
                            {#if clearableText}
                                <button
                                    type="button"
                                    onclick={() => (clearableText = "")}
                                    class={textInputActionStyles({ size: "md" })}
                                    aria-label="Clear input"
                                >
                                    <X />
                                </button>
                            {/if}
                        {/snippet}
                    </TextInput>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- States & Label -->
    <PreviewSection
        title="States & Label"
        description="Disabled with disableInteraction, invalid with danger tint, and labeled layout."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Disabled State" bg="elevation-1" class="h-36">
                <div class="w-full max-w-xs">
                    <TextInput
                        disabled
                        iconLeft={lockIcon}
                        bind:value={disabledVal}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Invalid" bg="elevation-1" class="h-36">
                <div class="w-full max-w-xs">
                    <TextInput
                        invalid
                        iconLeft={mailIcon}
                        bind:value={invalidVal}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="No Focus Ring" bg="elevation-1" class="h-36">
                <div class="w-full max-w-xs">
                    <TextInput
                        focusRing={false}
                        placeholder="Click me, no focus ring..."
                        iconLeft={userIcon}
                        bind:value={labeledVal}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
