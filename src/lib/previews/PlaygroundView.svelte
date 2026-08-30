<script lang="ts">
    import { FlaskConical } from "@lucide/svelte";
    import { Button } from "$components";

    import { viewState } from "$views/view.svelte";
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
            Freeform sandbox for testing the new <code class="text-accent-500 font-mono font-600"
                >pending</code
            > pulsing ring attachment and components.
        </p>
    </header>

    <!-- Global Pending State Controls -->
    <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 shadow-xs squircle-smooth">
        <button>Click me!</button>
    </section>
</div>
