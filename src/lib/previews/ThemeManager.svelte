<script lang="ts">
    import { Eye, Laptop, Moon, Palette, RefreshCw, Sparkles, Sun } from "@lucide/svelte";

    import { theme, type ThemeMode } from "$core/_system/theme";

    function selectMode(newMode: ThemeMode) {
        theme.set(newMode);
    }

    function toggleTheme() {
        theme.toggle();
    }
</script>

<div class="theme-demo">
    <!-- Header -->
    <header class="demo-header">
        <div class="header-left">
            <div class="header-icon-box">
                <Palette size={22} />
            </div>
            <div class="header-text">
                <div class="header-title-row">
                    <h1>ThemeManager</h1>
                    <span class="badge-svelte">Svelte 5</span>
                </div>
                <p class="header-desc">
                    Reactive theme preference coordinator supporting Light, Dark, System OS
                    preference & View Transitions.
                </p>
            </div>
        </div>

        <div class="status-chips-bar">
            <div class="chip">
                <span class="chip-label">Preference</span>
                <span class="chip-val">{theme.mode}</span>
            </div>
            <div class="chip chip-accent">
                <span class="chip-label">Resolved</span>
                <span class="chip-val">{theme.resolved}</span>
            </div>
        </div>
    </header>

    <!-- Content Grid -->
    <div class="grid-layout">
        <main class="column-main">
            <!-- 1. Mode Switcher -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Sun size={18} class="accent-icon" />
                        <h2>1. Theme Mode Selection</h2>
                    </div>
                    <span class="card-badge">theme.set()</span>
                </div>
                <p class="card-intro">
                    Switch between explicit <code>light</code>, <code>dark</code>, or automatic
                    <code>system</code> theme mode.
                </p>

                <div class="modes-grid">
                    <button
                        class="mode-card"
                        class:selected={theme.mode === "light"}
                        onclick={() => selectMode("light")}
                    >
                        <div class="mode-icon"><Sun size={20} /></div>
                        <div class="mode-info">
                            <strong>Light Mode</strong>
                            <span>Clean daylight contrast</span>
                        </div>
                    </button>

                    <button
                        class="mode-card"
                        class:selected={theme.mode === "dark"}
                        onclick={() => selectMode("dark")}
                    >
                        <div class="mode-icon"><Moon size={20} /></div>
                        <div class="mode-info">
                            <strong>Dark Mode</strong>
                            <span>Sleek low-light UI</span>
                        </div>
                    </button>

                    <button
                        class="mode-card"
                        class:selected={theme.mode === "system"}
                        onclick={() => selectMode("system")}
                    >
                        <div class="mode-icon"><Laptop size={20} /></div>
                        <div class="mode-info">
                            <strong>System OS</strong>
                            <span>Follows OS prefers-color-scheme</span>
                        </div>
                    </button>
                </div>

                <div class="toggle-row">
                    <button class="flat-btn btn-accent" onclick={toggleTheme}>
                        <RefreshCw size={14} />
                        <span>Toggle Theme (theme.toggle())</span>
                    </button>
                </div>
            </section>

            <!-- 2. Live Theme Morphing Preview -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Eye size={18} class="accent-icon" />
                        <h2>2. Theme Preview & Component Tokens</h2>
                    </div>
                    <span class="card-badge">Live Document Sync</span>
                </div>
                <p class="card-intro">
                    Inspect how UI components re-skin instantly when theme changes.
                </p>

                <div class="preview-components-row">
                    <div class="component-box">
                        <span class="comp-label">Surface Box</span>
                        <p class="comp-text">
                            Sample surface container reacting to <code>.dark</code> document class.
                        </p>
                        <button class="flat-btn btn-subtle">Button Sample</button>
                    </div>

                    <div class="component-box accent-box">
                        <span class="comp-label">Accent Highlight</span>
                        <p class="comp-text">
                            Accent token <code>var(--color-accent-500)</code> highlight region.
                        </p>
                        <div class="sample-tag"><Sparkles size={12} /> Active Token</div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Sidebar -->
        <aside class="column-sidebar">
            <div class="flat-card side-card">
                <div class="side-head">
                    <Sparkles size={16} class="accent-icon" />
                    <h3>Theme System Status</h3>
                </div>

                <div class="status-stack">
                    <div class="status-row">
                        <span class="row-label">Storage Key</span>
                        <code class="row-val">ui-theme</code>
                    </div>
                    <div class="status-row">
                        <span class="row-label">View Transitions</span>
                        <span class="row-val">Supported</span>
                    </div>
                    <div class="status-row">
                        <span class="row-label">HTML Class</span>
                        <code class="row-val">{theme.resolved === "dark" ? ".dark" : "(none)"}</code
                        >
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<style>
    .theme-demo {
        color-scheme: light dark;
        --bg-page: var(--color-elevation-0);
        --bg-surface: var(--color-elevation-1);
        --bg-subtle: var(--color-elevation-2);
        --bg-hover: light-dark(var(--color-base-200), var(--color-base-700));
        --text-main: var(--color-text-strong);
        --text-sub: var(--color-text-main);
        --text-muted: var(--color-text-weak);
        --accent: var(--color-accent-500);
        --accent-tint: oklch(from var(--color-accent-500) l c h / 0.12);
        box-sizing: border-box;
        min-height: 100vh;
        padding: 32px;
        color: var(--text-main);
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;

        background: var(--bg-page);
    }

    .demo-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 32px;
    }

    .header-left {
        display: flex;
        gap: 16px;
        align-items: center;
    }

    .header-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        color: var(--accent);
        background: var(--accent-tint);
        border-radius: 12px;
    }

    .header-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .header-title-row {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .header-title-row h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    .badge-svelte {
        padding: 2px 8px;
        color: var(--text-sub);
        font-size: 11px;
        font-weight: 600;
        background: var(--bg-subtle);
        border-radius: 6px;
    }

    .header-desc {
        margin: 0;
        color: var(--text-sub);
        font-size: 13px;
    }

    .status-chips-bar {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .chip {
        display: flex;
        flex-direction: column;
        min-width: 110px;
        padding: 8px 14px;
        background: var(--bg-surface);
        border-radius: 10px;
    }

    .chip-accent {
        background: var(--accent-tint);
    }

    .chip-accent .chip-val {
        color: var(--accent);
        font-weight: 700;
    }

    .chip-label {
        color: var(--text-muted);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .chip-val {
        color: var(--text-main);
        font-size: 13px;
        font-weight: 600;
    }

    .grid-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 28px;
    }

    .column-main,
    .column-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .flat-card {
        padding: 24px;
        background: var(--bg-surface);
        border-radius: 16px;
    }

    .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
    }

    .card-title {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .card-title h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .card-badge {
        padding: 4px 10px;
        color: var(--text-sub);
        font-family: monospace;
        font-size: 11px;
        background: var(--bg-subtle);
        border-radius: 20px;
    }

    .card-intro {
        margin: 0 0 18px 0;
        color: var(--text-sub);
        font-size: 13px;
    }

    .modes-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-bottom: 18px;
    }

    .mode-card {
        all: unset;
        display: flex;
        gap: 14px;
        align-items: center;
        box-sizing: border-box;
        padding: 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
        transition: all 0.15s ease;
        cursor: pointer;
    }

    .mode-card:hover {
        background: var(--bg-hover);
    }

    .mode-card.selected {
        background: var(--accent-tint);
        box-shadow: inset 0 0 0 2px var(--accent);
    }

    .mode-icon {
        display: flex;
        align-items: center;
        color: var(--accent);
    }

    .mode-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .mode-info strong {
        font-size: 13px;
        font-weight: 600;
    }

    .mode-info span {
        color: var(--text-muted);
        font-size: 11px;
    }

    .toggle-row {
        display: flex;
        gap: 12px;
    }

    .flat-btn {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        padding: 9px 18px;
        font-size: 13px;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        transition: opacity 0.15s ease;
        cursor: pointer;
    }

    .btn-accent {
        color: #ffffff;
        background: var(--accent);
    }

    .btn-accent:hover {
        opacity: 0.9;
    }

    .btn-subtle {
        color: var(--text-main);
        background: var(--bg-subtle);
    }

    .preview-components-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }

    .component-box {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 18px;
        background: var(--bg-subtle);
        border-radius: 12px;
    }

    .accent-box {
        background: var(--accent-tint);
    }

    .comp-label {
        color: var(--text-sub);
        font-size: 12px;
        font-weight: 600;
    }

    .comp-text {
        margin: 0;
        font-size: 13px;
    }

    .sample-tag {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        color: var(--accent);
        font-size: 11px;
        font-weight: 600;
    }

    .side-card {
        padding: 20px;
    }

    .side-head {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
    }

    .side-head h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
    }

    .status-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
    }

    .row-label {
        color: var(--text-muted);
    }

    .row-val {
        font-weight: 600;
    }

    :global(.accent-icon) {
        color: var(--accent);
    }
</style>
