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
    import { appShortcut, shortcutAttach } from "$modules/shortcut/appShortcut.svelte";

    // --- State for Interactive Logs ---
    interface LogItem {
        id: number;
        time: string;
        message: string;
        type: "success" | "info" | "warning" | "danger";
    }

    let logs = $state<LogItem[]>([]);
    let logCounter = 0;

    function log(message: string, type: "success" | "info" | "warning" | "danger" = "info"): void {
        const time = new Date().toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        });
        logs = [{ id: ++logCounter, time, message, type }, ...logs.slice(0, 49)];
    }

    function clearLogs(): void {
        logs = [];
    }

    // --- Scope Stacking State ---
    let isModalOpen = $state(false);
    let isFormOpen = $state(false);
    let modalCleanup: (() => void) | null = null;
    let formCleanup: (() => void) | null = null;

    function toggleModal(): void {
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

    function toggleForm(): void {
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
                    log(
                        "Scope Shortcut 'Esc' matched in scope: " + appShortcut.activeScope,
                        "danger"
                    );
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
    function handleMountAction(): void {
        log("Mount Attachment Action: Hotkey 'Cmd+M' triggered while mounted!", "success");
    }

    function handleFocusAction(): void {
        log("Focus Attachment Action: Hotkey 'Cmd+F' triggered while focused!", "success");
    }

    function handleHoverAction(): void {
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
                    Ultra-flat test harness for key combos, scopes, element attachments & input
                    guarding.
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
                    Scope isolation keeps hotkeys contained. <code>modal</code> and
                    <code>form</code> hotkeys fire strictly when active in the stack.
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
                                Modal scope active. Click "Open Form" to stack the <code>form</code>
                                scope over <code>modal</code>.
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
                    Native Svelte 5 element attachments binding hotkeys directly to DOM element
                    lifecycle triggers.
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
                        <span class="field-info"
                            >Single key shortcuts like <kbd>d</kbd> are ignored while typing in text inputs.</span
                        >
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
                    <span class="mod-pill" class:active={appShortcut.modifiers.cmd}>Cmd / Meta</span
                    >
                    <span class="mod-pill" class:active={appShortcut.modifiers.ctrl}>Ctrl</span>
                    <span class="mod-pill" class:active={appShortcut.modifiers.alt}>Alt</span>
                    <span class="mod-pill" class:active={appShortcut.modifiers.shift}>Shift</span>
                </div>

                <div class="keys-held-group">
                    <span class="keys-label">Currently Pressed Keys:</span>
                    {#if appShortcut.pressedKeys.size > 0}
                        <div class="keys-list">
                            {#each [...appShortcut.pressedKeys] as k (k)}
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
                            <!-- eslint-disable-next-line unocss/order -->
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

    /* Header */
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

    /* Status Bar */
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

    .chip-mono {
        color: var(--text-sub);
        font-family: monospace;
        font-size: 12px;
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

    .column-main,
    .column-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    /* Borderless Flat Cards */
    .flat-card {
        padding: 24px;
        background: var(--bg-surface);
        border: none;
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
        letter-spacing: -0.01em;
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

    /* Buttons */
    .actions-row {
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

    /* Surface Nested Boxes */
    .surface-box {
        margin-top: 14px;
        padding: 18px;
        border: none;
        border-radius: 12px;
    }

    .box-modal {
        background: var(--bg-subtle);
    }

    .box-form {
        margin-top: 12px;
        background: #ffffff;
    }

    .box-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .box-title {
        font-size: 13px;
        font-weight: 600;
    }

    .box-hint {
        color: var(--text-muted);
        font-size: 12px;
    }

    .box-desc {
        margin: 0;
        color: var(--text-sub);
        font-size: 13px;
    }

    /* Attachment Grid */
    .attach-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
    }

    .attach-tile {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 14px 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
        transition: background-color 0.15s ease;
    }

    .attach-tile.clickable {
        all: unset;
        display: flex;
        gap: 12px;
        align-items: center;
        box-sizing: border-box;
        padding: 14px 16px;
        background: var(--bg-subtle);
        border-radius: 12px;
        cursor: pointer;
    }

    .attach-tile:hover,
    .attach-tile:focus-within {
        background: var(--accent-tint);
    }

    .tile-icon {
        display: flex;
        align-items: center;
        color: var(--accent);
    }

    .tile-content {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 2px;
    }

    .tile-content strong {
        font-size: 13px;
        font-weight: 600;
    }

    .tile-content span {
        color: var(--text-muted);
        font-size: 11px;
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

    .form-group label,
    .group-label {
        color: var(--text-sub);
        font-size: 12px;
        font-weight: 600;
    }

    .flat-input {
        padding: 10px 14px;
        color: var(--text-main);
        font-size: 13px;
        background: var(--bg-subtle);
        border: none;
        border-radius: 10px;
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
        color: var(--text-muted);
        font-size: 11px;
    }

    .controls-bar {
        display: flex;
        gap: 24px;
        align-items: center;
        padding: 14px 18px;
        background: var(--bg-subtle);
        border-radius: 10px;
    }

    .control-check {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        cursor: pointer;
    }

    .flat-checkbox,
    .flat-radio,
    .flat-range {
        accent-color: var(--accent);
    }

    .control-slider {
        display: flex;
        gap: 8px;
        align-items: center;
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
        gap: 8px;
        align-items: center;
        padding: 8px 14px;
        color: var(--text-sub);
        font-size: 12px;
        background: var(--bg-subtle);
        border-radius: 10px;
    }

    /* KBD Styling */
    kbd {
        padding: 3px 7px;
        color: var(--text-main);
        font-family: monospace;
        font-size: 11px;
        font-weight: 600;
        background: var(--bg-subtle);
        border: none;
        border-radius: 6px;
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
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
    }

    .side-head h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
    }

    .modifiers-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 18px;
    }

    .mod-pill {
        padding: 8px;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        background: var(--bg-subtle);
        border-radius: 8px;
        transition: all 0.15s ease;
    }

    .mod-pill.active {
        color: #ffffff;
        background: var(--accent);
    }

    .keys-held-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .keys-label {
        color: var(--text-muted);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .keys-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .kbd-active {
        color: #ffffff;
        background: var(--accent);
    }

    .keys-none {
        color: var(--text-muted);
        font-size: 12px;
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
</style>
