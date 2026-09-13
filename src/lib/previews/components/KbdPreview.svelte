<script module lang="ts">
    import { Command } from "@lucide/svelte";

    export const icon = Command;
</script>

<script lang="ts">
    import { Sparkles, Type } from "@lucide/svelte";
    import { Button, Kbd, type KbdFormat } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let activeFormat = $state<KbdFormat>("symbols");
</script>

<PreviewPage>
    <PreviewHeader
        title="Keyboard Shortcut (Kbd)"
        description="Language-neutral shortcut badges with a universal ⌘ primary modifier and compact Lucide key symbols."
        icon={Command}
    />

    <!-- Format Switcher Section -->
    <PreviewSection
        title="Rendering Format"
        description="Universal symbol-first display (standard across Linear, Raycast, Figma) vs. optional localized text format."
    >
        <div class="flex items-center gap-2 mb-4">
            <Button
                variant={activeFormat === "symbols" ? "solid" : "soft"}
                color="accent"
                size="sm"
                onclick={() => (activeFormat = "symbols")}
            >
                {#snippet iconLeft()}
                    <Sparkles size={14} />
                {/snippet}
                Symbols (Default)
            </Button>
            <Button
                variant={activeFormat === "text" ? "solid" : "soft"}
                color="base"
                size="sm"
                onclick={() => (activeFormat = "text")}
            >
                {#snippet iconLeft()}
                    <Type size={14} />
                {/snippet}
                Text Labels
            </Button>
        </div>

        <PreviewGrid cols={4}>
            <PreviewCard label="Command Palette" bg="elevation-1" class="h-32">
                <div class="flex-center flex-col gap-2">
                    <Kbd combo="Mod+Shift+P" format={activeFormat} size="lg" />
                    <span class="text-xs text-weak font-sans">Mod+Shift+P</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Quick Search" bg="elevation-1" class="h-32">
                <div class="flex-center flex-col gap-2">
                    <Kbd combo="Mod+K" format={activeFormat} size="lg" />
                    <span class="text-xs text-weak font-sans">Mod+K</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Multi-Modifier" bg="elevation-1" class="h-32">
                <div class="flex-center flex-col gap-2">
                    <Kbd combo="Mod+Alt+Del" format={activeFormat} size="lg" />
                    <span class="text-xs text-weak font-sans">Mod+Alt+Del</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Action Combo" bg="elevation-1" class="h-32">
                <div class="flex-center flex-col gap-2">
                    <Kbd combo="Mod+Enter" format={activeFormat} size="lg" />
                    <span class="text-xs text-weak font-sans">Mod+Enter</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Visual Variants -->
    <PreviewSection
        title="Surface Variants"
        description="Pure monotone surface contrast without borders across soft, elevated, and ghost styles."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Soft (Default)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-4">
                    <Kbd combo="Mod+K" variant="soft" format={activeFormat} />
                    <Kbd combo="Shift+Tab" variant="soft" format={activeFormat} />
                </div>
            </PreviewCard>

            <PreviewCard label="Elevated" bg="elevation-0" class="h-32">
                <div class="flex items-center gap-4">
                    <Kbd combo="Mod+K" variant="elevated" format={activeFormat} />
                    <Kbd combo="Shift+Tab" variant="elevated" format={activeFormat} />
                </div>
            </PreviewCard>

            <PreviewCard label="Ghost" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-4">
                    <Kbd combo="Mod+K" variant="ghost" format={activeFormat} />
                    <Kbd combo="Shift+Tab" variant="ghost" format={activeFormat} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes -->
    <PreviewSection
        title="Sizes"
        description="Carefully calibrated dimensions maintaining squircle-smooth curves."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small (20px)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-3">
                    <Kbd combo="Mod+K" size="sm" format={activeFormat} />
                    <Kbd key="Esc" size="sm" format={activeFormat} />
                    <Kbd key="P" size="sm" format={activeFormat} />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium (24px, Default)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-3">
                    <Kbd combo="Mod+K" size="md" format={activeFormat} />
                    <Kbd key="Esc" size="md" format={activeFormat} />
                    <Kbd key="P" size="md" format={activeFormat} />
                </div>
            </PreviewCard>

            <PreviewCard label="Large (28px)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-3">
                    <Kbd combo="Mod+K" size="lg" format={activeFormat} />
                    <Kbd key="Esc" size="lg" format={activeFormat} />
                    <Kbd key="P" size="lg" format={activeFormat} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Arrow & Action Keys -->
    <PreviewSection
        title="Arrow & Action Keys"
        description="Unified Lucide SVG vectors replacing inconsistent Unicode arrows and symbols."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Directional Arrows" bg="elevation-1" class="h-36">
                <div class="flex-center flex-col gap-2">
                    <Kbd key="ArrowUp" format={activeFormat} />
                    <div class="flex items-center gap-2">
                        <Kbd key="ArrowLeft" format={activeFormat} />
                        <Kbd key="ArrowDown" format={activeFormat} />
                        <Kbd key="ArrowRight" format={activeFormat} />
                    </div>
                </div>
            </PreviewCard>

            <PreviewCard label="Actions & Special Keys" bg="elevation-1" class="h-36">
                <div class="flex-center flex-wrap gap-2.5">
                    <Kbd key="Enter" format={activeFormat} />
                    <Kbd key="Backspace" format={activeFormat} />
                    <Kbd key="Tab" format={activeFormat} />
                    <Kbd key="Space" format={activeFormat} />
                    <Kbd key="PageUp" format={activeFormat} />
                    <Kbd key="PageDown" format={activeFormat} />
                    <Kbd key="Fn" format={activeFormat} />
                    <Kbd key="Esc" format={activeFormat} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Media & System Shortcuts -->
    <PreviewSection
        title="Media, System & Editing Keys"
        description="Full coverage of Western keyboard keys including CapsLock, Volume, Media, Brightness, and History actions."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Media & Audio" bg="elevation-1" class="h-36">
                <div class="flex-center flex-wrap gap-2.5">
                    <Kbd key="volumeup" format={activeFormat} />
                    <Kbd key="volumedown" format={activeFormat} />
                    <Kbd key="mute" format={activeFormat} />
                    <Kbd key="play" format={activeFormat} />
                    <Kbd key="pause" format={activeFormat} />
                    <Kbd key="mic" format={activeFormat} />
                </div>
            </PreviewCard>

            <PreviewCard label="System & Navigation" bg="elevation-1" class="h-36">
                <div class="flex-center flex-wrap gap-2.5">
                    <Kbd key="capslock" format={activeFormat} />
                    <Kbd key="sun" format={activeFormat} />
                    <Kbd key="moon" format={activeFormat} />
                    <Kbd key="search" format={activeFormat} />
                    <Kbd key="undo" format={activeFormat} />
                    <Kbd key="redo" format={activeFormat} />
                    <Kbd key="power" format={activeFormat} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Separators -->
    <PreviewSection
        title="Separators"
        description="Clean gap spacing by default, with optional explicit separator character."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Default (Gap Spacing)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-4">
                    <Kbd combo="Mod+Alt+Del" format={activeFormat} />
                    <Kbd combo="Mod+Shift+P" format={activeFormat} />
                </div>
            </PreviewCard>

            <PreviewCard label="Explicit Separator (+)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-4">
                    <Kbd combo="Mod+Alt+Del" separator="+" format={activeFormat} />
                    <Kbd combo="Mod+Shift+P" separator="+" format={activeFormat} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Elevation Contexts -->
    <PreviewSection
        title="Elevation Harmony"
        description="The soft monotone background adapts cleanly across all elevation surface levels."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Elevation 0" bg="elevation-0" class="h-32">
                <Kbd combo="Mod+Shift+P" format={activeFormat} />
            </PreviewCard>

            <PreviewCard label="Elevation 1" bg="elevation-1" class="h-32">
                <Kbd combo="Mod+Shift+P" format={activeFormat} />
            </PreviewCard>

            <PreviewCard label="Elevation 2" bg="elevation-2" class="h-32">
                <Kbd combo="Mod+Shift+P" format={activeFormat} />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
