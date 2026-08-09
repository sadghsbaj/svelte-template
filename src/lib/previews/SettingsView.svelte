<script lang="ts">
    import { Check, EyeOff, Laptop, Moon, Palette, Sparkles, Sun, Zap } from "@lucide/svelte";

    import { motionPreference, type MotionPreference } from "$core/_system/motion";
    import { theme, type ThemeMode } from "$core/_system/theme";
    import { viewState } from "$views/view.svelte";

    const themeOptions: {
        id: ThemeMode;
        label: string;
        description: string;
        icon: typeof Sun;
    }[] = [
        {
            id: "system",
            label: "System",
            description: "Sync with system preferences",
            icon: Laptop,
        },
        {
            id: "light",
            label: "Light",
            description: "Clean light appearance",
            icon: Sun,
        },
        {
            id: "dark",
            label: "Dark",
            description: "Sleek dark appearance",
            icon: Moon,
        },
    ];

    const motionOptions: {
        id: MotionPreference;
        label: string;
        description: string;
        icon: typeof Zap;
    }[] = [
        {
            id: "system",
            label: "System",
            description: "Match OS motion settings",
            icon: Sparkles,
        },
        {
            id: "no-preference",
            label: "Active",
            description: "Full animations and effects",
            icon: Zap,
        },
        {
            id: "reduce",
            label: "Reduced",
            description: "Minimized interface movement",
            icon: EyeOff,
        },
    ];
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-3xl md:p-10 md:pb-28">
    <!-- Header -->
    <header class="flex flex-col gap-1">
        <h1 class="text-3xl text-strong tracking-tight font-bold">{viewState.activeLabel}</h1>
        <p class="text-sm text-weak">Manage your visual interface and animation preferences.</p>
    </header>

    <div class="flex flex-col gap-6">
        <!-- Appearance Section -->
        <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 shadow-sm squircle-smooth md:p-8">
            <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-2xl bg-elevation-2 text-accent-500">
                    <Palette size={20} />
                </div>
                <div>
                    <h2 class="text-lg text-strong font-bold">Appearance</h2>
                    <p class="text-xs text-weak">Customize theme and color mode</p>
                </div>
            </div>

            <div class="flex flex-col gap-2.5">
                {#each themeOptions as item (item.id)}
                    {const IconComponent = item.icon}
                    {const isSelected = theme.mode === item.id}
                    <button
                        type="button"
                        onclick={() => theme.set(item.id)}
                        class="p-4 rounded-2xl bg-elevation-2 flex items-center justify-between text-left select-none t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) active:scale-98 {isSelected
                            ? 'text-strong ring-2 ring-accent-500/40 bg-elevation-2'
                            : 'text-weak hover:text-strong hover:bg-elevation-2/80'}"
                    >
                        <div class="flex items-center gap-3.5">
                            <div
                                class="p-2.5 rounded-xl t:(bg-180-quad-out text-180-quad-out) {isSelected
                                    ? 'bg-accent-500/15 text-accent-500'
                                    : 'bg-elevation-1 text-weak'}"
                            >
                                <IconComponent size={18} />
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-semibold text-strong">{item.label}</span>
                                <span class="text-xs text-weak">
                                    {item.description}
                                    {#if item.id === "system"}
                                        <span class="text-accent-500 font-medium">({theme.resolved})</span>
                                    {/if}
                                </span>
                            </div>
                        </div>

                        {#if isSelected}
                            <div class="p-1 rounded-full bg-accent-500 text-white shadow-xs">
                                <Check size={14} />
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </section>

        <!-- Animations Section -->
        <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 shadow-sm squircle-smooth md:p-8">
            <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-2xl bg-elevation-2 text-accent-500">
                    <Zap size={20} />
                </div>
                <div>
                    <h2 class="text-lg text-strong font-bold">Animations</h2>
                    <p class="text-xs text-weak">Control transition and motion preferences</p>
                </div>
            </div>

            <div class="flex flex-col gap-2.5">
                {#each motionOptions as item (item.id)}
                    {const IconComponent = item.icon}
                    {const isSelected = motionPreference.preference === item.id}
                    <button
                        type="button"
                        onclick={() => motionPreference.set(item.id)}
                        class="p-4 rounded-2xl bg-elevation-2 flex items-center justify-between text-left select-none t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) active:scale-98 {isSelected
                            ? 'text-strong ring-2 ring-accent-500/40 bg-elevation-2'
                            : 'text-weak hover:text-strong hover:bg-elevation-2/80'}"
                    >
                        <div class="flex items-center gap-3.5">
                            <div
                                class="p-2.5 rounded-xl t:(bg-180-quad-out text-180-quad-out) {isSelected
                                    ? 'bg-accent-500/15 text-accent-500'
                                    : 'bg-elevation-1 text-weak'}"
                            >
                                <IconComponent size={18} />
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-semibold text-strong">{item.label}</span>
                                <span class="text-xs text-weak">
                                    {item.description}
                                    {#if item.id === "system"}
                                        <span class="text-accent-500 font-medium">
                                            ({motionPreference.resolved === "reduce" ? "Reduced" : "Active"})
                                        </span>
                                    {/if}
                                </span>
                            </div>
                        </div>

                        {#if isSelected}
                            <div class="p-1 rounded-full bg-accent-500 text-white shadow-xs">
                                <Check size={14} />
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </section>
    </div>
</div>
