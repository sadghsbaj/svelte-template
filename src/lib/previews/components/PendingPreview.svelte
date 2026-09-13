<script module lang="ts">
    import { Radio } from "@lucide/svelte";

    export const icon = Radio;
</script>

<script lang="ts">
    import { pending, type PendingColor } from "$attachments";
    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let isFlowActive = $state(false);
    let flowColor = $state<PendingColor>("accent");
    let flowLabel = $state("Trigger Flow");

    async function runFlow(): Promise<void> {
        if (isFlowActive) return;
        isFlowActive = true;
        flowColor = "accent";
        flowLabel = "Saving...";

        await new Promise((r) => setTimeout(r, 1400));
        flowColor = "success";
        flowLabel = "Saved!";

        await new Promise((r) => setTimeout(r, 1000));
        isFlowActive = false;
        flowColor = "accent";
        flowLabel = "Trigger Flow";
    }

    function handleKeydown(e: KeyboardEvent): void {
        if (e.key !== "Enter" && e.key !== " ") {
            return;
        }
        e.preventDefault();
        runFlow();
    }
</script>

<PreviewPage>
    <PreviewHeader
        title="Pending"
        description="Form-fitting, breathing glow ring for async loading states with built-in click suppression."
        icon={Radio}
    />

    <!-- Colors -->
    <PreviewSection
        title="Color Themes"
        description="Subtle pulsing halo across accent, monotone base, success, and danger."
    >
        <PreviewGrid cols={4}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div
                    class="w-24 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, color: "accent" })}
                >
                    <span class="text-xs font-600 text-strong">Accent</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div
                    class="w-24 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, color: "base" })}
                >
                    <span class="text-xs font-600 text-strong">Base</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Success" bg="elevation-1" class="h-32">
                <div
                    class="w-24 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, color: "success" })}
                >
                    <span class="text-xs font-600 text-strong">Success</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-32">
                <div
                    class="w-24 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, color: "danger" })}
                >
                    <span class="text-xs font-600 text-strong">Danger</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Geometry & Contours -->
    <PreviewSection
        title="Geometry & Shapes"
        description="Direct host animation conforms smoothly to squircle, pill, and circular contours."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Squircle Card" bg="elevation-1" class="h-32">
                <div
                    class="w-28 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, color: "accent" })}
                >
                    <span class="text-xs font-600 text-strong">Squircle</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Pill Badge" bg="elevation-1" class="h-32">
                <div
                    class="px-5 py-2 rounded-full bg-elevation-2 flex-center shadow-xs select-none cursor-wait"
                    {@attach pending({ active: true, color: "accent" })}
                >
                    <span class="text-xs font-600 text-strong">Capsule</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Circle" bg="elevation-1" class="h-32">
                <div
                    class="size-12 rounded-full bg-elevation-2 flex-center shadow-xs select-none cursor-wait"
                    {@attach pending({ active: true, color: "accent" })}
                >
                    <span class="text-xs font-600 text-strong">Circle</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- State Transition Simulation -->
    <PreviewSection
        title="Interactive Flow"
        description="Seamless color transition from accent during loading to success upon resolution."
    >
        <PreviewCard label="Click to Simulate" bg="elevation-1" class="h-32">
            <div
                role="button"
                tabindex="0"
                class="w-36 h-11 flex-center rounded-2xl bg-elevation-2 hover:bg-elevation-3 text-strong text-xs font-600 shadow-xs squircle-smooth select-none active:scale-97 t-colors cursor-pointer text-center"
                onclick={runFlow}
                onkeydown={handleKeydown}
                {@attach pending({ active: isFlowActive, color: flowColor })}
            >
                {flowLabel}
            </div>
        </PreviewCard>
    </PreviewSection>

    <!-- Headless Operation -->
    <PreviewSection
        title="Headless Operation"
        description="Preserves full accessibility and click suppression without the visual pulse ring."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Visual Pulse" bg="elevation-1" class="h-32">
                <div
                    class="w-32 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, ring: true })}
                >
                    <span class="text-xs font-600 text-strong">Visual Ring</span>
                </div>
            </PreviewCard>

            <PreviewCard label="Headless" bg="elevation-1" class="h-32">
                <div
                    class="w-32 h-12 rounded-2xl bg-elevation-2 flex-center shadow-xs squircle-smooth select-none cursor-wait"
                    {@attach pending({ active: true, ring: false })}
                >
                    <span class="text-xs font-600 text-strong">Headless</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
