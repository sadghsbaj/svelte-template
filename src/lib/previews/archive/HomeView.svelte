<script lang="ts">
    import {
        Activity,
        ArrowUpRight,
        CheckCircle2,
        Clock,
        Plus,
        Sparkles,
        TrendingUp,
        Users,
        Zap,
    } from "@lucide/svelte";

    import { viewState } from "$views/view.svelte";

    const metrics = [
        {
            title: "Gesamtertrag",
            value: "€48.290",
            change: "+12,4%",
            isPositive: true,
            icon: TrendingUp,
            color: "accent",
        },
        {
            title: "Aktive Nutzer",
            value: "1.429",
            change: "+8,1%",
            isPositive: true,
            icon: Users,
            color: "success",
        },
        {
            title: "Konvertierung",
            value: "3.82%",
            change: "-0,4%",
            isPositive: false,
            icon: Zap,
            color: "warning",
        },
        {
            title: "Serverauslastung",
            value: "42%",
            change: "Optimal",
            isPositive: true,
            icon: Activity,
            color: "info",
        },
    ];

    const recentActivities = [
        {
            id: 1,
            title: "Deployment v2.4.0 erfolgreich",
            subtitle: "Vor 12 Minuten • Production Cluster",
            status: "Erfolgreich",
            icon: CheckCircle2,
            badgeClass: "bg-success-500/15 text-success-600 dark:text-success-400",
        },
        {
            id: 2,
            title: "Neues Teammitglied hinzugefügt",
            subtitle: "Vor 45 Minuten • Sarah Connor (Design Lead)",
            status: "Aktiv",
            icon: Users,
            badgeClass: "bg-accent-500/15 text-accent-600 dark:text-accent-400",
        },
        {
            id: 3,
            title: "Automatisches Backup abgeschlossen",
            subtitle: "Vor 2 Stunden • Datenbank & Storage",
            status: "Gesichert",
            icon: Clock,
            badgeClass: "bg-info-500/15 text-info-600 dark:text-info-400",
        },
    ];
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-6xl md:p-10 md:pb-28">
    <!-- Header Bar -->
    <header class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
            <div class="mb-1 flex gap-2 items-center">
                <span
                    class="text-xs text-accent-600 font-semibold px-2.5 py-0.5 rounded-full bg-accent-500/15 dark:text-accent-400"
                >
                    Pro Workspace
                </span>
                <span class="text-xs text-weak">• Live Overview</span>
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-bold">Willkommen zurück, Alex</h1>
        </div>
    </header>

    <!-- Banner Card -->
    <div
        class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 items-start justify-between relative overflow-hidden squircle md:p-8 md:flex-row md:items-center"
    >
        <div class="flex flex-col gap-2 max-w-xl z-10">
            <div class="text-sm text-accent-500 font-semibold flex gap-2 items-center">
                <Sparkles size={18} />
                <span>Neues Feature verfügbar</span>
            </div>
            <h2 class="text-xl text-strong font-bold md:text-2xl">
                Echtzeit-Kollaboration & Analytics v2.4
            </h2>
            <p class="text-sm text-main leading-relaxed">
                Entdecke verfeinerte Metriken, automatische Berichterstellung und nahtloses Feedback
                für dein gesamtes Team.
            </p>
        </div>
        <button
            type="button"
            class="text-white font-medium px-5 py-3 rounded-2xl bg-accent-500 flex gap-2 shadow-accent-500/20 shadow-md items-center z-10 hover:(text-red-500 bg-accent-600) active:scale-98 t:(bg-2000-expo-out text-2000-expo-out)"
        >
            <Plus size={18} />
            <span>Neues Projekt</span>
        </button>
    </div>

    <!-- Quick Metrics Grid -->
    <section class="gap-4 grid grid-cols-1 lg:grid-cols-4 sm:grid-cols-2">
        {#each metrics as metric (metric.title)}
            {const IconComponent = metric.icon}
            <div
                class="p-5 rounded-2xl bg-elevation-1 flex flex-col gap-3 squircle hover:-translate-y-0.5"
            >
                <div class="flex items-center justify-between">
                    <span class="text-xs text-weak font-medium">{metric.title}</span>
                    <div class="text-strong p-2.5 rounded-xl bg-elevation-2">
                        <IconComponent size={18} />
                    </div>
                </div>
                <div class="mt-1 flex items-baseline justify-between">
                    <span class="text-2xl text-strong tracking-tight font-bold">{metric.value}</span
                    >
                    <span
                        class="text-xs font-semibold flex gap-0.5 items-center {metric.isPositive
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-danger-600 dark:text-danger-400'}"
                    >
                        {metric.change}
                        <ArrowUpRight size={14} class={metric.isPositive ? "" : "rotate-90"} />
                    </span>
                </div>
            </div>
        {/each}
    </section>

    <!-- Recent Activity & Overview Grid -->
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <!-- Recent Activities -->
        <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 squircle lg:col-span-2">
            <div class="mb-2 flex items-center justify-between">
                <h3 class="text-lg text-strong font-bold">Letzte Aktivitäten</h3>
                <span class="text-xs text-weak font-medium">Letzte 24 Stunden</span>
            </div>

            <div class="flex flex-col gap-3">
                {#each recentActivities as activity (activity.id)}
                    {const ActivityIcon = activity.icon}
                    <div
                        class="p-4 rounded-2xl bg-elevation-2 flex gap-4 items-center justify-between hover:bg-elevation-2/80"
                    >
                        <div class="flex gap-3.5 items-center">
                            <div class="text-strong p-2.5 rounded-xl bg-elevation-1">
                                <ActivityIcon size={18} />
                            </div>
                            <div>
                                <h4 class="text-sm text-strong font-semibold">{activity.title}</h4>
                                <p class="text-xs text-weak mt-0.5">{activity.subtitle}</p>
                            </div>
                        </div>
                        <span
                            class="text-xs font-medium px-3 py-1 rounded-xl {activity.badgeClass}"
                        >
                            {activity.status}
                        </span>
                    </div>
                {/each}
            </div>
        </section>

        <!-- Quick Status Widget -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 justify-between squircle"
        >
            <div>
                <h3 class="text-lg text-strong font-bold mb-1">Systemstatus</h3>
                <p class="text-xs text-weak">Alle Dienste laufen einwandfrei</p>
            </div>

            <div class="flex flex-col gap-4">
                <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-2">
                    <div class="text-xs font-medium flex items-center justify-between">
                        <span class="text-main">API Latenz</span>
                        <span class="text-success-600 font-bold dark:text-success-400">24 ms</span>
                    </div>
                    <div class="rounded-full bg-elevation-1 h-2 w-full overflow-hidden">
                        <div class="rounded-full bg-success-500 h-full w-[20%]"></div>
                    </div>
                </div>

                <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-2">
                    <div class="text-xs font-medium flex items-center justify-between">
                        <span class="text-main">Speicherbelegung</span>
                        <span class="text-accent-600 font-bold dark:text-accent-400"
                            >64 GB / 100 GB</span
                        >
                    </div>
                    <div class="rounded-full bg-elevation-1 h-2 w-full overflow-hidden">
                        <div class="rounded-full bg-accent-500 h-full w-[64%]"></div>
                    </div>
                </div>
            </div>

            <div class="pt-2">
                <button
                    type="button"
                    onclick={() => viewState.setView("settings")}
                    class="text-sm text-strong font-medium py-3 rounded-2xl bg-elevation-2 flex gap-2 w-full items-center justify-center hover:bg-elevation-2/80"
                >
                    Detaillierte Stats ansehen
                </button>
            </div>
        </section>
    </div>
</div>
