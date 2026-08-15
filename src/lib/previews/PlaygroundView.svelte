<script lang="ts">
    import { FlaskConical } from "@lucide/svelte";

    import { viewState } from "$views/view.svelte";

    import { disableInteraction } from "$attachments/_system";
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-4xl md:p-10 md:pb-28">
    <!-- Header -->
    <header class="flex flex-col gap-1 select-none">
        <div class="flex items-center gap-3">
            <div
                class="p-2.5 rounded-2xl bg-elevation-1 text-accent-500 shadow-xs squircle-smooth flex items-center justify-center shrink-0"
            >
                <FlaskConical size={22} />
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-700">
                {viewState.activeLabel}
            </h1>
        </div>
        <p class="text-sm text-weak mt-1">Freeform sandbox for testing components and ideas.</p>
    </header>

    <!-- Playground Content Area -->
    <div class="flex flex-col gap-6">
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 shadow-sm squircle-smooth md:p-8"
        >
            <!-- Drop random test components and code here -->

            {let isDisabled = $state(false)}

            <button
                class="select-none bg-base-100 h-36px px-4 flex-center font-600 rounded-full squircle-smooth cursor-pointer hover:bg-base-200 active:scale-95 t:(bg-200-quad-out scale-200-cubic-out) w-fit"
                onclick={() => (isDisabled = !isDisabled)}>Toggle disabled</button
            >

            <button
                class="select-none bg-accent-500 text-white rounded-full squircle-smooth h-36px px-4 flex-center font-600 w-fit cursor-pointer hover:bg-accent-400 active:scale-95 t:(bg-200-quad-out scale-200-cubic-out)"
                {@attach isDisabled && disableInteraction()}>Click me!</button
            >
        </section>
    </div>
</div>
