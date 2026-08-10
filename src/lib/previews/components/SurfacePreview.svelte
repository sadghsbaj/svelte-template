<script module lang="ts">
    import { Layers } from "@lucide/svelte";

    export const icon = Layers;
</script>

<script lang="ts">
    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Surface"
        description="Basis-Container für Elevation-Stufen, Schatten und Abrundungen ohne redundante CSS-Klassen."
        icon={Layers}
    />

    <!-- Section 1: Elevation Stufen auf Checkerboard -->
    <PreviewSection
        title="Elevation Levels"
        description="Kontrast-Vorschau der Ebenen (Elevation 0, 1, 2) auf Checkerboard-Muster."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Elevation 0" checkerboard>
                <div
                    class="p-5 rounded-2xl bg-elevation-0 shadow-xs squircle-smooth w-full flex items-center justify-center"
                >
                    <span class="text-xs text-weak font-500">Surface (Elevation 0)</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Elevation 1" checkerboard>
                <div
                    class="p-5 rounded-2xl bg-elevation-1 shadow-sm squircle-smooth w-full flex items-center justify-center"
                >
                    <span class="text-xs text-strong font-500">Surface (Elevation 1)</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Elevation 2" checkerboard>
                <div
                    class="p-5 rounded-2xl bg-elevation-2 shadow-md squircle-smooth w-full flex items-center justify-center"
                >
                    <span class="text-xs text-strong font-600">Surface (Elevation 2)</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Section 2: Hintergrund-Kontrast (auf App Base) -->
    <PreviewSection
        title="Hintergrund-Kontrast (Elevation 0 vs 1)"
        description="Darstellung von Elevation-1 und 2 direkt auf Elevation-0 Hintergrund."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Card auf Elevation-0" bg="elevation-0">
                <div
                    class="p-5 rounded-2xl bg-elevation-1 shadow-sm squircle-smooth w-full text-center"
                >
                    <span class="text-xs text-strong font-500">Elevation 1 auf Elevation 0</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Card auf Elevation-0" bg="elevation-0">
                <div
                    class="p-5 rounded-2xl bg-elevation-2 shadow-md squircle-smooth w-full text-center"
                >
                    <span class="text-xs text-strong font-600">Elevation 2 auf Elevation 0</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Section 3: Interaktivität -->
    <PreviewSection
        title="Interaktive Surface"
        description="Container mit Hover-Effekt und Active-Scale Transformation."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Clickable Surface" checkerboard>
                <div
                    tabindex="0"
                    role="button"
                    class="p-5 rounded-2xl bg-elevation-1 shadow-sm hover:bg-elevation-2 active:scale-97 t:(bg-180-quad-out scale-180-quad-out) squircle-smooth w-full text-center cursor-pointer select-none"
                >
                    <span class="text-xs text-accent-500 font-600">Clickable Surface</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Interactive Active State" checkerboard>
                <div
                    class="p-5 rounded-2xl bg-accent-500/10 shadow-xs squircle-smooth w-full text-center"
                >
                    <span class="text-xs text-accent-500 font-600">Active Selected Surface</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
