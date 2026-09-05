<script lang="ts">
    import { Check } from "@lucide/svelte";
    import { scrollFade } from "$attachments";
    import { Button, CloseButton, Switch } from "$components";

    let settings = $state([
        {
            id: "activity",
            title: "Activity summaries",
            description: "Receive a concise overview when important workspace activity occurs.",
            enabled: true,
        },
        {
            id: "mentions",
            title: "Mentions and replies",
            description: "Get notified when someone mentions you or replies to your work.",
            enabled: true,
        },
        {
            id: "weekly",
            title: "Weekly digest",
            description: "Bundle project progress and upcoming milestones into one update.",
            enabled: false,
        },
        {
            id: "recommendations",
            title: "Recommendations",
            description: "Surface contextual suggestions based on your recent activity.",
            enabled: true,
        },
        {
            id: "product",
            title: "Product updates",
            description: "Stay informed about new features and meaningful improvements.",
            enabled: false,
        },
        {
            id: "security",
            title: "Security alerts",
            description: "Receive immediate alerts for unusual account or workspace activity.",
            enabled: true,
        },
    ]);
</script>

{#snippet saveIcon()}
    <Check />
{/snippet}

<div class="p-5 flex-center min-h-full md:p-10">
    <section
        aria-labelledby="preferences-title"
        class="p-5 rounded-4xl bg-elevation-1 shadow-2xl flex flex-col h-[min(620px,calc(100dvh-8rem))] min-h-[440px] w-full max-w-2xl squircle-smooth md:p-7"
    >
        <header class="mb-6 flex items-start justify-between gap-6 shrink-0">
            <div class="flex flex-col gap-1">
                <h1 id="preferences-title" class="text-xl text-strong font-700 tracking-tight">
                    Workspace preferences
                </h1>
                <p class="text-sm text-weak leading-relaxed">
                    Choose which updates should reach you while you work.
                </p>
            </div>

            <CloseButton variant="solid" size="md" />
        </header>

        <main class="flex flex-col flex-1 min-h-0">
            <p class="mb-4 text-xs text-main leading-relaxed shrink-0">
                Your notification choices apply across all projects in this workspace and can be
                adjusted at any time.
            </p>

            <div
                class="pr-2 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto"
                {@attach scrollFade({ size: "sm" })}
            >
                {#each settings as setting (setting.id)}
                    <div
                        class="p-4 rounded-2xl bg-elevation-2/70 flex items-center justify-between gap-5 shrink-0 squircle-soft"
                    >
                        <div class="flex flex-col gap-0.5 min-w-0">
                            <h2 class="text-sm text-strong font-600">{setting.title}</h2>
                            <p class="text-xs text-weak leading-relaxed">{setting.description}</p>
                        </div>

                        <Switch
                            bind:checked={setting.enabled}
                            size="sm"
                            aria-label={`Toggle ${setting.title}`}
                        />
                    </div>
                {/each}
            </div>
        </main>

        <footer class="pt-6 flex items-center justify-end gap-2.5 shrink-0">
            <Button variant="soft" color="base">Cancel</Button>
            <Button iconLeft={saveIcon}>Save changes</Button>
        </footer>
    </section>
</div>
