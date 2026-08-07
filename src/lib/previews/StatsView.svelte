<script lang="ts">
    import { focusAttach } from "$core/_system/focus/focus.attach.js";
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-6xl md:p-10 md:pb-28">
    <!-- Header Bar -->
    <header class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
            <div class="mb-1 flex gap-2 items-center">
                <span
                    class="text-xs text-success-600 font-semibold px-2.5 py-0.5 rounded-full bg-success-500/15 dark:text-success-400"
                >
                    Realtime Analytics
                </span>
                <span class="text-xs text-weak">• Performance Hub</span>
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-bold">Statistiken & Analysen</h1>
        </div>
    </header>

    <!-- Main Chart Section -->
    <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 squircle md:p-8">
        <div class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
            <input
                class="text-zinc-700 px-2 py-1 rounded-full bg-zinc-100 squircle-smooth dark:text-zinc-200 dark:bg-zinc-700 placeholder-zinc-700 dark:placeholder-zinc-200"
                placeholder="test"
            />
        </div>
    </section>
</div>
