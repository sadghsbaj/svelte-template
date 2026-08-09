<script lang="ts">
    import { Activity, Laptop, Pause, Play, Shield, Sliders, Zap, ZapOff } from "@lucide/svelte";

    import { motionPreference, type MotionPreference } from "$core/_system/motion";

    function selectPreference(pref: MotionPreference): void {
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
                    Reactive motion preference coordinator supporting Reduced Motion, No-Preference
                    & OS accessibility guards.
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
                    Configure animation preferences. <code>reduce</code> automatically suppresses CSS
                    transitions & Svelte animations for accessibility.
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
                    <div
                        class="anim-box"
                        class:pulse-animation={motionPreference.resolved === "no-preference"}
                    >
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
                        <code class="row-val"
                            >{motionPreference.resolved === "reduce"
                                ? ".ui-reduce-motion"
                                : "(none)"}</code
                        >
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

    .animation-demo-row {
        display: flex;
        justify-content: center;
        padding: 24px;
        background: var(--bg-subtle);
        border-radius: 12px;
    }

    .anim-box {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 32px;
        background: var(--bg-surface);
        border-radius: 12px;
    }

    .pulse-animation {
        animation: pulseMotion 2s infinite ease-in-out;
    }

    @keyframes pulseMotion {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.08);
        }
    }

    .anim-status {
        display: flex;
        gap: 10px;
        align-items: center;
        color: var(--accent);
        font-size: 13px;
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
