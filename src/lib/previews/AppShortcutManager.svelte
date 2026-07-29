<script lang="ts">
    import { untrack } from "svelte";
    import {
        Box,
        Focus,
        Keyboard,
        Layers,
        MousePointer,
        Plus,
        ShieldAlert,
        SlidersHorizontal,
        Terminal,
        Trash2,
        X,
    } from "@lucide/svelte";
    import { appShortcut, shortcutAttach } from "$core/_system/shortcut/appShortcut.svelte";

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

    // --- Scope Stacking State ---
    let isModalOpen = $state(false);
    let isFormOpen = $state(false);
    let modalCleanup: (() => void) | null = null;
    let formCleanup: (() => void) | null = null;

    function toggleModal() {
        if (!isModalOpen) {
            isModalOpen = true;
            modalCleanup = appShortcut.pushScope("modal");
            log("Pushed scope: 'modal' ➔ Active: " + appShortcut.activeScope, "info");
        } else {
            if (isFormOpen) toggleForm();
            if (modalCleanup) modalCleanup();
            isModalOpen = false;
            log("Popped scope: 'modal' ➔ Active: " + appShortcut.activeScope, "warning");
        }
    }

    function toggleForm() {
        if (!isFormOpen) {
            isFormOpen = true;
            formCleanup = appShortcut.pushScope("form");
            log("Pushed scope: 'form' ➔ Active: " + appShortcut.activeScope, "info");
        } else {
            if (formCleanup) formCleanup();
            isFormOpen = false;
            log("Popped scope: 'form' ➔ Active: " + appShortcut.activeScope, "warning");
        }
    }

    // --- Global Shortcuts Registration ---
    $effect(() => {
        return untrack(() => {
            const unreg1 = appShortcut.register("Cmd+Shift+L", () => {
                log("Global Shortcut: Cmd+Shift+L ➔ Cleared logs!", "success");
                clearLogs();
            });

            const unreg2 = appShortcut.register("Cmd+K", () => {
                log("Global Shortcut: Cmd+K (Search / Command Palette)", "success");
            });

            const unreg3 = appShortcut.register("g i", () => {
                log("Sequence Completed: 'g i' (Go to Inbox)", "success");
            });

            const unreg4 = appShortcut.register("g h", () => {
                log("Sequence Completed: 'g h' (Go to Home)", "success");
            });

            const unreg5 = appShortcut.register(
                "Space",
                () => {
                    log("Hold Shortcut Fired: Space held for 400ms!", "warning");
                },
                { hold: 400 }
            );

            const unreg6 = appShortcut.register(
                "Cmd+Enter",
                () => {
                    log("Submit Shortcut: Cmd+Enter fired", "success");
                },
                { allowInInput: true }
            );

            // Modal Scope Shortcuts
            const unreg7 = appShortcut.register(
                "Esc",
                () => {
                    log("Scope Shortcut 'Esc' matched in scope: " + appShortcut.activeScope, "danger");
                    if (isFormOpen) toggleForm();
                    else if (isModalOpen) toggleModal();
                },
                { scope: "modal" }
            );

            const unreg8 = appShortcut.register(
                "Cmd+S",
                () => {
                    log("Scope Shortcut 'Cmd+S' (Save Form) in scope: 'form'", "success");
                },
                { scope: "form", allowInInput: true }
            );

            // Physical Key Matching (useCode: true)
            const unreg9 = appShortcut.register(
                "Cmd+-",
                () => {
                    log("Physical Key: Cmd+- (Zoom Out) via useCode: true", "info");
                },
                { useCode: true }
            );

            const unreg10 = appShortcut.register(
                "Cmd+,",
                () => {
                    log("Physical Key: Cmd+, (Preferences) via useCode: true", "info");
                },
                { useCode: true }
            );

            const unreg11 = appShortcut.register(
                "Cmd+.",
                () => {
                    log("Physical Key: Cmd+. (Stop) via useCode: true", "info");
                },
                { useCode: true }
            );

            const unreg12 = appShortcut.register(
                "d",
                () => {
                    log(
                        "Single Key 'd' (Delete) fired! (Allowed on non-text inputs like Checkbox)",
                        "danger"
                    );
                },
                { allowInInput: false }
            );

            return () => {
                unreg1();
                unreg2();
                unreg3();
                unreg4();
                unreg5();
                unreg6();
                unreg7();
                unreg8();
                unreg9();
                unreg10();
                unreg11();
                unreg12();
            };
        });
    });

    // --- Attachment Actions ---
    function handleMountAction() {
        log("Mount Attachment Action: Hotkey 'Cmd+M' triggered while mounted!", "success");
    }

    function handleFocusAction() {
        log("Focus Attachment Action: Hotkey 'Cmd+F' triggered while focused!", "success");
    }

    function handleHoverAction() {
        log("Hover Attachment Action: Hotkey 'Cmd+H' triggered while hovered!", "success");
    }
</script>

<div class="shortcut-demo">
    <!-- Top Header -->
    <header class="demo-header">
        <div class="header-left">
            <div class="header-icon-box">
                <Keyboard size={22} />
            </div>
            <div class="header-text">
                <div class="header-title-row">
                    <h1>AppShortcutManager</h1>
                    <span class="badge-svelte">Svelte 5</span>
                </div>
                <p class="header-desc">
                    Ultra-flat test harness for key combos, scopes, element attachments & input guarding.
                </p>
            </div>
        </div>

        <div class="status-chips-bar">
            <div class="chip">
                <span class="chip-label">Stack</span>
                <span class="chip-mono">[{appShortcut.scopeStack.join(", ")}]</span>
            </div>
            <div class="chip chip-accent">
                <span class="chip-label">Active Scope</span>
                <span class="chip-val">{appShortcut.activeScope}</span>
            </div>
            {#if appShortcut.pendingSequence}
                <div class="chip chip-warn">
                    <span class="chip-label">Sequence</span>
                    <span class="chip-val pulse-val">{appShortcut.pendingSequence}</span>
                </div>
            {/if}
        </div>
    </header>

    <!-- Top-Down Grid Layout -->
    <div class="grid-layout">
        <!-- Main Column -->
        <main class="column-main">
            <!-- 1. Scope Stack Hierarchy -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Layers size={18} class="accent-icon" />
                        <h2>1. Scope Stack Hierarchy</h2>
                    </div>
                    <span class="card-badge">pushScope / popScope</span>
                </div>
                <p class="card-intro">
                    Scope isolation keeps hotkeys contained. <code>modal</code> and <code>form</code> hotkeys fire strictly when active in the stack.
                </p>

                <div class="actions-row">
                    <button class="flat-btn btn-accent" onclick={toggleModal}>
                        {#if isModalOpen}
                            <X size={14} />
                            <span>Close Modal (popScope)</span>
                        {:else}
                            <Plus size={14} />
                            <span>Open Modal (pushScope 'modal')</span>
                        {/if}
                    </button>

                    {#if isModalOpen}
                        <button class="flat-btn btn-subtle" onclick={toggleForm}>
                            {#if isFormOpen}
                                <X size={14} />
                                <span>Close Form (popScope)</span>
                            {:else}
                                <Plus size={14} />
                                <span>Open Form (pushScope 'form')</span>
                            {/if}
                        </button>
                    {/if}
                </div>

                {#if isModalOpen}
                    <div class="surface-box box-modal">
                        <div class="box-head">
                            <span class="box-title">Modal Scope (<code>modal</code>)</span>
                            <span class="box-hint">Press <kbd>Esc</kbd> to close</span>
                        </div>

                        {#if isFormOpen}
                            <div class="surface-box box-form">
                                <div class="box-head">
                                    <span class="box-title">Form Subview (<code>form</code>)</span>
                                    <span class="box-hint">Press <kbd>Cmd+S</kbd> to save</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type here... (Cmd+S allowed inside input)"
                                    class="flat-input"
                                />
                            </div>
                        {:else}
                            <p class="box-desc">
                                Modal scope active. Click "Open Form" to stack the <code>form</code> scope over <code>modal</code>.
                            </p>
                        {/if}
                    </div>
                {/if}
            </section>

            <!-- 2. Svelte 5 Attachments -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <Box size={18} class="accent-icon" />
                        <h2>2. Svelte 5 Element Attachments</h2>
                    </div>
                    <span class="card-badge">&#123;@attach&#125;</span>
                </div>
                <p class="card-intro">
                    Native Svelte 5 element attachments binding hotkeys directly to DOM element lifecycle triggers.
                </p>

                <div class="attach-grid">
                    <!-- Mount -->
                    <div
                        class="attach-tile"
                        {@attach shortcutAttach("Cmd+M", handleMountAction, { attachOn: "mount" })}
                    >
                        <div class="tile-icon">
                            <Box size={18} />
                        </div>
                        <div class="tile-content">
                            <strong>Mount Trigger</strong>
                            <span>Active while mounted</span>
                        </div>
                        <kbd>Cmd+M</kbd>
                    </div>

                    <!-- Focus -->
                    <button
                        class="attach-tile clickable"
                        type="button"
                        {@attach shortcutAttach("Cmd+F", handleFocusAction, { attachOn: "focus" })}
                    >
                        <div class="tile-icon">
                            <Focus size={18} />
                        </div>
                        <div class="tile-content">
                            <strong>Focus Trigger</strong>
                            <span>Click to focus & activate</span>
                        </div>
                        <kbd>Cmd+F</kbd>
                    </button>

                    <!-- Hover -->
                    <div
                        class="attach-tile"
                        {@attach shortcutAttach("Cmd+H", handleHoverAction, { attachOn: "hover" })}
                    >
                        <div class="tile-icon">
                            <MousePointer size={18} />
                        </div>
                        <div class="tile-content">
                            <strong>Hover Trigger</strong>
                            <span>Hover mouse here</span>
                        </div>
                        <kbd>Cmd+H</kbd>
                    </div>
                </div>
            </section>

            <!-- 3. Input Guarding -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <ShieldAlert size={18} class="accent-icon" />
                        <h2>3. Input Guarding & Non-Text Controls</h2>
                    </div>
                    <span class="card-badge">allowInInput</span>
                </div>

                <div class="form-stack">
                    <div class="form-group">
                        <label for="text-input-demo">Text Input (Hotkeys Guarded)</label>
                        <input
                            id="text-input-demo"
                            type="text"
                            class="flat-input"
                            placeholder="Type here... Single key 'd' is blocked, Cmd+Enter allowed"
                        />
                        <span class="field-info">Single key shortcuts like <kbd>d</kbd> are ignored while typing in text inputs.</span>
                    </div>

                    <div class="form-group">
                        <label for="rich-textbox-demo">Rich Text Editor (role="textbox")</label>
                        <div
                            id="rich-textbox-demo"
                            role="textbox"
                            contenteditable="true"
                            tabindex="0"
                            class="flat-input editable-area"
                        >
                            Editable rich text region... (Hotkeys guarded)
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="group-label">Non-Text Controls (Hotkeys ALLOWED)</span>
                        <div class="controls-bar">
                            <label class="control-check">
                                <input type="checkbox" class="flat-checkbox" />
                                <span>Checkbox (Press <kbd>d</kbd>)</span>
                            </label>
                            <label class="control-check">
                                <input type="radio" name="flat-radio" class="flat-radio" />
                                <span>Radio Control</span>
                            </label>
                            <div class="control-slider">
                                <span>Slider:</span>
                                <input type="range" min="0" max="100" class="flat-range" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Physical Keys & Sequences -->
            <section class="flat-card">
                <div class="card-head">
                    <div class="card-title">
                        <SlidersHorizontal size={18} class="accent-icon" />
                        <h2>4. Physical Keys & Sequences</h2>
                    </div>
                    <span class="card-badge">useCode & Sequences</span>
                </div>

                <div class="pills-flex">
                    <div class="flat-pill">
                        <kbd>g i</kbd>
                        <span>Sequence (Inbox)</span>
                    </div>
                    <div class="flat-pill">
                        <kbd>g h</kbd>
                        <span>Sequence (Home)</span>
                    </div>
                    <div class="flat-pill">
                        <kbd>Space (Hold)</kbd>
                        <span>400ms Hold Timer</span>
                    </div>
                    <div class="flat-pill">
                        <kbd>Cmd + -</kbd>
                        <span>Zoom Out (Physical)</span>
                    </div>
                    <div class="flat-pill">
                        <kbd>Cmd + ,</kbd>
                        <span>Preferences (Physical)</span>
                    </div>
                    <div class="flat-pill">
                        <kbd>Cmd + .</kbd>
                        <span>Stop (Physical)</span>
                    </div>
                    <div class="flat-pill">
                        <kbd>Cmd + Shift + L</kbd>
                        <span>Clear Log</span>
                    </div>
                </div>
            </section>
        </main>

        <!-- Sidebar Column -->
        <aside class="column-sidebar">
            <!-- Modifier Monitor -->
            <div class="flat-card side-card">
                <div class="side-head">
                    <Keyboard size={16} class="accent-icon" />
                    <h3>Live Modifier State</h3>
                </div>

                <div class="modifiers-grid">
                    <span class="mod-pill" class:active={appShortcut.modifiers.cmd}>Cmd / Meta</span>
                    <span class="mod-pill" class:active={appShortcut.modifiers.ctrl}>Ctrl</span>
                    <span class="mod-pill" class:active={appShortcut.modifiers.alt}>Alt</span>
                    <span class="mod-pill" class:active={appShortcut.modifiers.shift}>Shift</span>
                </div>

                <div class="keys-held-group">
                    <span class="keys-label">Currently Pressed Keys:</span>
                    {#if appShortcut.pressedKeys.size > 0}
                        <div class="keys-list">
                            {#each Array.from(appShortcut.pressedKeys) as k (k)}
                                <kbd class="kbd-active">{k}</kbd>
                            {/each}
                        </div>
                    {:else}
                        <span class="keys-none">No keys held</span>
                    {/if}
                </div>
            </div>

            <!-- Terminal Log -->
            <div class="flat-card side-card terminal-panel">
                <div class="side-head term-head">
                    <div class="term-title">
                        <Terminal size={16} class="accent-icon" />
                        <h3>Event Execution Log</h3>
                    </div>
                    <button class="icon-btn" onclick={clearLogs} title="Clear Log">
                        <Trash2 size={14} />
                    </button>
                </div>

                <div class="terminal-body">
                    {#if logs.length === 0}
                        <div class="terminal-placeholder">
                            <span>Press any registered hotkey to test...</span>
                        </div>
                    {:else}
                        {#each logs as item (item.id)}
                            <div class="log-row log-{item.type}">
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
    /* Clean Ultra-Flat Zinc Design Tokens */
    .shortcut-demo {
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

    /* Header */
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

    /* Status Bar */
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

    .chip-mono {
        font-family: monospace;
        font-size: 12px;
        color: var(--text-sub);
    }

    .pulse-val {
        color: #eab308;
    }

    /* Grid Layout */
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

    /* Borderless Flat Cards */
    .flat-card {
        background: var(--bg-surface);
        border-radius: 16px;
        padding: 24px;
        border: none;
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
        letter-spacing: -0.01em;
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
        line-height: 1.5;
    }

    /* Buttons */
    .actions-row {
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
        transition: opacity 0.15s ease, background-color 0.15s ease;
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

    .btn-subtle:hover {
        background: var(--bg-hover);
    }

    /* Surface Nested Boxes */
    .surface-box {
        border-radius: 12px;
        padding: 18px;
        margin-top: 14px;
        border: none;
    }

    .box-modal {
        background: var(--bg-subtle);
    }

    .box-form {
        background: #ffffff;
        margin-top: 12px;
    }

    .box-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .box-title {
        font-size: 13px;
        font-weight: 600;
    }

    .box-hint {
        font-size: 12px;
        color: var(--text-muted);
    }

    .box-desc {
        font-size: 13px;
        color: var(--text-sub);
        margin: 0;
    }

    /* Attachment Grid */
    .attach-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
    }

    .attach-tile {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
        transition: background-color 0.15s ease;
    }

    .attach-tile.clickable {
        all: unset;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
        box-sizing: border-box;
        cursor: pointer;
    }

    .attach-tile:hover, .attach-tile:focus-within {
        background: var(--accent-tint);
    }

    .tile-icon {
        color: var(--accent);
        display: flex;
        align-items: center;
    }

    .tile-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 2px;
    }

    .tile-content strong {
        font-size: 13px;
        font-weight: 600;
    }

    .tile-content span {
        font-size: 11px;
        color: var(--text-muted);
    }

    /* Inputs */
    .form-stack {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label, .group-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-sub);
    }

    .flat-input {
        font-size: 13px;
        padding: 10px 14px;
        border: none;
        border-radius: 10px;
        background: var(--bg-subtle);
        color: var(--text-main);
        outline: none;
        transition: background-color 0.15s ease;
    }

    .flat-input:focus {
        background: #ffffff;
        box-shadow: 0 0 0 2px var(--accent);
    }

    .editable-area {
        min-height: 48px;
        line-height: 1.4;
    }

    .field-info {
        font-size: 11px;
        color: var(--text-muted);
    }

    .controls-bar {
        display: flex;
        align-items: center;
        gap: 24px;
        background: var(--bg-subtle);
        padding: 14px 18px;
        border-radius: 10px;
    }

    .control-check {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        cursor: pointer;
    }

    .flat-checkbox, .flat-radio, .flat-range {
        accent-color: var(--accent);
    }

    .control-slider {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
    }

    /* Pills */
    .pills-flex {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .flat-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: var(--bg-subtle);
        border-radius: 10px;
        font-size: 12px;
        color: var(--text-sub);
    }

    /* KBD Styling */
    kbd {
        font-family: monospace;
        font-size: 11px;
        font-weight: 600;
        background: var(--bg-subtle);
        color: var(--text-main);
        padding: 3px 7px;
        border-radius: 6px;
        border: none;
    }

    .accent-icon {
        color: var(--accent);
    }

    /* Sidebar Cards */
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

    .modifiers-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 18px;
    }

    .mod-pill {
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        padding: 8px;
        background: var(--bg-subtle);
        color: var(--text-muted);
        border-radius: 8px;
        transition: all 0.15s ease;
    }

    .mod-pill.active {
        background: var(--accent);
        color: #ffffff;
    }

    .keys-held-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .keys-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
    }

    .keys-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .kbd-active {
        background: var(--accent);
        color: #ffffff;
    }

    .keys-none {
        font-size: 12px;
        color: var(--text-muted);
        font-style: italic;
    }

    /* Terminal Panel */
    .terminal-panel {
        display: flex;
        flex-direction: column;
    }

    .term-head {
        justify-content: space-between;
    }

    .term-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
    }

    .icon-btn:hover {
        background: var(--bg-subtle);
        color: var(--text-main);
    }

    .terminal-body {
        background: var(--color-zinc-900, #18181b);
        border-radius: 12px;
        padding: 14px;
        max-height: 380px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 11px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .terminal-placeholder {
        color: var(--color-zinc-500, #71717a);
        text-align: center;
        padding: 28px 8px;
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
</style>
