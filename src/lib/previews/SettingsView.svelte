<script lang="ts">
    import { EyeOff, Laptop, Moon, Palette, Sparkles, Sun, Zap } from "@lucide/svelte";

    import { motionPreference, type MotionPreference } from "$core/_system/motion";
    import { theme, type ThemeMode } from "$core/_system/theme";
    import { viewState } from "$views/view.svelte";

    const themeOptions: {
        id: ThemeMode;
        label: string;
        icon: typeof Sun;
    }[] = [
        {
            id: "system",
            label: "System",
            icon: Laptop,
        },
        {
            id: "light",
            label: "Light",
            icon: Sun,
        },
        {
            id: "dark",
            label: "Dark",
            icon: Moon,
        },
    ];

    const motionOptions: {
        id: MotionPreference;
        label: string;
        icon: typeof Zap;
    }[] = [
        {
            id: "system",
            label: "System",
            icon: Sparkles,
        },
        {
            id: "no-preference",
            label: "Active",
            icon: Zap,
        },
        {
            id: "reduce",
            label: "Reduced",
            icon: EyeOff,
        },
    ];
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-3xl md:p-10 md:pb-28">
    <!-- Header -->
    <header class="flex flex-col gap-1">
        <h1 class="text-3xl text-strong tracking-tight font-700">{viewState.activeLabel}</h1>
        <p class="text-sm text-weak">Manage your visual interface and animation preferences.</p>
    </header>

    <div class="flex flex-col gap-6">
        <!-- Appearance Section -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 shadow-sm squircle-smooth md:p-8"
        >
            <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-2xl bg-elevation-2 text-accent-500">
                    <Palette size={19} />
                </div>
                <div>
                    <h2 class="text-base text-strong font-700">Appearance</h2>
                    <p class="text-xs text-weak">Select your preferred color mode</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {#each themeOptions as item (item.id)}
                    {const IconComponent = item.icon}
                    <button
                        type="button"
                        onclick={() => theme.set(item.id)}
                        class="p-5 rounded-2xl flex-center flex-col gap-3 text-center select-none squircle-smooth active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out){theme.mode ===
                        item.id
                            ? 'text-strong bg-elevation-2 ring-1.5 ring-accent-500/40 shadow-xs font-600'
                            : 'text-weak bg-elevation-2/40 hover:text-strong hover:bg-elevation-2/70'}"
                    >
                        <div
                            class="p-3 rounded-2xl t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) {theme.mode ===
                            item.id
                                ? 'bg-accent-500/15 text-accent-500 scale-105'
                                : 'bg-elevation-1 text-weak/70'}"
                        >
                            <IconComponent size={20} />
                        </div>
                        <span class="text-sm font-500">{item.label}</span>
                    </button>
                {/each}
            </div>
        </section>

        <!-- Animations Section -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 shadow-sm squircle-smooth md:p-8"
        >
            <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-2xl bg-elevation-2 text-accent-500">
                    <Zap size={19} />
                </div>
                <div>
                    <h2 class="text-base text-strong font-700">Animations</h2>
                    <p class="text-xs text-weak">Configure interface motion and transitions</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {#each motionOptions as item (item.id)}
                    {const IconComponent = item.icon}
                    <button
                        type="button"
                        onclick={() => motionPreference.set(item.id)}
                        class="p-5 rounded-2xl flex-center flex-col gap-3 text-center select-none squircle-smooth active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out){motionPreference.preference ===
                        item.id
                            ? 'text-strong bg-elevation-2 ring-1.5 ring-accent-500/40 shadow-xs font-600'
                            : 'text-weak bg-elevation-2/40 hover:text-strong hover:bg-elevation-2/70'}"
                    >
                        <div
                            class="p-3 rounded-2xl t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) {motionPreference.preference ===
                            item.id
                                ? 'bg-accent-500/15 text-accent-500 scale-105'
                                : 'bg-elevation-1 text-weak/70'}"
                        >
                            <IconComponent size={20} />
                        </div>
                        <span class="text-sm font-500">{item.label}</span>
                    </button>
                {/each}
            </div>
        </section>
    </div>
</div>
