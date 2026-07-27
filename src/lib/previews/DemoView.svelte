<script lang="ts">
    import { Activity, Keyboard, Palette } from "@lucide/svelte";
    import AppShortcutManager from "./AppShortcutManager.svelte";
    import MotionManager from "./MotionManager.svelte";
    import ThemeManager from "./ThemeManager.svelte";

    type PreviewTab = "shortcut" | "theme" | "motion";
    let activeTab = $state<PreviewTab>("shortcut");
</script>

<div class="demoview-container">
    <!-- Top Preview Selector Bar -->
    <nav class="preview-nav">
        <div class="nav-brand">
            <span class="nav-title">System Previews</span>
        </div>

        <div class="nav-tabs">
            <button
                class="nav-tab"
                class:active={activeTab === "shortcut"}
                onclick={() => (activeTab = "shortcut")}
            >
                <Keyboard size={16} />
                <span>AppShortcutManager</span>
            </button>

            <button
                class="nav-tab"
                class:active={activeTab === "theme"}
                onclick={() => (activeTab = "theme")}
            >
                <Palette size={16} />
                <span>ThemeManager</span>
            </button>

            <button
                class="nav-tab"
                class:active={activeTab === "motion"}
                onclick={() => (activeTab = "motion")}
            >
                <Activity size={16} />
                <span>MotionManager</span>
            </button>
        </div>
    </nav>

    <!-- Active Preview Content -->
    <div class="preview-viewport">
        {#if activeTab === "shortcut"}
            <AppShortcutManager />
        {:else if activeTab === "theme"}
            <ThemeManager />
        {:else if activeTab === "motion"}
            <MotionManager />
        {/if}
    </div>
</div>

<style>
    .demoview-container {
        color-scheme: light dark;
        width: 100%;
        min-height: 100vh;
        background: var(--color-elevation-0);
    }

    .preview-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 32px;
        background: var(--color-elevation-1);
        border-bottom: 1px solid var(--color-elevation-2);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .nav-brand {
        display: flex;
        align-items: center;
    }

    .nav-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--color-text-strong);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .nav-tabs {
        display: flex;
        gap: 6px;
    }

    .nav-tab {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--color-text-main);
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .nav-tab:hover {
        background: var(--color-elevation-2);
        color: var(--color-text-strong);
    }

    .nav-tab.active {
        background: oklch(from var(--color-accent-500) l c h / 0.12);
        color: var(--color-accent-500);
    }

    .preview-viewport {
        width: 100%;
    }
</style>
