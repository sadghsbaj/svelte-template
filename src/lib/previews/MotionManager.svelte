<script lang="ts">
    import { Activity, Laptop, Pause, Play, Shield, Sliders, Zap, ZapOff } from "@lucide/svelte";
    import { motionPreference, type MotionPreference } from "$core/_system/motion";

    function selectPreference(pref: MotionPreference) {
        motionPreference.set(pref);
    }
</script>

<div class="motion-demo">
    <!-- Header -->
    <header class="demo-header">
        <div class="header-left">
            <div class="header-icon-box">
                <Activity size={22} />
            </div>
            <div class="header-text">
                <div class="header-title-row">
                    <h1>MotionManager</h1>
                    <span class="badge-svelte">Svelte 5</span>
                </div>
                <p class="header-desc">
                    Reactive motion preference coordinator supporting Reduced Motion, No-Preference & OS accessibility guards.
                </p>
            </div>
        </div>

        <div class="status-chips-bar">
            <div class="chip">
                <span class="chip-label">Preference</span>
                <span class="chip-val">{motionPreference.preference}</span>
            </div>
            <div class="chip chip-accent">
                <span class="chip-label">Resolved</span>
                <span class="chip-val">{motionPreference.resolved}</span>
            </div>
        </div>
    </header>

    <!-- Grid Layout -->
    <div class="grid-layout">
        <main class="column-main">
            <!-- 1. Motion Preference Selection -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Sliders size={18} class="accent-icon" />
                        <h2>1. Motion Preference Selection</h2>
                    </div>
                    <span class="card-badge">motionPreference.set()</span>
                </div>
                <p class="card-intro">
                    Configure animation preferences. <code>reduce</code> automatically suppresses CSS transitions & Svelte animations for accessibility.
                </p>

                <div class="modes-grid">
                    <button
                        class="mode-card"
                        class:selected={motionPreference.preference === "no-preference"}
                        onclick={() => selectPreference("no-preference")}
                    >
                        <div class="mode-icon"><Zap size={20} /></div>
                        <div class="mode-info">
                            <strong>Full Motion</strong>
                            <span>Standard smooth animations</span>
                        </div>
                    </button>

                    <button
                        class="mode-card"
                        class:selected={motionPreference.preference === "reduce"}
                        onclick={() => selectPreference("reduce")}
                    >
                        <div class="mode-icon"><ZapOff size={20} /></div>
                        <div class="mode-info">
                            <strong>Reduced Motion</strong>
                            <span>Bypasses motion & transitions</span>
                        </div>
                    </button>

                    <button
                        class="mode-card"
                        class:selected={motionPreference.preference === "system"}
                        onclick={() => selectPreference("system")}
                    >
                        <div class="mode-icon"><Laptop size={20} /></div>
                        <div class="mode-info">
                            <strong>System OS</strong>
                            <span>Follows OS prefers-reduced-motion</span>
                        </div>
                    </button>
                </div>
            </section>

            <!-- 2. Motion Guard Live Test -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Activity size={18} class="accent-icon" />
                        <h2>2. Live Motion Guard Demo</h2>
                    </div>
                    <span class="card-badge">withMotionGuard</span>
                </div>
                <p class="card-intro">
                    Test how animations respond to <code>motionPreference.resolved</code> state.
                </p>

                <div class="animation-demo-row">
                    <div class="anim-box" class:pulse-animation={motionPreference.resolved === "no-preference"}>
                        <div class="anim-status">
                            {#if motionPreference.resolved === "reduce"}
                                <Pause size={18} />
                                <span>Animations Bypassed</span>
                            {:else}
                                <Play size={18} />
                                <span>Animating Smoothly</span>
                            {/if}
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Sidebar -->
        <aside class="column-sidebar">
            <div class="flat-card side-card">
                <div class="side-head">
                    <Shield size={16} class="accent-icon" />
                    <h3>Accessibility & Storage</h3>
                </div>

                <div class="status-stack">
                    <div class="status-row">
                        <span class="row-label">Storage Key</span>
                        <code class="row-val">ui-motion-preference</code>
                    </div>
                    <div class="status-row">
                        <span class="row-label">HTML Class</span>
                        <code class="row-val">{motionPreference.resolved === "reduce" ? ".ui-reduce-motion" : "(none)"}</code>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<style>
    .motion-demo {
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

    .animation-demo-row {
        display: flex;
        justify-content: center;
        padding: 24px;
        background: var(--bg-subtle);
        border-radius: 12px;
    }

    .anim-box {
        padding: 20px 32px;
        background: var(--bg-surface);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pulse-animation {
        animation: pulseMotion 2s infinite ease-in-out;
    }

    @keyframes pulseMotion {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
    }

    .anim-status {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
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
