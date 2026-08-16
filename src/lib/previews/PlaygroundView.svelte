<script lang="ts">
    import { FlaskConical } from "@lucide/svelte";
    import { fadeMask } from "$attachments";
    import { BackgroundPattern } from "$components";

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
            Freeform sandbox for testing CVA recipes and components.
        </p>
    </header>

    <!-- Playground Controls -->
    <section class="p-6 rounded-2xl bg-elevation-1 flex flex-col gap-4 shadow-xs squircle-smooth">
        <div
            class="h-250px w-400px rounded-3xl squircle-smooth bg-elevation-2 p-4 flex flex-col justify-between"
        >
            <BackgroundPattern variant="grid" {@attach fadeMask()} />

            <h2 class="text-strong font-700 text-lg">Test Title!</h2>

            <div class="flex flex-col gap-1 text-sm">
                <span>Test Content1</span>
                <span>Test Content2</span>
                <span>Test Content3</span>
                <span>Test Content4</span>
            </div>

            <button
                class="bg-accent-500 h-36px text-sm px-3 flex-center font-600 text-white rounded-full squircle-smooth w-fit"
                >Click me!</button
            >
        </div>
    </section>
</div>
