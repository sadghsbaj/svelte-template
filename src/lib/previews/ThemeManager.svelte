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
                    Reactive theme preference coordinator supporting Light, Dark, System OS preference & View Transitions.
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
                    Switch between explicit <code>light</code>, <code>dark</code>, or automatic <code>system</code> theme mode.
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
                        <p class="comp-text">Sample surface container reacting to <code>.dark</code> document class.</p>
                        <button class="flat-btn btn-subtle">Button Sample</button>
                    </div>

                    <div class="component-box accent-box">
                        <span class="comp-label">Accent Highlight</span>
                        <p class="comp-text">Accent token <code>var(--color-accent-500)</code> highlight region.</p>
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
                        <code class="row-val">{theme.resolved === "dark" ? ".dark" : "(none)"}</code>
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

        background: var(--bg-page);
        color: var(--text-main);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 32px;
        min-height: 100vh;
        box-sizing: border-box;
    }

    .demo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .header-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--accent-tint);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .header-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .header-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .header-title-row h1 {
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
    }

    .badge-svelte {
        font-size: 11px;
        font-weight: 600;
        background: var(--bg-subtle);
        color: var(--text-sub);
        padding: 2px 8px;
        border-radius: 6px;
    }

    .header-desc {
        margin: 0;
        font-size: 13px;
        color: var(--text-sub);
    }

    .status-chips-bar {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .chip {
        display: flex;
        flex-direction: column;
        padding: 8px 14px;
        background: var(--bg-surface);
        border-radius: 10px;
        min-width: 110px;
    }

    .chip-accent {
        background: var(--accent-tint);
    }

    .chip-accent .chip-val {
        color: var(--accent);
        font-weight: 700;
    }

    .chip-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
    }

    .chip-val {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
    }

    .grid-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 28px;
    }

    .column-main, .column-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .flat-card {
        background: var(--bg-surface);
        border-radius: 16px;
        padding: 24px;
    }

    .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
    }

    .card-title {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .card-title h2 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
    }

    .card-badge {
        font-family: monospace;
        font-size: 11px;
        background: var(--bg-subtle);
        color: var(--text-sub);
        padding: 4px 10px;
        border-radius: 20px;
    }

    .card-intro {
        font-size: 13px;
        color: var(--text-sub);
        margin: 0 0 18px 0;
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
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        box-sizing: border-box;
    }

    .mode-card:hover {
        background: var(--bg-hover);
    }

    .mode-card.selected {
        background: var(--accent-tint);
        box-shadow: inset 0 0 0 2px var(--accent);
    }

    .mode-icon {
        color: var(--accent);
        display: flex;
        align-items: center;
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
        font-size: 11px;
        color: var(--text-muted);
    }

    .toggle-row {
        display: flex;
        gap: 12px;
    }

    .flat-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        padding: 9px 18px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        transition: opacity 0.15s ease;
    }

    .btn-accent {
        background: var(--accent);
        color: #ffffff;
    }

    .btn-accent:hover {
        opacity: 0.9;
    }

    .btn-subtle {
        background: var(--bg-subtle);
        color: var(--text-main);
    }

    .preview-components-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }

    .component-box {
        background: var(--bg-subtle);
        border-radius: 12px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .accent-box {
        background: var(--accent-tint);
    }

    .comp-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-sub);
    }

    .comp-text {
        font-size: 13px;
        margin: 0;
    }

    .sample-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--accent);
    }

    .side-card {
        padding: 20px;
    }

    .side-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
    }

    .side-head h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
    }

    .status-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .status-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
    }

    .row-label {
        color: var(--text-muted);
    }

    .row-val {
        font-weight: 600;
    }

    .accent-icon {
        color: var(--accent);
    }
</style>
