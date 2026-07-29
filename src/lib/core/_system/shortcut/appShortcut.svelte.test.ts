import { beforeEach, describe, expect, test, vi } from "vitest";

import { AppShortcutManager, shortcutAttach } from "./appShortcut.svelte";

describe("AppShortcutManager (Exhaustive Browser Client Test Suite)", () => {
    let manager: AppShortcutManager;

    beforeEach(() => {
        manager = new AppShortcutManager();
    });

    describe("1. Exact Combo Matching & Modifier Isolation", () => {
        test("should execute registered shortcut on matching key event", () => {
            const spy = vi.fn();
            manager.register("Cmd+K", spy);

            const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
            });

            const handled = manager.handleKeyDown(event);
            expect(handled).toBe(true);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        test("should enforce exact modifier matching for single keys (e.g. 's' vs 'Cmd+S', 'Shift+S', 'Alt+S')", () => {
            let singleKeyExecuted = false;
            let cmdKeyExecuted = false;
            let shiftKeyExecuted = false;

            manager.register("s", () => (singleKeyExecuted = true));
            manager.register("Cmd+s", () => (cmdKeyExecuted = true));
            manager.register("Shift+s", () => (shiftKeyExecuted = true));

            // Pressing Cmd+S -> ONLY Cmd+S should fire
            const eventCmdS = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true });
            manager.handleKeyDown(eventCmdS);
            expect(cmdKeyExecuted).toBe(true);
            expect(singleKeyExecuted).toBe(false);
            expect(shiftKeyExecuted).toBe(false);

            // Reset flags
            singleKeyExecuted = false;
            cmdKeyExecuted = false;

            // Pressing Shift+S -> ONLY Shift+S should fire
            const eventShiftS = new KeyboardEvent("keydown", { key: "s", shiftKey: true, bubbles: true });
            manager.handleKeyDown(eventShiftS);
            expect(shiftKeyExecuted).toBe(true);
            expect(singleKeyExecuted).toBe(false);
            expect(cmdKeyExecuted).toBe(false);

            // Reset flags
            shiftKeyExecuted = false;

            // Pressing 's' without modifiers -> ONLY single key 's' should fire
            const eventPlainS = new KeyboardEvent("keydown", { key: "s", bubbles: true });
            manager.handleKeyDown(eventPlainS);
            expect(singleKeyExecuted).toBe(true);
            expect(cmdKeyExecuted).toBe(false);
            expect(shiftKeyExecuted).toBe(false);
        });

        test("should isolate multi-modifier combinations (e.g. 'Ctrl+Shift+A' vs 'Ctrl+A')", () => {
            let ctrlAExecuted = false;
            let ctrlShiftAExecuted = false;

            manager.register("Ctrl+a", () => (ctrlAExecuted = true));
            manager.register("Ctrl+Shift+a", () => (ctrlShiftAExecuted = true));

            // Pressing Ctrl+Shift+A -> ONLY Ctrl+Shift+A should fire, NOT Ctrl+A
            const eventCtrlShiftA = new KeyboardEvent("keydown", {
                key: "a",
                ctrlKey: true,
                shiftKey: true,
                bubbles: true,
            });
            manager.handleKeyDown(eventCtrlShiftA);
            expect(ctrlShiftAExecuted).toBe(true);
            expect(ctrlAExecuted).toBe(false);

            // Reset flags
            ctrlShiftAExecuted = false;

            // Pressing Ctrl+A -> ONLY Ctrl+A should fire
            const eventCtrlA = new KeyboardEvent("keydown", {
                key: "a",
                ctrlKey: true,
                bubbles: true,
            });
            manager.handleKeyDown(eventCtrlA);
            expect(ctrlAExecuted).toBe(true);
            expect(ctrlShiftAExecuted).toBe(false);
        });

        test("should handle special keys (Escape, Enter, Tab, Space, Backspace, Delete)", () => {
            const escSpy = vi.fn();
            const enterSpy = vi.fn();
            const spaceSpy = vi.fn();
            const tabSpy = vi.fn();
            const backspaceSpy = vi.fn();
            const deleteSpy = vi.fn();

            manager.register("Escape", escSpy);
            manager.register("Enter", enterSpy);
            manager.register("Space", spaceSpy);
            manager.register("Tab", tabSpy);
            manager.register("Backspace", backspaceSpy);
            manager.register("Delete", deleteSpy);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            expect(escSpy).toHaveBeenCalledTimes(1);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
            expect(enterSpy).toHaveBeenCalledTimes(1);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
            expect(spaceSpy).toHaveBeenCalledTimes(1);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
            expect(tabSpy).toHaveBeenCalledTimes(1);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));
            expect(backspaceSpy).toHaveBeenCalledTimes(1);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));
            expect(deleteSpy).toHaveBeenCalledTimes(1);
        });

        test("should handle plus sign shortcuts (Cmd++, Ctrl++, '+') without parsing errors", () => {
            let zoomInExecuted = false;
            let standalonePlusExecuted = false;

            manager.register("Cmd++", () => (zoomInExecuted = true));
            manager.register("+", () => (standalonePlusExecuted = true));

            // Press Cmd + '+'
            const eventZoom = new KeyboardEvent("keydown", { key: "+", metaKey: true, bubbles: true });
            manager.handleKeyDown(eventZoom);
            expect(zoomInExecuted).toBe(true);
            expect(standalonePlusExecuted).toBe(false);

            // Reset
            zoomInExecuted = false;

            // Press '+' without modifiers
            const eventPlus = new KeyboardEvent("keydown", { key: "+", bubbles: true });
            manager.handleKeyDown(eventPlus);
            expect(standalonePlusExecuted).toBe(true);
            expect(zoomInExecuted).toBe(false);
        });

        test("should suppress event.repeat by default (repeat: false) and allow it when repeat: true", () => {
            let singleSubmitCount = 0;
            let scrollNavCount = 0;

            manager.register("Cmd+Enter", () => singleSubmitCount++, { repeat: false });
            manager.register("j", () => scrollNavCount++, { repeat: true });

            // Initial keydown (repeat: false)
            const eventInitialEnter = new KeyboardEvent("keydown", { key: "Enter", metaKey: true, repeat: false, bubbles: true });
            manager.handleKeyDown(eventInitialEnter);
            expect(singleSubmitCount).toBe(1);

            // Repeated keydown (repeat: true from OS holding key down) -> MUST BE SUPPRESSED FOR ACTION BUT STILL PREVENT DEFAULT!
            const eventRepeatEnter = new KeyboardEvent("keydown", { key: "Enter", metaKey: true, repeat: true, cancelable: true, bubbles: true });
            const handledRepeat = manager.handleKeyDown(eventRepeatEnter);
            expect(singleSubmitCount).toBe(1); // Action still 1!
            expect(handledRepeat).toBe(true); // Handled by shortcut!
            expect(eventRepeatEnter.defaultPrevented).toBe(true); // Browser default still blocked!

            // Initial keydown for 'j' (repeat: true)
            const eventInitialJ = new KeyboardEvent("keydown", { key: "j", repeat: false, bubbles: true });
            manager.handleKeyDown(eventInitialJ);
            expect(scrollNavCount).toBe(1);

            // Repeated keydown for 'j' (repeat: true) -> MUST FIRE AGAIN!
            const eventRepeatJ = new KeyboardEvent("keydown", { key: "j", repeat: true, bubbles: true });
            manager.handleKeyDown(eventRepeatJ);
            expect(scrollNavCount).toBe(2);
        });

        test("should support physical key matching via useCode: true (e.g. Cmd+Slash, WASD / KeyW)", () => {
            let toggleCommentExecuted = false;
            let moveUpExecuted = false;

            // Register shortcuts with useCode: true
            manager.register("Cmd+Slash", () => (toggleCommentExecuted = true), { useCode: true });
            manager.register("KeyW", () => (moveUpExecuted = true), { useCode: true });

            // German layout: Shift+7 produces key "/" but event.code is "Slash"
            const eventComment = new KeyboardEvent("keydown", {
                key: "/",
                code: "Slash",
                metaKey: true,
                bubbles: true,
            });
            manager.handleKeyDown(eventComment);
            expect(toggleCommentExecuted).toBe(true);

            // AZERTY French layout: physical KeyW produces key "z" but event.code is "KeyW"
            const eventWASD = new KeyboardEvent("keydown", {
                key: "z",
                code: "KeyW",
                bubbles: true,
            });
            manager.handleKeyDown(eventWASD);
            expect(moveUpExecuted).toBe(true);

            // Special keys (Esc / Enter) in useCode: true mode
            let escExecuted = false;
            let enterExecuted = false;
            manager.register("Cmd+Esc", () => (escExecuted = true), { useCode: true });
            manager.register("Cmd+Enter", () => (enterExecuted = true), { useCode: true });

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", metaKey: true, bubbles: true }));
            expect(escExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", metaKey: true, bubbles: true }));
            expect(enterExecuted).toBe(true);

            // Symbol keys (Minus / Comma / Period) in useCode: true mode
            let zoomOutExecuted = false;
            let prefsExecuted = false;
            let periodExecuted = false;

            manager.register("Cmd+-", () => (zoomOutExecuted = true), { useCode: true });
            manager.register("Cmd+,", () => (prefsExecuted = true), { useCode: true });
            manager.register("Cmd+.", () => (periodExecuted = true), { useCode: true });

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "-", code: "Minus", metaKey: true, bubbles: true }));
            expect(zoomOutExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: ",", code: "Comma", metaKey: true, bubbles: true }));
            expect(prefsExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: ".", code: "Period", metaKey: true, bubbles: true }));
            expect(periodExecuted).toBe(true);
        });
    });

    describe("2. Priority Resolution & LIFO Tie-Breaking", () => {
        test("should prioritize higher priority preset over lower preset", () => {
            let lowExecuted = false;
            let highExecuted = false;

            manager.register("Cmd+S", () => (lowExecuted = true), { priority: "subview" }); // Prio 50
            manager.register("Cmd+S", () => (highExecuted = true), { priority: "overlay" }); // Prio 100

            const event = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true });
            manager.handleKeyDown(event);

            expect(highExecuted).toBe(true);
            expect(lowExecuted).toBe(false);
        });

        test("should break ties using LIFO (last registered wins) when priorities are equal", () => {
            let firstExecuted = false;
            let secondExecuted = false;

            manager.register("Cmd+S", () => (firstExecuted = true), { priority: "root" });
            manager.register("Cmd+S", () => (secondExecuted = true), { priority: "root" });

            const event = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true });
            manager.handleKeyDown(event);

            expect(secondExecuted).toBe(true);
            expect(firstExecuted).toBe(false);
        });

        test("should support custom numeric priorities (e.g. 200 > 100)", () => {
            let overlayExecuted = false;
            let customExecuted = false;

            manager.register("Cmd+S", () => (overlayExecuted = true), { priority: "overlay" }); // Prio 100
            manager.register("Cmd+S", () => (customExecuted = true), { priority: 200 }); // Prio 200

            const event = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true });
            manager.handleKeyDown(event);

            expect(customExecuted).toBe(true);
            expect(overlayExecuted).toBe(false);
        });
    });

    describe("3. Scope Filtering & Deep Prefix Matching", () => {
        test("should filter shortcuts by active scope and ignore inactive scopes", () => {
            let homeExecuted = false;
            let statsExecuted = false;

            manager.register("Cmd+K", () => (homeExecuted = true), { scope: "home" });
            manager.register("Cmd+K", () => (statsExecuted = true), { scope: "stats" });

            manager.setScope("home");

            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
            manager.handleKeyDown(event);

            expect(homeExecuted).toBe(true);
            expect(statsExecuted).toBe(false);
        });

        test("should support deep hierarchical prefix scope matching (e.g. 'home:editor:form')", () => {
            let homeExecuted = false;
            let editorExecuted = false;
            let formExecuted = false;
            let settingsExecuted = false;

            manager.register("Cmd+1", () => (homeExecuted = true), { scope: "home" });
            manager.register("Cmd+2", () => (editorExecuted = true), { scope: "home:editor" });
            manager.register("Cmd+3", () => (formExecuted = true), { scope: "home:editor:form" });
            manager.register("Cmd+4", () => (settingsExecuted = true), { scope: "settings" });

            // Active scope set to deep child 'home:editor:form'
            manager.setScope("home:editor:form");

            // All ancestor scopes ('home', 'home:editor', 'home:editor:form') match!
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "1", metaKey: true, bubbles: true }));
            expect(homeExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "2", metaKey: true, bubbles: true }));
            expect(editorExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "3", metaKey: true, bubbles: true }));
            expect(formExecuted).toBe(true);

            // Unrelated scope 'settings' does NOT match!
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "4", metaKey: true, bubbles: true }));
            expect(settingsExecuted).toBe(false);
        });

        test("should support scope stacking via pushScope() and popScope() and trigger shortcuts at all stack levels", () => {
            let globalExecuted = false;
            let homeExecuted = false;
            let modalExecuted = false;
            let formExecuted = false;
            let modalFormExecuted = false;
            let settingsExecuted = false;

            manager.register("Cmd+G", () => (globalExecuted = true), { scope: "global" });
            manager.register("Cmd+H", () => (homeExecuted = true), { scope: "home" });
            manager.register("Cmd+M", () => (modalExecuted = true), { scope: "modal" });
            manager.register("Cmd+F", () => (formExecuted = true), { scope: "form" });
            manager.register("Cmd+X", () => (modalFormExecuted = true), { scope: "modal:form" });
            manager.register("Cmd+S", () => (settingsExecuted = true), { scope: "settings" });

            manager.setScope("home");
            expect(manager.activeScope).toBe("home");
            expect(manager.scopeStack).toEqual(["home"]);

            // Push 'modal'
            const popModal = manager.pushScope("modal");
            expect(manager.activeScope).toBe("home:modal");
            expect(manager.scopeStack).toEqual(["home", "modal"]);

            // Push 'form' -> Stack is ["home", "modal", "form"], activeScope is "home:modal:form"
            const popForm = manager.pushScope("form");
            expect(manager.activeScope).toBe("home:modal:form");
            expect(manager.scopeStack).toEqual(["home", "modal", "form"]);

            // Test execution when deep in stack ["home", "modal", "form"]:
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "g", metaKey: true, bubbles: true }));
            expect(globalExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "h", metaKey: true, bubbles: true }));
            expect(homeExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "m", metaKey: true, bubbles: true }));
            expect(modalExecuted).toBe(true);

            // THIS WAS BROKEN BEFORE! Now 'form' registered shortcut fires cleanly!
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "f", metaKey: true, bubbles: true }));
            expect(formExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "x", metaKey: true, bubbles: true }));
            expect(modalFormExecuted).toBe(true);

            // Unrelated scope 'settings' must NOT fire
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true }));
            expect(settingsExecuted).toBe(false);

            // Pop 'form' via cleanup function
            popForm();
            expect(manager.activeScope).toBe("home:modal");
            expect(manager.scopeStack).toEqual(["home", "modal"]);

            // Reset flags and verify 'form' scope is no longer active
            formExecuted = false;
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "f", metaKey: true, bubbles: true }));
            expect(formExecuted).toBe(false);

            // Pop 'modal' via cleanup function
            popModal();
            expect(manager.activeScope).toBe("home");
            expect(manager.scopeStack).toEqual(["home"]);
        });
    });

    describe("4. Key Sequence & Leader Key Support", () => {
        test("should handle multi-step key sequences and report pendingSequence", () => {
            let sequenceExecuted = false;
            manager.register("g i", () => (sequenceExecuted = true));

            expect(manager.pendingSequence).toBe(null);

            // Step 1: Press 'g'
            const eventG = new KeyboardEvent("keydown", { key: "g", bubbles: true });
            const handledG = manager.handleKeyDown(eventG);

            expect(handledG).toBe(true);
            expect(sequenceExecuted).toBe(false);
            expect(manager.pendingSequence).toBe("G...");

            // Step 2: Press 'i'
            const eventI = new KeyboardEvent("keydown", { key: "i", bubbles: true });
            const handledI = manager.handleKeyDown(eventI);

            expect(handledI).toBe(true);
            expect(sequenceExecuted).toBe(true);
            expect(manager.pendingSequence).toBe(null);
        });

        test("should recover when sequence step mismatches and process second key as standalone", () => {
            let sequenceExecuted = false;
            let standaloneXExecuted = false;

            manager.register("g i", () => (sequenceExecuted = true));
            manager.register("x", () => (standaloneXExecuted = true));

            // Press 'g' -> sequence pending
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "g", bubbles: true }));
            expect(manager.pendingSequence).toBe("G...");

            // Press 'x' (mismatch) -> resets sequence and immediately triggers standalone 'x'!
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "x", bubbles: true }));

            expect(sequenceExecuted).toBe(false);
            expect(standaloneXExecuted).toBe(true);
            expect(manager.pendingSequence).toBe(null);
        });

        test("should reset sequence on timeout expiration", async () => {
            let sequenceExecuted = false;
            manager.register("g i", () => (sequenceExecuted = true), { timeout: 20 });

            // Press 'g'
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "g", bubbles: true }));
            expect(manager.pendingSequence).toBe("G...");

            // Wait for sequence timeout
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(manager.pendingSequence).toBe(null);

            // Press 'i' after timeout -> does not trigger sequence
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "i", bubbles: true }));
            expect(sequenceExecuted).toBe(false);
        });
    });

    describe("5. Reactive Modifier State & Held Key Tracking", () => {
        test("should track shift, ctrl, alt, cmd modifier states on key events", () => {
            expect(manager.modifiers.shift).toBe(false);
            expect(manager.modifiers.cmd).toBe(false);

            // Press Shift + Cmd
            manager.handleKeyDown(
                new KeyboardEvent("keydown", { key: "Shift", shiftKey: true, metaKey: true, bubbles: true })
            );

            expect(manager.modifiers.shift).toBe(true);
            expect(manager.modifiers.cmd).toBe(true);

            // Release Shift
            manager.handleKeyUp(
                new KeyboardEvent("keyup", { key: "Shift", shiftKey: false, metaKey: true, bubbles: true })
            );

            expect(manager.modifiers.shift).toBe(false);
            expect(manager.modifiers.cmd).toBe(true);

            // Reset
            manager.resetModifiers();
            expect(manager.modifiers.cmd).toBe(false);
        });

        test("should track arbitrary held keys via isPressed(key)", () => {
            expect(manager.isPressed("g")).toBe(false);

            // Press 'g'
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "g", bubbles: true }));
            expect(manager.isPressed("g")).toBe(true);
            expect(manager.isPressed("G")).toBe(true);

            // Release 'g'
            manager.handleKeyUp(new KeyboardEvent("keyup", { key: "g", bubbles: true }));
            expect(manager.isPressed("g")).toBe(false);
        });
    });

    describe("6. Hold to Act & KeyUp Triggers", () => {
        test("should execute action after key is held for specified duration", async () => {
            let holdExecuted = false;
            manager.register("Space", () => (holdExecuted = true), { hold: 30 });

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
            expect(holdExecuted).toBe(false);

            // Wait for hold duration
            await new Promise((resolve) => setTimeout(resolve, 60));
            expect(holdExecuted).toBe(true);
        });

        test("should cancel hold action if key is released before duration", async () => {
            let holdExecuted = false;
            let releaseExecuted = false;

            manager.register("m", () => (holdExecuted = true), { hold: 50 });
            manager.register("m", () => (releaseExecuted = true), { triggerOn: "release" });

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "m", bubbles: true }));

            // Release key before 50ms hold threshold
            await new Promise((resolve) => setTimeout(resolve, 10));
            manager.handleKeyUp(new KeyboardEvent("keyup", { key: "m", bubbles: true }));

            expect(releaseExecuted).toBe(true);

            // Wait to ensure hold timer was cancelled
            await new Promise((resolve) => setTimeout(resolve, 60));
            expect(holdExecuted).toBe(false);
        });

        test("should execute release trigger even if modifier key (Cmd/Ctrl) is released milliseconds before main key", () => {
            let releaseExecuted = false;

            manager.register("Cmd+s", () => (releaseExecuted = true), { triggerOn: "release" });

            // Step 1: User presses Cmd+S -> primes release shortcut
            const keyDown = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true });
            manager.handleKeyDown(keyDown);
            expect(releaseExecuted).toBe(false);

            // Step 2: User releases Cmd key first (metaKey becomes false)
            const keyUpCmd = new KeyboardEvent("keyup", { key: "Meta", metaKey: false, bubbles: true });
            manager.handleKeyUp(keyUpCmd);
            expect(releaseExecuted).toBe(false);

            // Step 3: User releases 's' key 1ms later (metaKey is false!) -> MUST STILL FIRE!
            const keyUpS = new KeyboardEvent("keyup", { key: "s", metaKey: false, bubbles: true });
            manager.handleKeyUp(keyUpS);
            expect(releaseExecuted).toBe(true);
        });
    });

    describe("7. Vim-Style Modal Keybind Modes", () => {
        test("should filter shortcuts based on activeMode and support mode arrays", () => {
            let normalExecuted = false;
            let visualExecuted = false;
            let multiModeExecuted = false;

            manager.register("j", () => (normalExecuted = true), { mode: "normal" });
            manager.register("j", () => (visualExecuted = true), { mode: "visual" });
            manager.register("y", () => (multiModeExecuted = true), { mode: ["normal", "visual"] });

            // Set mode to 'normal'
            manager.setMode("normal");

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "j", bubbles: true }));
            expect(normalExecuted).toBe(true);
            expect(visualExecuted).toBe(false);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "y", bubbles: true }));
            expect(multiModeExecuted).toBe(true);

            // Switch mode to 'visual'
            normalExecuted = false;
            multiModeExecuted = false;
            manager.setMode("visual");

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "j", bubbles: true }));
            expect(visualExecuted).toBe(true);
            expect(normalExecuted).toBe(false);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "y", bubbles: true }));
            expect(multiModeExecuted).toBe(true);
        });
    });

    describe("8. Input Guarding (Input / Textarea / ContentEditable)", () => {
        test("should block shortcuts inside input, textarea, and contenteditable elements unless allowInInput is true", () => {
            let blockedExecuted = false;
            let allowedExecuted = false;

            manager.register("Cmd+K", () => (blockedExecuted = true), { allowInInput: false });
            manager.register("Cmd+Enter", () => (allowedExecuted = true), { allowInInput: true });

            // Test 1: HTMLInputElement
            const input = document.createElement("input");
            document.body.append(input);
            input.focus();

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
            expect(blockedExecuted).toBe(false);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));
            expect(allowedExecuted).toBe(true);

            input.remove();

            // Reset flags
            blockedExecuted = false;
            allowedExecuted = false;

            // Test 2: HTMLDivElement (contenteditable="true")
            const editableDiv = document.createElement("div");
            editableDiv.contentEditable = "true";
            document.body.append(editableDiv);
            editableDiv.focus();

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
            expect(blockedExecuted).toBe(false);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));
            expect(allowedExecuted).toBe(true);

            editableDiv.remove();

            // Reset flags
            blockedExecuted = false;
            allowedExecuted = false;

            // Test 3: ARIA role="textbox" (Monaco Editor / Slate / TipTap)
            const ariaEditor = document.createElement("div");
            ariaEditor.setAttribute("role", "textbox");
            ariaEditor.tabIndex = 0;
            document.body.append(ariaEditor);
            ariaEditor.focus();

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
            expect(blockedExecuted).toBe(false);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));
            expect(allowedExecuted).toBe(true);

            ariaEditor.remove();

            // Test 4: Non-text inputs (type="checkbox", type="radio", type="range")
            let singleKeyExecuted = false;
            manager.register("d", () => (singleKeyExecuted = true), { allowInInput: false });

            // Test 4: Non-text inputs (type="checkbox", type="radio", type="range")
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            document.body.append(checkbox);
            checkbox.focus();

            // Shortcut MUST NOT be blocked on checkbox!
            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "d", bubbles: true }));
            expect(singleKeyExecuted).toBe(true);

            checkbox.remove();
        });
    });

    describe("9. Advanced Svelte 5 Attachments (shortcutAttach)", () => {
        test("should support array of shortcut descriptors in single attachment", () => {
            let firstExecuted = false;
            let secondExecuted = false;

            const attachFn = shortcutAttach(
                [
                    { combo: "Cmd+S", action: () => (firstExecuted = true) },
                    { combo: "Escape", action: () => (secondExecuted = true) },
                ],
                {},
                manager
            );

            const element = document.createElement("div");
            const cleanup = attachFn(element);

            expect(manager.size).toBe(2);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true }));
            expect(firstExecuted).toBe(true);

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            expect(secondExecuted).toBe(true);

            cleanup();
            expect(manager.size).toBe(0);
        });

        test("should respect attachOn: 'focus' trigger on focus and blur", () => {
            let actionExecuted = false;
            const attachFn = shortcutAttach("Cmd+Enter", () => (actionExecuted = true), { attachOn: "focus" }, manager);

            const input = document.createElement("input");
            document.body.append(input);

            const cleanup = attachFn(input);
            expect(manager.size).toBe(0); // Not registered before focus

            // Focus input
            input.dispatchEvent(new Event("focus"));
            expect(manager.size).toBe(1); // Registered on focus

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));
            expect(actionExecuted).toBe(true);

            // Blur input
            input.dispatchEvent(new Event("blur"));
            expect(manager.size).toBe(0); // Unregistered on blur

            cleanup();
            input.remove();
        });

        test("should respect attachOn: 'hover' trigger on pointerenter and pointerleave", () => {
            let actionExecuted = false;
            const attachFn = shortcutAttach("d", () => (actionExecuted = true), { attachOn: "hover" }, manager);

            const card = document.createElement("div");
            document.body.append(card);

            const cleanup = attachFn(card);
            expect(manager.size).toBe(0); // Not registered before hover

            // Hover enter
            card.dispatchEvent(new Event("pointerenter"));
            expect(manager.size).toBe(1); // Registered on hover

            manager.handleKeyDown(new KeyboardEvent("keydown", { key: "d", bubbles: true }));
            expect(actionExecuted).toBe(true);

            // Hover leave
            card.dispatchEvent(new Event("pointerleave"));
            expect(manager.size).toBe(0); // Unregistered on leave

            cleanup();
            card.remove();
        });
    });
});
