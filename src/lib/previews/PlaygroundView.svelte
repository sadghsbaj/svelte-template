<script lang="ts">
    import { Check, FlaskConical, Play, RefreshCw } from "@lucide/svelte";
    import { pending, type PendingColor } from "$attachments";
    import { CloseButton } from "$components";

    import { viewState } from "$views/view.svelte";

    let isPending = $state(true);
    let selectedColor = $state<PendingColor>("accent");

    let isAsyncRunning = $state(false);
    let asyncColor = $state<PendingColor>("accent");
    let asyncSuccess = $state(false);

    async function triggerAsyncFlow(): Promise<void> {
        if (isAsyncRunning) return;
        isAsyncRunning = true;
        asyncSuccess = false;
        asyncColor = "accent";

        await new Promise((r) => setTimeout(r, 1600));

        asyncColor = "success";
        asyncSuccess = true;

        await new Promise((r) => setTimeout(r, 1000));
        isAsyncRunning = false;
        asyncSuccess = false;
        asyncColor = "accent";
    }

    const COLORS: PendingColor[] = ["accent", "success", "danger", "base"];
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-4xl md:p-10 md:pb-28">
    <!-- Header -->
    <header class="flex flex-col gap-1 select-none">
        <div class="flex items-center gap-3">
            <div
                class="p-2.5 rounded-2xl bg-elevation-1 text-accent-500 shadow-xs squircle-smooth flex-center shrink-0"
            >
                <FlaskConical size={22} />
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-700">
                {viewState.activeLabel}
            </h1>
        </div>
        <p class="text-sm text-weak mt-1">
            Freeform sandbox for testing the new <code class="text-accent-500 font-mono font-600">pending</code> pulsing ring attachment and components.
        </p>
    </header>

    <!-- Global Pending State Controls -->
    <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 shadow-xs squircle-smooth">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-elevation-2">
            <div class="flex items-center gap-3">
                <span class="text-sm font-600 text-strong">Toggle Ring Pulse:</span>
                <button
                    type="button"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-600 cursor-pointer active:scale-95 t-colors {isPending
                        ? 'bg-accent-500 text-white'
                        : 'bg-elevation-2 text-weak hover:text-strong'}"
                    onclick={() => (isPending = !isPending)}
                >
                    {isPending ? "Pulse: ON" : "Pulse: OFF"}
                </button>
            </div>

            <!-- Flow Trigger Button -->
            <button
                type="button"
                class="px-4 py-2 rounded-xl bg-elevation-2 hover:bg-elevation-3 text-strong text-xs font-600 flex items-center gap-2 cursor-pointer active:scale-95 t-colors shadow-2xs"
                onclick={triggerAsyncFlow}
                {@attach pending({ active: isAsyncRunning, color: asyncColor })}
            >
                {#if asyncSuccess}
                    <Check size={14} class="text-success-500" />
                    <span>Saved successfully!</span>
                {:else if isAsyncRunning}
                    <RefreshCw size={14} class="animate-spin text-accent-500" />
                    <span>Saving changes...</span>
                {:else}
                    <Play size={14} />
                    <span>Simulate Async Flow (Accent -> Success)</span>
                {/if}
            </button>
        </div>

        <!-- Color Selector -->
        <div class="flex flex-col gap-2">
            <span class="text-xs text-weak font-500">Pulsing Ring Color Theme:</span>
            <div class="flex flex-wrap gap-2">
                {#each COLORS as c (c)}
                    <button
                        type="button"
                        class="px-3.5 py-1.5 rounded-xl text-xs font-500 capitalize cursor-pointer active:scale-95 t-colors {selectedColor === c
                            ? 'bg-accent-500/15 text-accent-500 font-600'
                            : 'bg-elevation-2 text-weak hover:text-strong'}"
                        onclick={() => (selectedColor = c)}
                    >
                        {c}
                    </button>
                {/each}
            </div>
        </div>
    </section>

    <!-- Attachment Test Targets (Form-Fitting Snug Rings) -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. Interactive Squircle Button -->
        <div class="p-6 rounded-3xl bg-elevation-1 flex-center flex-col gap-4 min-h-[160px] shadow-xs squircle-smooth">
            <span class="text-xs text-weak font-500">Squircle Button</span>
            <button
                type="button"
                class="px-5 py-2.5 rounded-xl bg-elevation-2 hover:bg-elevation-3 text-strong text-xs font-600 cursor-pointer active:scale-95 t-colors shadow-xs squircle-smooth"
                {@attach pending({ active: isPending, color: selectedColor })}
            >
                Primary Button
            </button>
        </div>

        <!-- 2. Circular CloseButton -->
        <div class="p-6 rounded-3xl bg-elevation-1 flex-center flex-col gap-4 min-h-[160px] shadow-xs squircle-smooth">
            <span class="text-xs text-weak font-500">Circular CloseButtons</span>
            <div class="flex items-center gap-6">
                <CloseButton
                    variant="solid"
                    size="md"
                    {@attach pending({ active: isPending, color: selectedColor })}
                />
                <CloseButton
                    variant="ghost"
                    size="md"
                    {@attach pending({ active: isPending, color: selectedColor })}
                />
            </div>
        </div>

        <!-- 3. Rounded Card Surface -->
        <div
            class="p-6 rounded-3xl bg-elevation-2 flex flex-col justify-between gap-3 min-h-[160px] shadow-xs squircle-smooth"
            {@attach pending({ active: isPending, color: selectedColor })}
        >
            <div class="flex items-center justify-between">
                <span class="text-xs font-600 text-strong">Card Container</span>
                <span class="text-[10px] text-weak">Live Surface</span>
            </div>
            <p class="text-xs text-weak">
                The pulsing ring adapts automatically to squircle boundaries and border radiuses without layout shift.
            </p>
        </div>
    </section>
</div>
