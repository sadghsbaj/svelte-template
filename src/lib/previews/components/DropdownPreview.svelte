<script module lang="ts">
    import { MenuSquare } from "@lucide/svelte";

    export const icon = MenuSquare;
</script>

<script lang="ts">
    import {
        Archive,
        Copy,
        Ellipsis,
        FilePlus,
        FolderInput,
        Pencil,
        Share2,
        Trash2,
    } from "@lucide/svelte";
    import { Button, Dropdown, type DropdownEntry } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let lastAction = $state("None");

    const run = (label: string): void => {
        lastAction = label;
    };

    const textOnlyItems: readonly DropdownEntry[] = [
        {
            id: "new",
            label: "New file",
            onAction: () => run("New file"),
        },
        {
            id: "edit",
            label: "Edit file",
            onAction: () => run("Edit file"),
        },
        {
            id: "duplicate",
            label: "Duplicate",
            onAction: () => run("Duplicate"),
        },
        {
            id: "delete",
            label: "Delete file",
            danger: true,
            onAction: () => run("Delete file"),
        },
    ];

    const iconItems: readonly DropdownEntry[] = [
        {
            id: "new",
            label: "New file",
            icon: FilePlus,
            onAction: () => run("New file"),
        },
        {
            id: "edit",
            label: "Edit file",
            icon: Pencil,
            onAction: () => run("Edit file"),
        },
        {
            id: "duplicate",
            label: "Duplicate",
            icon: Copy,
            onAction: () => run("Duplicate"),
        },
        {
            id: "delete",
            label: "Delete file",
            icon: Trash2,
            danger: true,
            onAction: () => run("Delete file"),
        },
    ];

    const separatorItems: readonly DropdownEntry[] = [
        {
            id: "new",
            label: "New file",
            icon: FilePlus,
            shortcut: "Mod+N",
            onAction: () => run("New file"),
        },
        {
            id: "edit",
            label: "Edit file",
            icon: Pencil,
            shortcut: "Mod+E",
            onAction: () => run("Edit file"),
        },
        {
            id: "duplicate",
            label: "Duplicate",
            icon: Copy,
            shortcut: "Mod+D",
            onAction: () => run("Duplicate"),
        },
        {
            type: "separator",
            id: "sep-danger",
        },
        {
            id: "delete",
            label: "Delete file",
            icon: Trash2,
            shortcut: "Mod+Backspace",
            danger: true,
            onAction: () => run("Delete file"),
        },
    ];

    const destinations: readonly DropdownEntry[] = [
        {
            id: "workspace",
            label: "Workspace",
            description: "Move into the current workspace",
            onAction: () => run("Move to workspace"),
        },
        {
            type: "submenu",
            id: "archive-destination",
            label: "Archive",
            icon: Archive,
            items: [
                {
                    id: "monthly",
                    label: "Monthly archive",
                    onAction: () => run("Move to monthly archive"),
                },
                {
                    id: "permanent",
                    label: "Permanent archive",
                    onAction: () => run("Move to permanent archive"),
                },
            ],
        },
    ];

    const actions: readonly DropdownEntry[] = [
        {
            type: "section",
            id: "actions",
            label: "Actions",
            items: [
                {
                    id: "new",
                    label: "New file",
                    description: "Create an empty document",
                    icon: FilePlus,
                    shortcut: "Mod+N",
                    onAction: () => run("New file"),
                },
                {
                    id: "edit",
                    label: "Edit file",
                    icon: Pencil,
                    shortcut: "Mod+E",
                    onAction: () => run("Edit file"),
                },
                {
                    id: "duplicate",
                    label: "Duplicate",
                    icon: Copy,
                    shortcut: "Mod+D",
                    onAction: () => run("Duplicate"),
                },
                {
                    type: "submenu",
                    id: "move",
                    label: "Move to",
                    description: "Choose another destination",
                    icon: FolderInput,
                    items: destinations,
                },
                {
                    id: "share",
                    label: "Share",
                    icon: Share2,
                    disabled: true,
                    onAction: () => run("Share"),
                },
            ],
        },
        {
            type: "section",
            id: "danger",
            label: "Danger zone",
            items: [
                {
                    id: "delete",
                    label: "Delete file",
                    description: "Move this file to the trash",
                    icon: Trash2,
                    shortcut: "Mod+Backspace",
                    danger: true,
                    onAction: () => run("Delete file"),
                },
            ],
        },
    ];
</script>

<PreviewPage>
    <PreviewHeader
        title="Dropdown"
        description="Action menus with keyboard navigation, typeahead, shortcuts, and nested submenus."
        icon={MenuSquare}
    />

    <PreviewSection title="Variants">
        <PreviewGrid cols={2}>
            <PreviewCard label="Text only" bg="elevation-1" class="h-48">
                <div class="flex flex-col items-center gap-3">
                    <Dropdown items={textOnlyItems} aria-label="Text only options">
                        {#snippet trigger(context)}
                            <Button variant="soft" color="base" {@attach context.attachment}>
                                Options
                            </Button>
                        {/snippet}
                    </Dropdown>
                    <span class="text-xs text-weak">Last action: {lastAction}</span>
                </div>
            </PreviewCard>

            <PreviewCard label="With icons" bg="elevation-1" class="h-48">
                <Dropdown items={iconItems} aria-label="Options with icons">
                    {#snippet trigger(context)}
                        <Button variant="soft" color="base" {@attach context.attachment}>
                            Actions
                        </Button>
                    {/snippet}
                </Dropdown>
            </PreviewCard>

            <PreviewCard label="Shortcuts + Separator" bg="elevation-1" class="h-48">
                <Dropdown items={separatorItems} aria-label="Actions with shortcuts">
                    {#snippet trigger(context)}
                        <Button variant="soft" color="base" {@attach context.attachment}>
                            Shortcuts
                        </Button>
                    {/snippet}
                </Dropdown>
            </PreviewCard>

            <PreviewCard label="Icon trigger" bg="elevation-1" class="h-48">
                <Dropdown items={iconItems} aria-label="More options">
                    {#snippet trigger(context)}
                        <Button
                            variant="soft"
                            color="base"
                            iconOnly
                            aria-label="More options"
                            {@attach context.attachment}
                        >
                            <Ellipsis aria-hidden="true" />
                        </Button>
                    {/snippet}
                </Dropdown>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Sections + Submenus">
        <PreviewCard label="Full menu" bg="elevation-0" class="h-52">
            <Dropdown items={actions} aria-label="File actions">
                {#snippet trigger(context)}
                    <Button variant="elevated" color="base" {@attach context.attachment}>
                        File actions
                    </Button>
                {/snippet}
            </Dropdown>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection title="Placement">
        <PreviewGrid cols={2}>
            <PreviewCard label="Bottom start" bg="elevation-1" class="h-44">
                <Dropdown items={iconItems} placement="bottom-start" aria-label="Start actions">
                    {#snippet trigger(context)}
                        <Button variant="soft" color="base" {@attach context.attachment}>
                            Bottom start
                        </Button>
                    {/snippet}
                </Dropdown>
            </PreviewCard>
            <PreviewCard label="Bottom end" bg="elevation-1" class="h-44">
                <Dropdown items={iconItems} placement="bottom-end" aria-label="End actions">
                    {#snippet trigger(context)}
                        <Button variant="soft" color="base" {@attach context.attachment}>
                            Bottom end
                        </Button>
                    {/snippet}
                </Dropdown>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Responsive Submenus">
        <PreviewCard label="Forced drilldown" bg="elevation-1" class="h-52">
            <Dropdown items={actions} submenuMode="drilldown" aria-label="Drilldown file actions">
                {#snippet trigger(context)}
                    <Button variant="soft" color="base" {@attach context.attachment}>
                        Open drilldown
                    </Button>
                {/snippet}
            </Dropdown>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection title="Sizes">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-36">
                <Dropdown items={iconItems} size="sm" aria-label="Small actions">
                    {#snippet trigger(context)}
                        <Button size="sm" variant="soft" color="base" {@attach context.attachment}
                            >Small</Button
                        >
                    {/snippet}
                </Dropdown>
            </PreviewCard>
            <PreviewCard label="Medium" bg="elevation-1" class="h-36">
                <Dropdown items={iconItems} size="md" aria-label="Medium actions">
                    {#snippet trigger(context)}
                        <Button size="md" variant="soft" color="base" {@attach context.attachment}
                            >Medium</Button
                        >
                    {/snippet}
                </Dropdown>
            </PreviewCard>
            <PreviewCard label="Large" bg="elevation-1" class="h-36">
                <Dropdown items={iconItems} size="lg" aria-label="Large actions">
                    {#snippet trigger(context)}
                        <Button size="lg" variant="soft" color="base" {@attach context.attachment}
                            >Large</Button
                        >
                    {/snippet}
                </Dropdown>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
