<script module lang="ts">
    import { MousePointerClick } from "@lucide/svelte";

    export const icon = MousePointerClick;
</script>

<script lang="ts">
    import { Loader2, Plus, Sparkles, Trash2 } from "@lucide/svelte";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Button"
        description="Standard Action-Element für Benutzerinteraktionen in verschiedenen Varianten, Größen und Zuständen."
        icon={MousePointerClick}
    />

    <!-- Section 1: Varianten -->
    <PreviewSection title="Varianten" description="Verfügbare visuelle Hierarchien für Aktionen.">
        <PreviewGrid cols={4}>
            <PreviewCard label="Primary">
                <button
                    type="button"
                    class="px-4 py-2.5 rounded-2xl bg-accent-500 text-white font-500 text-sm flex items-center gap-2 shadow-xs hover:bg-accent-600 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <Plus size={16} />
                    <span>Primary</span>
                </button>
            </PreviewCard>

            <PreviewCard label="Secondary">
                <button
                    type="button"
                    class="px-4 py-2.5 rounded-2xl bg-elevation-2 text-strong font-500 text-sm flex items-center gap-2 shadow-xs hover:bg-elevation-2/80 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <Sparkles size={16} class="text-accent-500" />
                    <span>Secondary</span>
                </button>
            </PreviewCard>

            <PreviewCard label="Danger">
                <button
                    type="button"
                    class="px-4 py-2.5 rounded-2xl bg-danger-500/15 text-danger-600 dark:text-danger-400 font-500 text-sm flex items-center gap-2 hover:bg-danger-500/25 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <Trash2 size={16} />
                    <span>Danger</span>
                </button>
            </PreviewCard>

            <PreviewCard label="Ghost">
                <button
                    type="button"
                    class="px-4 py-2.5 rounded-2xl text-weak font-500 text-sm flex items-center gap-2 hover:text-strong hover:bg-elevation-2/60 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <span>Ghost Action</span>
                </button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Section 2: Größen -->
    <PreviewSection title="Größen" description="Abgestimmte Höhen und Paddin-Stufen.">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small (sm)">
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-xl bg-accent-500 text-white font-500 text-xs flex items-center gap-1.5 shadow-xs hover:bg-accent-600 active:scale-97 t:(bg-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <Plus size={14} />
                    <span>Small</span>
                </button>
            </PreviewCard>

            <PreviewCard label="Medium (md)">
                <button
                    type="button"
                    class="px-4 py-2.5 rounded-2xl bg-accent-500 text-white font-500 text-sm flex items-center gap-2 shadow-xs hover:bg-accent-600 active:scale-97 t:(bg-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <Plus size={16} />
                    <span>Medium</span>
                </button>
            </PreviewCard>

            <PreviewCard label="Large (lg)">
                <button
                    type="button"
                    class="px-5 py-3 rounded-2xl bg-accent-500 text-white font-600 text-base flex items-center gap-2.5 shadow-xs hover:bg-accent-600 active:scale-97 t:(bg-180-quad-out scale-180-quad-out) squircle-smooth"
                >
                    <Plus size={18} />
                    <span>Large</span>
                </button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Section 3: Zustände -->
    <PreviewSection title="Zustände" description="Deaktivierter und Lade-Zustand.">
        <PreviewGrid cols={2}>
            <PreviewCard label="Disabled">
                <button
                    type="button"
                    disabled
                    class="px-4 py-2.5 rounded-2xl bg-accent-500 text-white font-500 text-sm flex items-center gap-2 squircle-smooth opacity-50 cursor-not-allowed"
                >
                    <span>Disabled Button</span>
                </button>
            </PreviewCard>

            <PreviewCard label="Loading">
                <button
                    type="button"
                    disabled
                    class="px-4 py-2.5 rounded-2xl bg-accent-500 text-white font-500 text-sm flex items-center gap-2 squircle-smooth opacity-80 cursor-wait"
                >
                    <Loader2 size={16} class="animate-spin" />
                    <span>Speichern...</span>
                </button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
