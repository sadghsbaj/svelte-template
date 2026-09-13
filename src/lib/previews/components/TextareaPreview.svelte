<script module lang="ts">
    import { AlignLeft } from "@lucide/svelte";

    export const icon = AlignLeft;
</script>

<script lang="ts">
    import {
        Check,
        Copy,
        CornerDownLeft,
        FileText,
        Mic,
        Paperclip,
        Sparkles,
    } from "@lucide/svelte";
    import { Textarea } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let softVal = $state("");
    let elevatedVal = $state("");

    let smVal = $state("Compact query or brief note.");
    let mdVal = $state("Standard textarea size with comfortable line-height for multiline editing.");
    let lgVal = $state("Large statement or prominent input for editorial workflows.");

    let autoResizeVal = $state(
        "Try typing more lines here or pressing Enter...\nWatch the textarea smoothly grow and shrink without layout jumps or flickering!"
    );

    let promptVal = $state("");
    let copied = $state(false);
    let noteVal = $state("Antigravity design system delivers borderless, monotone surfaces.");

    let invalidVal = $state("This content exceeds moderation limits or contains errors.");
    let disabledVal = $state("This field is read-only and interactions are completely disabled.");
    let countedVal = $state("Building borderless, responsive components in Svelte 5.");
    let noFocusRingVal = $state("This textarea has no canvas focus ring when focused.");

    function handleCopy(): void {
        if (!noteVal) return;
        navigator.clipboard?.writeText(noteVal);
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 1800);
    }
</script>

{#snippet sparklesIcon()}
    <Sparkles class="text-accent-500" />
{/snippet}

{#snippet fileIcon()}
    <FileText />
{/snippet}

{#snippet copyAction()}
    <button
        type="button"
        class="size-24px rounded-full squircle-soft flex-center shrink-0 text-weak hover:text-strong hover:bg-base-soft-2 active:scale-93 cursor-pointer select-none t:(bg-150-quad-out scale-150-quad-out)"
        onclick={handleCopy}
        aria-label="Copy text"
        title="Copy"
    >
        {#if copied}
            <Check class="size-14px text-success-500" />
        {:else}
            <Copy class="size-14px" />
        {/if}
    </button>
{/snippet}

{#snippet promptFooter()}
    <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-1.5">
            <button
                type="button"
                class="size-28px rounded-full squircle-soft flex-center text-weak hover:text-strong hover:bg-base-soft-2 active:scale-93 cursor-pointer select-none t:(bg-150-quad-out scale-150-quad-out)"
                aria-label="Attach file"
                title="Attach file"
            >
                <Paperclip class="size-16px" />
            </button>
            <button
                type="button"
                class="size-28px rounded-full squircle-soft flex-center text-weak hover:text-strong hover:bg-base-soft-2 active:scale-93 cursor-pointer select-none t:(bg-150-quad-out scale-150-quad-out)"
                aria-label="Voice input"
                title="Voice input"
            >
                <Mic class="size-16px" />
            </button>
        </div>

        <div class="flex items-center gap-2">
            <span class="text-xs text-weak font-500 tabular-nums">
                {promptVal.length} chars
            </span>
            <button
                type="button"
                class="size-28px rounded-full squircle-soft flex-center bg-accent-solid-1 text-white hover:bg-accent-solid-2 active:scale-93 t:(bg-150-quad-out scale-150-quad-out opacity-150-quad-out) disabled:opacity-40"
                disabled={!promptVal.trim()}
                aria-label="Send prompt"
                title="Send"
            >
                <CornerDownLeft class="size-14px stroke-[2.25px]" />
            </button>
        </div>
    </div>
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Textarea"
        description="Multiline borderless text surface with monotone elevation, squircle curves, native-feeling caret hit-testing, and seamless autoResize support."
        icon={AlignLeft}
    />

    <!-- Surface Variants -->
    <PreviewSection
        title="Surface Variants"
        description="Soft sits on flat backgrounds, while Elevated floats with subtle shadow depth."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Soft on Elevation 1" bg="elevation-1" class="min-h-48">
                <div class="w-full max-w-sm">
                    <Textarea
                        variant="soft"
                        placeholder="Write something in soft surface..."
                        bind:value={softVal}
                        rows={3}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Elevated on Elevation 0" bg="elevation-0" class="min-h-48">
                <div class="w-full max-w-sm">
                    <Textarea
                        variant="elevated"
                        placeholder="Write something in elevated surface..."
                        bind:value={elevatedVal}
                        rows={3}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Auto-Resize & AI Prompt Box -->
    <PreviewSection
        title="Auto-Resize & AI Prompt Box"
        description="Expands dynamically as you type without flickering, and supports bottom footer toolbars for chat inputs."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Dynamic Auto-Resize" bg="elevation-0" class="min-h-56">
                <div class="w-full max-w-sm">
                    <Textarea
                        variant="soft"
                        autoResize={{ minRows: 2, maxRows: 7 }}
                        bind:value={autoResizeVal}
                        placeholder="Type or paste multiple lines..."
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="AI Chat Prompt Box" bg="elevation-0" class="min-h-56">
                <div class="w-full max-w-sm">
                    <Textarea
                        variant="soft"
                        autoResize={{ minRows: 1, maxRows: 6 }}
                        iconLeft={sparklesIcon}
                        footer={promptFooter}
                        placeholder="Ask anything or generate code..."
                        bind:value={promptVal}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes -->
    <PreviewSection
        title="Sizes"
        description="Calibrated font sizes, line heights, and paddings matching TextInput."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-0" class="min-h-44">
                <div class="w-full">
                    <Textarea size="sm" rows={2} bind:value={smVal} />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-0" class="min-h-44">
                <div class="w-full">
                    <Textarea size="md" rows={2} bind:value={mdVal} />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-0" class="min-h-44">
                <div class="w-full">
                    <Textarea size="lg" rows={2} bind:value={lgVal} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Actions & Character Counter -->
    <PreviewSection
        title="Actions & Features"
        description="Action buttons, character count, and optional focus ring suppression."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Action Button" bg="elevation-0" class="min-h-48">
                <div class="w-full">
                    <Textarea
                        variant="elevated"
                        iconLeft={fileIcon}
                        iconRight={copyAction}
                        bind:value={noteVal}
                        rows={3}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Character Counter" bg="elevation-0" class="min-h-48">
                <div class="w-full">
                    <Textarea
                        maxlength={120}
                        showCount={true}
                        bind:value={countedVal}
                        rows={3}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="No Focus Ring" bg="elevation-0" class="min-h-48">
                <div class="w-full">
                    <Textarea
                        focusRing={false}
                        placeholder="No focus ring shown here..."
                        bind:value={noFocusRingVal}
                        rows={3}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Validation & Disabled States -->
    <PreviewSection
        title="States"
        description="Invalid and disabled states following the design system tokens."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Invalid / Error State" bg="elevation-0" class="min-h-48">
                <div class="w-full max-w-sm">
                    <Textarea
                        invalid={true}
                        bind:value={invalidVal}
                        rows={2}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Disabled State" bg="elevation-0" class="min-h-48">
                <div class="w-full max-w-sm">
                    <Textarea
                        disabled={true}
                        bind:value={disabledVal}
                        rows={2}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
