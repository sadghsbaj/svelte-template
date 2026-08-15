<script lang="ts">
    import { Check, Flame, FlaskConical, Sparkles, Trash2 } from "@lucide/svelte";

    import { viewState } from "$views/view.svelte";

    import Button from "./playground/Button.svelte";

    let isLoading = $state(false);
    let isPill = $state(false);
    let isDisabled = $state(false);
    let activeSize = $state<"sm" | "md" | "lg">("md");

    const SIZES: ("sm" | "md" | "lg")[] = ["sm", "md", "lg"];
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
    <section
        class="p-5 rounded-2xl bg-elevation-1 flex flex-wrap gap-4 shadow-xs squircle-smooth items-center"
    >
        <span class="text-xs text-weak font-600 uppercase tracking-wider">Live Controls:</span>
        <Button
            variant="subtle"
            size="sm"
            color={isLoading ? "accent" : "base"}
            onclick={() => (isLoading = !isLoading)}
        >
            Loading: {isLoading ? "ON" : "OFF"}
        </Button>
        <Button
            variant="subtle"
            size="sm"
            color={isPill ? "accent" : "base"}
            onclick={() => (isPill = !isPill)}
        >
            Pill Shape: {isPill ? "ON" : "OFF"}
        </Button>
        <Button
            variant="subtle"
            size="sm"
            color={isDisabled ? "danger" : "base"}
            onclick={() => (isDisabled = !isDisabled)}
        >
            Disabled: {isDisabled ? "ON" : "OFF"}
        </Button>
        <div class="flex gap-1 items-center bg-elevation-2 p-1 rounded-lg">
            {#each SIZES as s}
                <button
                    type="button"
                    class="px-2.5 py-1 text-xs rounded-md font-500 cursor-pointer t-all-150-quad-out {activeSize ===
                    s
                        ? 'bg-accent-500 text-white shadow-xs'
                        : 'text-weak hover:text-strong'}"
                    onclick={() => (activeSize = s)}
                >
                    {s.toUpperCase()}
                </button>
            {/each}
        </div>
    </section>

    <!-- Playground Content Area -->
    <div class="flex flex-col gap-6">
        <!-- 1. Solid Variants -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 shadow-sm squircle-smooth"
        >
            <h2 class="text-sm font-600 text-weak uppercase tracking-wider">
                1. Solid Variant Matrix
            </h2>
            <div class="flex flex-wrap gap-3 items-center">
                <Button
                    variant="solid"
                    color="accent"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    {#snippet icon()}
                        <Sparkles size={16} />
                    {/snippet}
                    Accent Action
                </Button>
                <Button
                    variant="solid"
                    color="success"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    {#snippet icon()}
                        <Check size={16} />
                    {/snippet}
                    Success Action
                </Button>
                <Button
                    variant="solid"
                    color="danger"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    {#snippet icon()}
                        <Trash2 size={16} />
                    {/snippet}
                    Danger Action
                </Button>
                <Button
                    variant="solid"
                    color="base"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Base Solid
                </Button>
            </div>
        </section>

        <!-- 2. Subtle Variants -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 shadow-sm squircle-smooth"
        >
            <h2 class="text-sm font-600 text-weak uppercase tracking-wider">
                2. Subtle Variant Matrix
            </h2>
            <div class="flex flex-wrap gap-3 items-center">
                <Button
                    variant="subtle"
                    color="accent"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Accent Subtle
                </Button>
                <Button
                    variant="subtle"
                    color="success"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Success Subtle
                </Button>
                <Button
                    variant="subtle"
                    color="danger"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Danger Subtle
                </Button>
                <Button
                    variant="subtle"
                    color="base"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Base Subtle
                </Button>
            </div>
        </section>

        <!-- 3. Outline & Ghost Variants -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 shadow-sm squircle-smooth"
        >
            <h2 class="text-sm font-600 text-weak uppercase tracking-wider">
                3. Outline & Ghost Variants
            </h2>
            <div class="flex flex-wrap gap-3 items-center">
                <Button
                    variant="outline"
                    color="accent"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Outline Accent
                </Button>
                <Button
                    variant="outline"
                    color="danger"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Outline Danger
                </Button>
                <Button
                    variant="outline"
                    color="base"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Outline Base
                </Button>
                <Button
                    variant="ghost"
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Ghost Variant
                </Button>
            </div>
        </section>

        <!-- 4. Modifiers: FullWidth & Square -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 shadow-sm squircle-smooth"
        >
            <h2 class="text-sm font-600 text-weak uppercase tracking-wider">
                4. Modifiers (FullWidth & Square Icon)
            </h2>
            <div class="flex flex-col gap-3">
                <Button
                    variant="solid"
                    color="accent"
                    fullWidth
                    size={activeSize}
                    pill={isPill}
                    loading={isLoading}
                    disabled={isDisabled}
                >
                    Full Width Block Button
                </Button>
                <div class="flex gap-2 items-center">
                    <Button
                        variant="solid"
                        color="accent"
                        square
                        size={activeSize}
                        pill={isPill}
                        loading={isLoading}
                        disabled={isDisabled}
                    >
                        <Flame size={18} />
                    </Button>
                    <Button
                        variant="subtle"
                        color="accent"
                        square
                        size={activeSize}
                        pill={isPill}
                        loading={isLoading}
                        disabled={isDisabled}
                    >
                        <Sparkles size={18} />
                    </Button>
                    <Button
                        variant="outline"
                        color="base"
                        square
                        size={activeSize}
                        pill={isPill}
                        loading={isLoading}
                        disabled={isDisabled}
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>
        </section>
    </div>
</div>
