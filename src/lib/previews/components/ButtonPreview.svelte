<script lang="ts">
    import { Plus, Sparkles, Trash2 } from "@lucide/svelte";
</script>

<div class="flex flex-col gap-8 items-center justify-center p-8">
    <div class="flex flex-col gap-1 text-center">
        <h3 class="text-xl text-strong font-bold">Button Component</h3>
        <p class="text-xs text-weak">Previewing primary, secondary, and danger button variants</p>
    </div>

    <div class="flex flex-wrap gap-4 items-center justify-center">
        <button
            type="button"
            class="px-4 py-2.5 rounded-xl bg-accent-500 text-white font-medium text-sm flex items-center gap-2 shadow-sm hover:bg-accent-600 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out)"
        >
            <Plus size={16} />
            <span>Primary Button</span>
        </button>

        <button
            type="button"
            class="px-4 py-2.5 rounded-xl bg-elevation-2 text-strong font-medium text-sm flex items-center gap-2 shadow-xs hover:bg-elevation-2/80 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out)"
        >
            <Sparkles size={16} class="text-accent-500" />
            <span>Secondary Button</span>
        </button>

        <button
            type="button"
            class="px-4 py-2.5 rounded-xl bg-danger-500/15 text-danger-600 dark:text-danger-400 font-medium text-sm flex items-center gap-2 hover:bg-danger-500/25 active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out)"
        >
            <Trash2 size={16} />
            <span>Danger Button</span>
        </button>
    </div>
</div>
