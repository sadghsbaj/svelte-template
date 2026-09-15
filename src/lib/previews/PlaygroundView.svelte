<script lang="ts">
    import { FilePlus, Pencil, Settings2, Trash2 } from "@lucide/svelte";
</script>

<div class="p-5 flex-center min-h-full md:p-10">
    <div class="flex flex-col gap-6 w-320px">

        <div class="flex flex-col gap-2">
            <span class="text-xs text-weak font-mono">1. Normaler Text (text-trim für 0px Versatz)</span>
            <div class="flex items-center gap-2 px-3 h-36px rounded-xl bg-base-soft-1">
                <Settings2 size={16} strokeWidth={2} class="shrink-0 text-weak" />
                <span class="min-w-0 flex-1 truncate">
                    <span class="text-sm leading-none text-trim inline-block font-500">Test</span>
                </span>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <span class="text-xs text-weak font-mono">2. Dropdown Item mit New file</span>
            <div class="flex items-center gap-2 px-3 h-36px rounded-xl bg-base-soft-1">
                <FilePlus size={16} strokeWidth={2} class="shrink-0 text-weak" />
                <span class="min-w-0 flex-1 truncate">
                    <span class="text-sm leading-none text-trim inline-block font-500">New file</span>
                </span>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <span class="text-xs text-weak font-mono">3. Truncate bei extrem langem Text</span>
            <div class="flex items-center gap-2 px-3 h-36px rounded-xl bg-base-soft-1 max-w-180px">
                <Pencil size={16} strokeWidth={2} class="shrink-0 text-weak" />
                <span class="min-w-0 flex-1 truncate">
                    <span class="text-sm leading-none text-trim inline-block font-500">SehrLangerDateinameDerAbgeschnittenWird</span>
                </span>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <span class="text-xs text-weak font-mono">4. Danger Item (Delete)</span>
            <div class="flex items-center gap-2 px-3 h-36px rounded-xl bg-base-soft-1">
                <Trash2 size={16} strokeWidth={2} class="shrink-0 text-danger-500" />
                <span class="min-w-0 flex-1 truncate">
                    <span class="text-sm leading-none text-trim inline-block font-500 text-danger-500">Delete file</span>
                </span>
            </div>
        </div>

    </div>
</div>
