<script lang="ts">
    import {
        Bell,
        Check,
        EyeOff,
        Key,
        Moon,
        Palette,
        ShieldCheck,
        Sparkles,
        Sun,
        User,
        Zap,
    } from "@lucide/svelte";

    import { motionPreference, type MotionPreference } from "$core/_system/motion";
    import { theme, type ThemeMode } from "$core/_system/theme";

    let emailNotifications = $state(true);
    let securityAlerts = $state(true);
    let marketingUpdates = $state(false);

    const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
        { id: "system", label: "System", icon: Palette },
        { id: "light", label: "Helle Ansicht", icon: Sun },
        { id: "dark", label: "Dunkle Ansicht", icon: Moon },
    ];

    const motionOptions: { id: MotionPreference; label: string; icon: typeof Zap }[] = [
        { id: "system", label: "Systemstandard", icon: Sparkles },
        { id: "no-preference", label: "Animationen aktiv", icon: Zap },
        { id: "reduce", label: "Reduzierte Bewegung", icon: EyeOff },
    ];
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-6xl md:p-10 md:pb-28">
    <!-- Header Bar -->
    <header class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
            <div class="mb-1 flex gap-2 items-center">
                <span
                    class="text-xs text-info-600 font-semibold px-2.5 py-0.5 rounded-full bg-info-500/15 dark:text-info-400"
                >
                    Konto & Konfiguration
                </span>
                <span class="text-xs text-weak">• Systemsteuerung</span>
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-bold">Einstellungen</h1>
        </div>
    </header>

    <div class="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <!-- Main Settings Column -->
        <div class="flex flex-col gap-6 lg:col-span-2">
            <!-- Profile Section -->
            <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 squircle md:p-8">
                <h2 class="text-xl text-strong font-bold flex gap-2 items-center">
                    <User size={20} class="text-accent-500" />
                    <span>Benutzerprofil</span>
                </h2>

                <div class="p-5 rounded-2xl bg-elevation-2 flex gap-5 items-center">
                    <div
                        class="text-xl text-accent-500 font-bold rounded-2xl flex h-16 w-16 items-center justify-center squircle bg-accent-500/20"
                    >
                        AV
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <h3 class="text-base text-strong font-bold">Alex Vance</h3>
                        <p class="text-xs text-weak">alex.vance@example.com</p>
                        <span
                            class="text-xs text-accent-600 font-semibold mt-1 dark:text-accent-400"
                        >
                            Administrator
                        </span>
                    </div>
                </div>

                <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <div class="flex flex-col gap-1.5">
                        <label for="display-name" class="text-xs text-weak font-semibold"
                            >Anzeigename</label
                        >
                        <input
                            id="display-name"
                            type="text"
                            value="Alex Vance"
                            readonly
                            class="text-sm text-strong font-medium px-4 py-3 rounded-2xl bg-elevation-2 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                        />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="display-email" class="text-xs text-weak font-semibold"
                            >E-Mail-Adresse</label
                        >
                        <input
                            id="display-email"
                            type="email"
                            value="alex.vance@example.com"
                            readonly
                            class="text-sm text-strong font-medium px-4 py-3 rounded-2xl bg-elevation-2 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                        />
                    </div>
                </div>
            </section>

            <!-- Notifications Section -->
            <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 squircle md:p-8">
                <h2 class="text-xl text-strong font-bold flex gap-2 items-center">
                    <Bell size={20} class="text-warning-500" />
                    <span>Benachrichtigungen</span>
                </h2>

                <div class="flex flex-col gap-3">
                    <div
                        class="p-4 rounded-2xl bg-elevation-2 flex gap-4 items-center justify-between"
                    >
                        <div>
                            <h3 class="text-sm text-strong font-bold">E-Mail Zusammenfassung</h3>
                            <p class="text-xs text-weak mt-0.5">
                                Wöchentlicher Bericht zu Aktivitäten
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="E-Mail Zusammenfassung umschalten"
                            onclick={() => (emailNotifications = !emailNotifications)}
                            class="p-1 rounded-full flex h-7 w-12 items-center relative {emailNotifications
                                ? 'bg-accent-500 justify-end'
                                : 'bg-elevation-1 justify-start'}"
                        >
                            <div class="rounded-full bg-white h-5 w-5 shadow-xs"></div>
                        </button>
                    </div>

                    <div
                        class="p-4 rounded-2xl bg-elevation-2 flex gap-4 items-center justify-between"
                    >
                        <div>
                            <h3 class="text-sm text-strong font-bold">Sicherheitswarnungen</h3>
                            <p class="text-xs text-weak mt-0.5">
                                Sofortige Warnung bei neuen Logins
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Sicherheitswarnungen umschalten"
                            onclick={() => (securityAlerts = !securityAlerts)}
                            class="p-1 rounded-full flex h-7 w-12 items-center relative {securityAlerts
                                ? 'bg-accent-500 justify-end'
                                : 'bg-elevation-1 justify-start'}"
                        >
                            <div class="rounded-full bg-white h-5 w-5 shadow-xs"></div>
                        </button>
                    </div>

                    <div
                        class="p-4 rounded-2xl bg-elevation-2 flex gap-4 items-center justify-between"
                    >
                        <div>
                            <h3 class="text-sm text-strong font-bold">Produkt-Updates</h3>
                            <p class="text-xs text-weak mt-0.5">Informationen über neue Features</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Produkt-Updates umschalten"
                            onclick={() => (marketingUpdates = !marketingUpdates)}
                            class="p-1 rounded-full flex h-7 w-12 items-center relative {marketingUpdates
                                ? 'bg-accent-500 justify-end'
                                : 'bg-elevation-1 justify-start'}"
                        >
                            <div class="rounded-full bg-white h-5 w-5 shadow-xs"></div>
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <!-- Sidebar Settings Column -->
        <div class="flex flex-col gap-6">
            <!-- Appearance Section -->
            <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 squircle">
                <h3 class="text-lg text-strong font-bold flex gap-2 items-center">
                    <Palette size={18} class="text-info-500" />
                    <span>Erscheinungsbild</span>
                </h3>

                <div class="flex flex-col gap-2">
                    {#each themeOptions as item (item.id)}
                        {const ThemeIcon = item.icon}
                        <button
                            type="button"
                            onclick={() => theme.set(item.id)}
                            class="p-3.5 rounded-2xl bg-elevation-2 flex items-center justify-between {theme.mode ===
                            item.id
                                ? 'text-strong ring-2 ring-accent-500/40'
                                : 'text-weak hover:text-strong'}"
                        >
                            <div class="flex gap-3 items-center">
                                <div class="text-strong p-2 rounded-xl bg-elevation-1">
                                    <ThemeIcon size={16} />
                                </div>
                                <span class="text-sm font-semibold">{item.label}</span>
                            </div>
                            {#if theme.mode === item.id}
                                <div class="text-white p-1 rounded-full bg-accent-500">
                                    <Check size={12} />
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </section>

            <!-- Motion Section -->
            <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 squircle">
                <h3 class="text-lg text-strong font-bold flex gap-2 items-center">
                    <Zap size={18} class="text-warning-500" />
                    <span>Bewegung & Animationen</span>
                </h3>

                <div class="flex flex-col gap-2">
                    {#each motionOptions as item (item.id)}
                        {const MotionIcon = item.icon}
                        <button
                            type="button"
                            onclick={() => motionPreference.set(item.id)}
                            class="p-3.5 rounded-2xl bg-elevation-2 flex items-center justify-between {motionPreference.preference ===
                            item.id
                                ? 'text-strong ring-2 ring-accent-500/40'
                                : 'text-weak hover:text-strong'}"
                        >
                            <div class="flex gap-3 items-center">
                                <div class="text-strong p-2 rounded-xl bg-elevation-1">
                                    <MotionIcon size={16} />
                                </div>
                                <div class="flex flex-col text-left">
                                    <span class="text-sm font-semibold">{item.label}</span>
                                    {#if item.id === "system"}
                                        <span class="text-xs text-weak">
                                            Aktiv: {motionPreference.resolved === "reduce"
                                                ? "Reduziert"
                                                : "Normal"}
                                        </span>
                                    {/if}
                                </div>
                            </div>
                            {#if motionPreference.preference === item.id}
                                <div class="text-white p-1 rounded-full bg-accent-500">
                                    <Check size={12} />
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </section>

            <!-- Security Section -->
            <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 squircle">
                <h3 class="text-lg text-strong font-bold flex gap-2 items-center">
                    <ShieldCheck size={18} class="text-success-500" />
                    <span>Sicherheit & API</span>
                </h3>

                <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-weak font-semibold"
                            >2-Faktor-Authentifizierung</span
                        >
                        <span
                            class="text-xs text-success-600 font-bold px-2 py-0.5 rounded-md bg-success-500/15 dark:text-success-400"
                        >
                            Aktiv
                        </span>
                    </div>
                    <p class="text-xs text-weak mt-1">Geschützt mit Authenticator-App</p>
                </div>

                <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-3">
                    <div class="text-xs font-semibold flex items-center justify-between">
                        <span class="text-weak flex gap-1.5 items-center">
                            <Key size={14} />
                            API Schlüssel
                        </span>
                        <span class="text-accent-500 font-bold">Kopieren</span>
                    </div>
                    <code
                        class="text-xs text-weak font-mono px-3 py-2 rounded-xl bg-elevation-1 overflow-x-auto"
                    >
                        sk_live_99a8x...f321
                    </code>
                </div>
            </section>
        </div>
    </div>
</div>
