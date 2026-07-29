<script lang="ts">
    import {
        ArrowLeft,
        Box,
        Database,
        Layers,
        PanelRight,
        Plus,
        Sliders,
        Terminal,
        Trash2,
        X,
    } from "@lucide/svelte";
    import { appStack, stackAttach } from "$core/_system/stack";

    // --- State for Interactive Logs ---
    interface LogItem {
        id: number;
        time: string;
        message: string;
        type: "success" | "info" | "warning" | "danger";
    }

    let logs = $state<LogItem[]>([]);
    let logCounter = 0;

    function log(message: string, type: "success" | "info" | "warning" | "danger" = "info") {
        const time = new Date().toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        });
        logs = [{ id: ++logCounter, time, message, type }, ...logs.slice(0, 49)];
    }

    function clearLogs() {
        logs = [];
    }

    // --- Overlay & Drawer Mock States ---
    let isOverlay1Open = $state(false);
    let isOverlay2Open = $state(false);
    let isDrawerOpen = $state(false);
    let isAttachBoxMounted = $state(false);

    let overlay1Unreg: (() => void) | null = null;
    let overlay2Unreg: (() => void) | null = null;
    let drawerUnreg: (() => void) | null = null;

    function openOverlay1() {
        if (isOverlay1Open) return;
        isOverlay1Open = true;
        overlay1Unreg = appStack.register(
            () => {
                isOverlay1Open = false;
                log("Popped Overlay 1 (Priority: overlay / 100)", "warning");
            },
            { priority: "overlay", scope: appStack.activeScope }
        );
        log("Registered Overlay 1 (Priority: overlay / 100)", "success");
    }

    function closeOverlay1() {
        if (overlay1Unreg) {
            overlay1Unreg();
            overlay1Unreg = null;
        }
        isOverlay1Open = false;
    }

    function openOverlay2() {
        if (isOverlay2Open) return;
        isOverlay2Open = true;
        overlay2Unreg = appStack.register(
            () => {
                isOverlay2Open = false;
                log("Popped Overlay 2 (Nested Modal / Priority: 120)", "warning");
            },
            { priority: 120, scope: appStack.activeScope }
        );
        log("Registered Overlay 2 (Nested Modal / Priority: 120)", "success");
    }

    function closeOverlay2() {
        if (overlay2Unreg) {
            overlay2Unreg();
            overlay2Unreg = null;
        }
        isOverlay2Open = false;
    }

    function openDrawer() {
        if (isDrawerOpen) return;
        isDrawerOpen = true;
        drawerUnreg = appStack.register(
            () => {
                isDrawerOpen = false;
                log("Popped Side Drawer (Priority: subview / 50)", "warning");
            },
            { priority: "subview", scope: appStack.activeScope }
        );
        log("Registered Side Drawer (Priority: subview / 50)", "success");
    }

    function closeDrawer() {
        if (drawerUnreg) {
            drawerUnreg();
            drawerUnreg = null;
        }
        isDrawerOpen = false;
    }

    function triggerPop() {
        const popped = appStack.pop();
        if (!popped) {
            log("appStack.pop() returned false (Stack empty for active scope)", "info");
        }
    }

    // --- Attach Action Handler ---
    function handleAttachStackPop() {
        isAttachBoxMounted = false;
        log("{@attach stackAttach} Action Executed ➔ Attached element popped!", "warning");
    }
</script>

<div class="stack-demo">
    <!-- Header -->
    <header class="demo-header">
        <div class="header-left">
            <div class="header-icon-box">
                <Layers size={22} />
            </div>
            <div class="header-text">
                <div class="header-title-row">
                    <h1>AppStackManager</h1>
                    <span class="badge-svelte">Svelte 5</span>
                </div>
                <p class="header-desc">
                    Priority-based LIFO Back-Stack manager coordinating overlays, subviews, browser
                    history & attachments.
                </p>
            </div>
        </div>

        <div class="status-chips-bar">
            <div class="chip">
                <span class="chip-label">Total Entries</span>
                <span class="chip-val">{appStack.size}</span>
            </div>
            <div class="chip chip-accent">
                <span class="chip-label">Active Scope</span>
                <span class="chip-val">{appStack.activeScope}</span>
            </div>
            <div class="chip" class:chip-active={appStack.canGoBack}>
                <span class="chip-label">Can Go Back</span>
                <span class="chip-val">{appStack.canGoBack ? "YES" : "NO"}</span>
            </div>
        </div>
    </header>

    <!-- Grid Layout -->
    <div class="grid-layout">
        <!-- Main Column -->
        <main class="column-main">
            <!-- 1. Interactive Stack Triggers -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Layers size={18} class="accent-icon" />
                        <h2>1. Stack Triggers & Overlays</h2>
                    </div>
                    <span class="card-badge">appStack.register()</span>
                </div>
                <p class="card-intro">
                    Register stack entries with priority levels (e.g. <code>overlay: 100</code>,
                    <code>subview: 50</code>). Calling <code>pop()</code> resolves higher priority & recent
                    sequence entries first.
                </p>

                <div class="actions-row">
                    <button class="flat-btn btn-accent" onclick={openOverlay1}>
                        <Plus size={14} />
                        <span>Open Overlay 1 (Priority: 100)</span>
                    </button>

                    <button class="flat-btn btn-subtle" onclick={openOverlay2}>
                        <Plus size={14} />
                        <span>Open Modal 2 (Priority: 120)</span>
                    </button>

                    <button class="flat-btn btn-subtle" onclick={openDrawer}>
                        <PanelRight size={14} />
                        <span>Open Drawer (Priority: 50)</span>
                    </button>
                </div>

                <div class="pop-control-bar">
                    <button
                        class="flat-btn btn-pop"
                        disabled={!appStack.canGoBack}
                        onclick={triggerPop}
                    >
                        <ArrowLeft size={15} />
                        <span>Trigger Back / Pop (appStack.pop())</span>
                    </button>
                </div>

                <!-- Active Mock Overlays Display -->
                <div class="mock-overlays-container">
                    {#if isOverlay1Open}
                        <div class="mock-card overlay-1">
                            <div class="mock-head">
                                <strong>Overlay 1 Active (Priority: 100)</strong>
                                <button class="icon-btn" onclick={closeOverlay1}
                                    ><X size={14} /></button
                                >
                            </div>
                            <span>Registered on appStack. Close via Pop or button.</span>
                        </div>
                    {/if}

                    {#if isOverlay2Open}
                        <div class="mock-card overlay-2">
                            <div class="mock-head">
                                <strong>Modal 2 Active (Priority: 120)</strong>
                                <button class="icon-btn" onclick={closeOverlay2}
                                    ><X size={14} /></button
                                >
                            </div>
                            <span>Higher priority (120) ➔ Will pop before Overlay 1!</span>
                        </div>
                    {/if}

                    {#if isDrawerOpen}
                        <div class="mock-card drawer">
                            <div class="mock-head">
                                <strong>Side Drawer Active (Priority: 50)</strong>
                                <button class="icon-btn" onclick={closeDrawer}
                                    ><X size={14} /></button
                                >
                            </div>
                            <span>Lower priority (50) ➔ Pops after overlays.</span>
                        </div>
                    {/if}
                </div>
            </section>

            <!-- 2. Svelte 5 Attachment ({@attach stackAttach}) -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Box size={18} class="accent-icon" />
                        <h2>2. Svelte 5 Element Attachment</h2>
                    </div>
                    <span class="card-badge">&#123;@attach stackAttach&#125;</span>
                </div>
                <p class="card-intro">
                    Mounting an element with <code>&#123;@attach stackAttach(action)&#125;</code> automatically
                    registers a stack entry, and unregisters on DOM unmount.
                </p>

                <div class="attach-toggle-bar">
                    <button
                        class="flat-btn btn-subtle"
                        onclick={() => (isAttachBoxMounted = !isAttachBoxMounted)}
                    >
                        {#if isAttachBoxMounted}
                            <X size={14} />
                            <span>Unmount Attached Box</span>
                        {:else}
                            <Plus size={14} />
                            <span>Mount Element with &#123;@attach stackAttach&#125;</span>
                        {/if}
                    </button>
                </div>

                {#if isAttachBoxMounted}
                    <div
                        class="attached-surface-box"
                        {@attach stackAttach(handleAttachStackPop, { priority: "overlay" })}
                    >
                        <div class="attached-head">
                            <Box size={18} class="accent-icon" />
                            <strong>Element Attached to appStack</strong>
                        </div>
                        <p>
                            This DOM element registered its stack action via <code
                                >&#123;@attach&#125;</code
                            >. Calling <code>appStack.pop()</code> will execute its action and unmount
                            it.
                        </p>
                    </div>
                {/if}
            </section>

            <!-- 3. Scope Isolation Switcher -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Sliders size={18} class="accent-icon" />
                        <h2>3. Scope Isolation Switcher</h2>
                    </div>
                    <span class="card-badge">appStack.setScope()</span>
                </div>
                <p class="card-intro">
                    Switch active scope. Entries registered under other scopes are ignored during <code
                        >pop()</code
                    > unless matched.
                </p>

                <div class="scope-buttons-row">
                    <button
                        class="scope-pill"
                        class:active={appStack.activeScope === "global"}
                        onclick={() => appStack.setScope("global")}
                    >
                        <span>global</span>
                    </button>
                    <button
                        class="scope-pill"
                        class:active={appStack.activeScope === "dashboard"}
                        onclick={() => appStack.setScope("dashboard")}
                    >
                        <span>dashboard</span>
                    </button>
                    <button
                        class="scope-pill"
                        class:active={appStack.activeScope === "settings"}
                        onclick={() => appStack.setScope("settings")}
                    >
                        <span>settings</span>
                    </button>
                </div>
            </section>
        </main>

        <!-- Sidebar Column -->
        <aside class="column-sidebar">
            <!-- Live Stack Queue Inspector -->
            <div class="flat-card side-card">
                <div class="side-head">
                    <Database size={16} class="accent-icon" />
                    <h3>Live Stack Inspector</h3>
                </div>

                <div class="stack-entries-list">
                    {#if appStack.entries.length === 0}
                        <div class="stack-empty">
                            <span>Stack is currently empty</span>
                        </div>
                    {:else}
                        {#each appStack.entries.toReversed() as entry (entry.id)}
                            <div class="entry-row">
                                <div class="entry-meta">
                                    <span class="entry-prio">Prio: {entry.priority}</span>
                                    <span class="entry-scope">[{entry.scope}]</span>
                                </div>
                                <span class="entry-id"
                                    >#{entry.sequence} ({entry.id.slice(0, 6)})</span
                                >
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Terminal Execution Log -->
            <div class="flat-card side-card terminal-panel">
                <div class="side-head term-head">
                    <div class="term-title">
                        <Terminal size={16} class="accent-icon" />
                        <h3>Stack Action Log</h3>
                    </div>
                    <button class="icon-btn" onclick={clearLogs} title="Clear Log">
                        <Trash2 size={14} />
                    </button>
                </div>

                <div class="terminal-body">
                    {#if logs.length === 0}
                        <div class="terminal-placeholder">
                            <span>Trigger stack overlays or pop actions to inspect events...</span>
                        </div>
                    {:else}
                        {#each logs as item (item.id)}
                            <div class="log-row log- {item.type}">
                                <span class="log-time">[{item.time}]</span>
                                <span class="log-text">{item.message}</span>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </aside>
    </div>
</div>

<style>
    .stack-demo {
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

    .chip-active {
        border-left: 3px solid #4ade80;
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
        line-height: 1.5;
    }

    .actions-row {
        display: flex;
        gap: 12px;
        margin-bottom: 14px;
    }

    .pop-control-bar {
        margin-bottom: 18px;
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
        transition:
            opacity 0.15s ease,
            background-color 0.15s ease;
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

    .btn-subtle:hover {
        background: var(--bg-hover);
    }

    .btn-pop {
        justify-content: center;
        width: 100%;
        color: #ffffff;
        background: #ef4444;
    }

    .btn-pop:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .mock-overlays-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .mock-card {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 14px 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
    }

    .overlay-1 {
        border-left: 4px solid var(--accent);
    }

    .overlay-2 {
        border-left: 4px solid #a855f7;
    }

    .drawer {
        border-left: 4px solid #eab308;
    }

    .mock-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
    }

    .mock-card span {
        color: var(--text-sub);
        font-size: 12px;
    }

    .attach-toggle-bar {
        margin-bottom: 14px;
    }

    .attached-surface-box {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 16px 20px;
        background: var(--accent-tint);
        border-radius: 12px;
    }

    .attached-head {
        display: flex;
        gap: 8px;
        align-items: center;
        color: var(--accent);
        font-size: 13px;
    }

    .attached-surface-box p {
        margin: 0;
        color: var(--text-sub);
        font-size: 12px;
    }

    .scope-buttons-row {
        display: flex;
        gap: 10px;
    }

    .scope-pill {
        all: unset;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 600;
        background: var(--bg-subtle);
        border-radius: 8px;
        transition: all 0.15s ease;
        cursor: pointer;
    }

    .scope-pill.active {
        color: #ffffff;
        background: var(--accent);
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

    .stack-entries-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 280px;
        overflow-y: auto;
    }

    .stack-empty {
        padding: 20px;
        color: var(--text-muted);
        font-size: 12px;
        font-style: italic;
        text-align: center;
    }

    .entry-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        font-size: 12px;
        background: var(--bg-subtle);
        border-radius: 8px;
    }

    .entry-meta {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .entry-prio {
        color: var(--accent);
        font-weight: 700;
    }

    .entry-scope {
        color: var(--text-muted);
        font-family: monospace;
    }

    .entry-id {
        color: var(--text-sub);
        font-family: monospace;
    }

    .term-head {
        justify-content: space-between;
    }

    .term-title {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        padding: 4px;
        color: var(--text-muted);
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .icon-btn:hover {
        color: var(--text-main);
        background: var(--bg-subtle);
    }

    .terminal-body {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 380px;
        padding: 14px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 11px;
        background: var(--color-zinc-900, #18181b);
        border-radius: 12px;
    }

    .terminal-placeholder {
        padding: 28px 8px;
        color: var(--color-zinc-500, #71717a);
        text-align: center;
    }

    .log-row {
        display: flex;
        gap: 8px;
        line-height: 1.4;
        word-break: break-word;
    }

    .log-time {
        color: var(--color-zinc-500, #71717a);
    }

    .log-info .log-text {
        color: #60a5fa;
    }

    .log-success .log-text {
        color: #4ade80;
    }

    .log-warning .log-text {
        color: #facc15;
    }

    .log-danger .log-text {
        color: #f87171;
    }

    .accent-icon {
        color: var(--accent);
    }
</style>
