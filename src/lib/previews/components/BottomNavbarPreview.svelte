<script module lang="ts">
    import { PanelBottom } from "@lucide/svelte";

    export const icon = PanelBottom;
</script>

<script lang="ts">
    import { ChartNoAxesColumn, Home, Search, Settings, UserRound } from "@lucide/svelte";
    import { BottomNavbar, Button, type BottomNavbarItem } from "$components";

    import { createViewState } from "$core/_system/layout/app-views/view-state/viewState.svelte";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    type DemoItem = "home" | "search" | "analytics" | "profile" | "settings";

    const items: readonly BottomNavbarItem<DemoItem>[] = [
        { value: "home", label: "Home", icon: Home },
        { value: "search", label: "Search", icon: Search },
        { value: "analytics", label: "Analytics", icon: ChartNoAxesColumn },
        { value: "profile", label: "Profile", icon: UserRound },
        { value: "settings", label: "Settings", icon: Settings },
    ];

    const viewState = createViewState({
        views: [
            { view: "home", label: "Home", icon: Home, parent: "root" },
            {
                view: "analytics",
                label: "Analytics",
                icon: ChartNoAxesColumn,
                parent: "root",
            },
            { view: "report", label: "Report", parent: "analytics" },
            { view: "settings", label: "Settings", icon: Settings, parent: "root" },
        ] as const,
    });

    let smallValue = $state<DemoItem>("home");
    let mediumValue = $state<DemoItem>("search");
    let largeValue = $state<DemoItem>("analytics");
    let responsiveValue = $state<DemoItem>("profile");
    let visible = $state(true);
</script>

<PreviewPage>
    <PreviewHeader
        title="Bottom Navbar"
        description="Floating macro navigation with equal-width items, responsive labels, and view-aware selection."
        icon={PanelBottom}
    />

    <PreviewSection title="Sizes">
        <PreviewGrid cols={1}>
            <PreviewCard label="Small" bg="elevation-0" class="h-32">
                <BottomNavbar
                    position="static"
                    size="sm"
                    labels="always"
                    items={items.slice(0, 3)}
                    bind:value={smallValue}
                />
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-0" class="h-36">
                <BottomNavbar
                    position="static"
                    size="md"
                    labels="always"
                    items={items.slice(0, 4)}
                    bind:value={mediumValue}
                />
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-0" class="h-40">
                <BottomNavbar
                    position="static"
                    size="lg"
                    labels="always"
                    items={items}
                    bind:value={largeValue}
                />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Responsive">
        <PreviewGrid cols={2}>
            <PreviewCard label="Adaptive" bg="elevation-0" class="h-36">
                <BottomNavbar
                    position="static"
                    items={items.slice(0, 4)}
                    bind:value={responsiveValue}
                />
            </PreviewCard>

            <PreviewCard label="Icon Only" bg="elevation-0" class="h-36">
                <div class="w-280px max-w-full">
                    <BottomNavbar
                        position="static"
                        labels="hidden"
                        items={items}
                        bind:value={responsiveValue}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="View State">
        <PreviewCard label="Root Views" bg="elevation-0" class="h-40">
            <div class="flex w-full flex-col items-center gap-4">
                <BottomNavbar mode="views" position="static" {viewState} />
                <Button
                    size="sm"
                    variant="soft"
                    color="base"
                    onclick={() => viewState.setView("report")}
                >
                    Open Analytics Report
                </Button>
            </div>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection title="Visibility">
        <PreviewCard label="Animated" bg="elevation-0" class="h-40">
            <div class="flex w-full flex-col items-center gap-5">
                <div class="h-60px flex-center w-full">
                    <BottomNavbar
                        position="static"
                        items={items.slice(0, 3)}
                        bind:value={smallValue}
                        {visible}
                    />
                </div>
                <Button size="sm" variant="soft" color="base" onclick={() => (visible = !visible)}>
                    {visible ? "Hide" : "Show"}
                </Button>
            </div>
        </PreviewCard>
    </PreviewSection>
</PreviewPage>
