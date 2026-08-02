import { untrack } from "svelte";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

import { onViewScopeChange } from "$core/_system/layout/app-views/viewState.svelte";
import { getOS, uuid } from "$utils/_system";

import {
    SHORTCUT_PRIORITY_MAP,
    type AppShortcutConfig,
    type ModifierState,
    type ParsedComboStep,
    type ShortcutAttachTrigger,
    type ShortcutDescriptor,
    type ShortcutEntry,
    type ShortcutPriority,
    type ShortcutRegisterOptions,
    type ShortcutTriggerMode,
} from "./types";

export class AppShortcutManager {
    entries = $state<ShortcutEntry[]>([]);
    scopeStack = $state<string[]>(["global"]);
    activeScope = $state<string>("global");
    activeMode = $state<string | null>(null);
    pendingSequence = $state<string | null>(null);
    pressedKeys = new SvelteSet<string>();
    modifiers = $state<ModifierState>({
        shift: false,
        ctrl: false,
        alt: false,
        cmd: false,
    });
    config = $state<AppShortcutConfig>({
        enabled: true,
        allowInInput: false,
        allowedPriorities: undefined,
        activeMode: null,
        sequenceTimeout: 1000,
    });

    private sequenceBuffer: string[] = [];
    private sequenceTimerId: ReturnType<typeof setTimeout> | null = null;
    private holdTimers = new SvelteMap<string, ReturnType<typeof setTimeout>>();
    private keyPressTimes = new SvelteMap<string, number>();
    private listenerBound = false;

    constructor() {
        if (typeof window !== "undefined") {
            this.bindGlobalEvents();
        }
    }

    private onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    private onKeyUp = (e: KeyboardEvent) => this.handleKeyUp(e);
    private onBlur = () => this.resetModifiers();
    private onFocus = () => this.resetModifiers();
    private onVisibilityChange = () => {
        if (typeof document !== "undefined" && document.hidden) {
            this.resetModifiers();
        }
    };

    configure(newConfig: Partial<AppShortcutConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig,
        };
        if (newConfig.activeMode !== undefined) {
            this.activeMode = newConfig.activeMode;
        }
        if (newConfig.enabled === false) {
            this.resetSequence();
            for (const timer of this.holdTimers.values()) {
                clearTimeout(timer);
            }
            this.holdTimers.clear();
            this.keyPressTimes.clear();
        }
    }

    get size(): number {
        return this.entries.length;
    }

    private updateActiveScope(): void {
        const nonGlobal = this.scopeStack.filter((s) => s !== "global" && s.trim() !== "");
        this.activeScope = nonGlobal.length > 0 ? nonGlobal.join(":") : "global";
    }

    setScope(scope: string): void {
        const parts = scope
            .split(":")
            .map((s) => s.trim())
            .filter(Boolean);
        this.scopeStack = parts.length > 0 ? parts : ["global"];
        this.updateActiveScope();
    }

    pushScope(scope: string): () => void {
        const parts = scope
            .split(":")
            .map((s) => s.trim())
            .filter(Boolean);
        for (const part of parts) {
            this.scopeStack.push(part);
        }
        this.updateActiveScope();

        let popped = false;
        return () => {
            if (popped) return;
            popped = true;
            for (const part of parts) {
                this.popScope(part);
            }
        };
    }

    popScope(targetScope?: string): boolean {
        if (targetScope) {
            const index = this.scopeStack.lastIndexOf(targetScope);
            if (index !== -1) {
                this.scopeStack.splice(index, 1);
                if (this.scopeStack.length === 0) {
                    this.scopeStack = ["global"];
                }
                this.updateActiveScope();
                return true;
            }
            return false;
        }

        if (this.scopeStack.length > 1) {
            this.scopeStack.pop();
            this.updateActiveScope();
            return true;
        }

        return false;
    }

    setMode(mode: string | null): void {
        this.activeMode = mode;
        this.config.activeMode = mode;
    }

    resetSequence(): void {
        if (this.sequenceTimerId !== null) {
            clearTimeout(this.sequenceTimerId);
            this.sequenceTimerId = null;
        }
        this.sequenceBuffer = [];
        this.pendingSequence = null;
    }

    updateModifiers(event: KeyboardEvent): void {
        if (event.key) {
            const keyUpper = event.key.toUpperCase();
            if (event.type === "keydown") {
                this.pressedKeys.add(keyUpper);
            } else if (event.type === "keyup") {
                this.pressedKeys.delete(keyUpper);
            }
        }

        this.modifiers.shift = event.shiftKey || this.pressedKeys.has("SHIFT");
        this.modifiers.ctrl = event.ctrlKey || this.pressedKeys.has("CONTROL");
        this.modifiers.alt = event.altKey || this.pressedKeys.has("ALT");
        this.modifiers.cmd =
            event.metaKey ||
            this.pressedKeys.has("META") ||
            this.pressedKeys.has("OS") ||
            this.pressedKeys.has("COMMAND");
    }

    resetModifiers(): void {
        this.modifiers.shift = false;
        this.modifiers.ctrl = false;
        this.modifiers.alt = false;
        this.modifiers.cmd = false;
        this.pressedKeys.clear();
    }

    isPressed(key: string): boolean {
        const normalized = key.trim().toUpperCase();
        if (normalized === "SHIFT") return this.modifiers.shift;
        if (["CTRL", "CONTROL"].includes(normalized)) return this.modifiers.ctrl;
        if (["ALT", "OPTION"].includes(normalized)) return this.modifiers.alt;
        if (["CMD", "META", "COMMAND"].includes(normalized)) return this.modifiers.cmd;
        return this.pressedKeys.has(normalized);
    }

    private resolvePriority(priority?: ShortcutPriority): number {
        if (typeof priority === "number") return priority;
        if (typeof priority === "string" && priority in SHORTCUT_PRIORITY_MAP) {
            return SHORTCUT_PRIORITY_MAP[priority];
        }
        return SHORTCUT_PRIORITY_MAP.overlay;
    }

    private isPriorityAllowed(priority: number): boolean {
        if (!this.config.allowedPriorities || this.config.allowedPriorities.length === 0) {
            return true;
        }

        const allowedNumbers = this.config.allowedPriorities.map((p) =>
            typeof p === "number" ? p : SHORTCUT_PRIORITY_MAP[p]
        );

        return allowedNumbers.includes(priority);
    }

    register(
        combo: string,
        action: (event: KeyboardEvent) => void,
        options?: ShortcutRegisterOptions
    ): () => void {
        const id = options?.id ?? uuid();
        const priority = this.resolvePriority(options?.priority);
        const scope =
            options?.scope && options.scope.trim() !== "" ? options.scope.trim() : "global";
        const mode = options?.mode
            ? Array.isArray(options.mode)
                ? options.mode
                : [options.mode]
            : null;
        const allowInInput = options?.allowInInput ?? false;
        const preventDefault = options?.preventDefault ?? true;
        const timeoutMs = options?.timeout ?? this.config.sequenceTimeout ?? 1000;
        const triggerOn: ShortcutTriggerMode =
            options?.triggerOn ?? (options?.hold !== undefined ? "hold" : "press");
        const holdMs = options?.hold ?? (triggerOn === "hold" ? 500 : undefined);
        const attachOn: ShortcutAttachTrigger = options?.attachOn ?? "mount";
        const repeat = options?.repeat ?? false;
        const useCode = options?.useCode ?? false;

        const rawSteps = combo.trim().split(/\s+/).filter(Boolean);
        if (rawSteps.length === 0) {
            return () => {};
        }
        const sequenceSteps = rawSteps.map((step) => normalizeComboStep(step));
        const parsedSequenceSteps = sequenceSteps.map((step) => parseComboStep(step));
        const normalizedCombo = sequenceSteps.join(" ");

        const entry: ShortcutEntry = {
            id,
            combo: normalizedCombo,
            sequenceSteps,
            parsedSequenceSteps,
            action,
            priority,
            scope,
            mode,
            allowInInput,
            preventDefault,
            timeout: timeoutMs,
            hold: holdMs,
            triggerOn,
            attachOn,
            repeat,
            useCode,
            createdAt: Date.now(),
        };

        untrack(() => {
            this.entries.push(entry);
        });

        return () => {
            this.unregister(id);
        };
    }

    unregister(idOrAction: string | ((event: KeyboardEvent) => void)): boolean {
        return untrack(() => {
            const index = this.entries.findIndex(
                (entry) =>
                    Boolean(entry) &&
                    (typeof idOrAction === "string" ? entry.id : entry.action) === idOrAction
            );

            if (index !== -1) {
                const entry = this.entries[index];
                if (entry) {
                    this.clearHoldTimer(entry.id);
                    this.keyPressTimes.delete(entry.id);
                }
                this.entries.splice(index, 1);
                return true;
            }

            return false;
        });
    }

    clear(scope?: string): void {
        untrack(() => {
            if (!scope) {
                for (const id of this.holdTimers.keys()) {
                    this.clearHoldTimer(id);
                }
                this.keyPressTimes.clear();
                this.entries = [];
                this.resetSequence();
            } else {
                const removed = this.entries.filter((entry) => entry.scope === scope);
                for (const entry of removed) {
                    this.clearHoldTimer(entry.id);
                    this.keyPressTimes.delete(entry.id);
                }
                this.entries = this.entries.filter((entry) => entry.scope !== scope);

                // Only reset the pending sequence if it belonged to a removed entry
                if (this.pendingSequence !== null) {
                    const hasActiveSequenceInRemoved = removed.some((entry) => {
                        // Check if the pending sequence buffer matches any removed entry's steps
                        const bufferLen = this.sequenceBuffer.length;
                        if (bufferLen === 0) return false;
                        return (
                            entry.sequenceSteps.length > bufferLen &&
                            entry.sequenceSteps
                                .slice(0, bufferLen)
                                .every((s, i) => s === this.sequenceBuffer[i])
                        );
                    });
                    if (hasActiveSequenceInRemoved) {
                        this.resetSequence();
                    }
                }
            }
        });
    }

    private isScopeActive(entryScope: string): boolean {
        if (entryScope === "global") return true;
        if (this.scopeStack.includes(entryScope)) return true;
        if (this.activeScope === entryScope) return true;
        if (this.activeScope.startsWith(`${entryScope}:`)) return true;
        if (this.activeScope.endsWith(`:${entryScope}`)) return true;
        if (this.activeScope.includes(`:${entryScope}:`)) return true;
        return false;
    }

    handleKeyDown(event: KeyboardEvent): boolean {
        this.updateModifiers(event);

        if (this.config.enabled === false) return false;

        const inInput = isFocusedInInput();
        const currentStepIndex = this.sequenceBuffer.length;

        // Candidate entries that match current scope, mode, input guard, priority, and sequence length
        const eligibleEntries = this.entries.filter((entry) => {
            if (!this.isPriorityAllowed(entry.priority)) return false;
            if (!this.isScopeActive(entry.scope)) return false;
            if (
                this.activeMode !== null &&
                entry.mode !== null &&
                !entry.mode.includes(this.activeMode)
            ) {
                return false;
            }
            if (inInput && !entry.allowInInput && !this.config.allowInInput) {
                return false;
            }
            return entry.sequenceSteps.length > currentStepIndex;
        });

        // Test if event matches current step of sequence OR step 0 of new sequence
        const matchingEntries = eligibleEntries.filter((entry) => {
            for (let i = 0; i < currentStepIndex; i++) {
                if (entry.sequenceSteps[i] !== this.sequenceBuffer[i]) return false;
            }
            return matchEventToComboStep(
                event,
                entry.parsedSequenceSteps[currentStepIndex],
                entry.useCode
            );
        });

        if (matchingEntries.length === 0 && currentStepIndex > 0) {
            this.resetSequence();
            return this.handleKeyDown(event);
        }

        if (matchingEntries.length === 0) {
            this.resetSequence();
            return false;
        }

        // Pick highest priority candidate (LIFO tie-breaker)
        let candidate = matchingEntries[0];
        for (let i = 1; i < matchingEntries.length; i++) {
            const current = matchingEntries[i];
            if (
                current.priority > candidate.priority ||
                (current.priority === candidate.priority &&
                    current.createdAt >= candidate.createdAt)
            ) {
                candidate = current;
            }
        }

        if (candidate.preventDefault) {
            event.preventDefault();
        }

        if (event.repeat && !candidate.repeat) {
            return true;
        }

        const nextStepIndex = currentStepIndex + 1;

        if (nextStepIndex < candidate.sequenceSteps.length) {
            // Sequence incomplete -> buffer step and start sequence timer
            this.sequenceBuffer.push(candidate.sequenceSteps[currentStepIndex]);
            this.pendingSequence = `${this.sequenceBuffer.join(" ")}...`;

            if (this.sequenceTimerId !== null) {
                clearTimeout(this.sequenceTimerId);
            }

            this.sequenceTimerId = setTimeout(() => {
                this.resetSequence();
            }, candidate.timeout);

            return true;
        }

        // Sequence complete -> check triggerOn & hold
        this.resetSequence();

        if (candidate.triggerOn === "hold" && candidate.hold !== undefined) {
            if (!this.holdTimers.has(candidate.id)) {
                this.keyPressTimes.set(candidate.id, Date.now());
                const timer = setTimeout(() => {
                    this.clearHoldTimer(candidate.id);
                    if (this.config.enabled === false) return;
                    candidate.action(event);
                }, candidate.hold);
                this.holdTimers.set(candidate.id, timer);
            }
            return true;
        }

        if (candidate.triggerOn === "release") {
            this.keyPressTimes.set(candidate.id, Date.now());
            return true;
        }

        // Default 'press' trigger -> execute immediately
        candidate.action(event);
        return true;
    }

    handleKeyUp(event: KeyboardEvent): boolean {
        this.updateModifiers(event);

        if (this.config.enabled === false) return false;

        const inInput = isFocusedInInput();

        const matchingEntries = this.entries.filter((entry) => {
            if (!this.isPriorityAllowed(entry.priority)) return false;
            if (!this.isScopeActive(entry.scope)) return false;
            if (
                this.activeMode !== null &&
                entry.mode !== null &&
                !entry.mode.includes(this.activeMode)
            ) {
                return false;
            }
            if (inInput && !entry.allowInInput && !this.config.allowInInput) {
                return false;
            }

            const lastParsedStep = entry.parsedSequenceSteps.at(-1)!;

            // Race-condition protection for keyup: If shortcut was primed during keydown
            // (stored in keyPressTimes or holdTimers), match by main key release without
            // requiring modifier keys to still be held at the exact millisecond of release!
            if (this.keyPressTimes.has(entry.id) || this.holdTimers.has(entry.id)) {
                return matchEventKeyToStepMainKey(event, lastParsedStep, entry.useCode);
            }

            return matchEventToComboStep(event, lastParsedStep, entry.useCode);
        });

        let handled = false;

        for (const entry of matchingEntries) {
            const pressTime = this.keyPressTimes.get(entry.id);

            // Cancel any pending hold timer if key is released early
            if (this.holdTimers.has(entry.id)) {
                this.clearHoldTimer(entry.id);
            }

            if (entry.triggerOn === "release" && pressTime !== undefined) {
                this.keyPressTimes.delete(entry.id);

                if (entry.preventDefault) {
                    event.preventDefault();
                }

                entry.action(event);
                handled = true;
            } else if (pressTime !== undefined) {
                this.keyPressTimes.delete(entry.id);
            }
        }

        return handled;
    }

    private clearHoldTimer(id: string): void {
        const timer = this.holdTimers.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            this.holdTimers.delete(id);
        }
    }

    private bindGlobalEvents(): void {
        if (this.listenerBound || typeof window === "undefined") return;

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        window.addEventListener("blur", this.onBlur);
        window.addEventListener("focus", this.onFocus);
        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", this.onVisibilityChange);
        }

        this.listenerBound = true;
    }

    destroy(): void {
        this.clear();
        if (typeof window !== "undefined" && this.listenerBound) {
            window.removeEventListener("keydown", this.onKeyDown);
            window.removeEventListener("keyup", this.onKeyUp);
            window.removeEventListener("blur", this.onBlur);
            window.removeEventListener("focus", this.onFocus);
            if (typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", this.onVisibilityChange);
            }
            this.listenerBound = false;
        }
    }
}

export const appShortcut = new AppShortcutManager();

// eslint-disable-next-line unicorn/no-top-level-side-effects
onViewScopeChange((rootScope) => {
    appShortcut.setScope(rootScope);
});

/**
 * Svelte 5 Attachment helper to register single or multiple shortcuts on element mount,
 * focus/blur, or hover/leave, and automatically unregister on cleanup.
 */
export function shortcutAttach(
    node: Element,
    actionOrOptions?: ShortcutDescriptor | ShortcutDescriptor[],
    sharedOpts?: ShortcutRegisterOptions,
    mgr?: AppShortcutManager
): { destroy: () => void };
export function shortcutAttach(
    comboOrDescriptors: string | ShortcutDescriptor[],
    actionOrOptions?: ((event: KeyboardEvent) => void) | ShortcutRegisterOptions,
    optionsOrManager?: ShortcutRegisterOptions | AppShortcutManager,
    targetShortcutArg?: AppShortcutManager
): (node: Element) => () => void;
export function shortcutAttach(
    nodeOrCombo: Element | string | ShortcutDescriptor[],
    actionOrOptions?:
        | ((event: KeyboardEvent) => void)
        | ShortcutRegisterOptions
        | ShortcutDescriptor
        | ShortcutDescriptor[],
    optionsOrManager?: ShortcutRegisterOptions | AppShortcutManager,
    targetShortcutArg?: AppShortcutManager
): ((node: Element) => () => void) | { destroy: () => void } {
    if (
        typeof nodeOrCombo !== "string" &&
        !Array.isArray(nodeOrCombo) &&
        typeof (nodeOrCombo as unknown as Node)?.nodeType === "number"
    ) {
        const node = nodeOrCombo as Element;
        const params = actionOrOptions as ShortcutDescriptor | ShortcutDescriptor[];
        return attachElementInternal(node, params);
    }

    const descriptorsOrCombo = nodeOrCombo as string | ShortcutDescriptor[];
    const actionOrOpt = actionOrOptions as unknown;

    return (node: Element) => {
        let descriptors: ShortcutDescriptor[];
        let sharedOptions: ShortcutRegisterOptions | undefined;
        let manager = appShortcut;

        if (typeof descriptorsOrCombo === "string") {
            const combo = descriptorsOrCombo;
            const action = actionOrOpt as (event: KeyboardEvent) => void;
            sharedOptions = optionsOrManager as ShortcutRegisterOptions | undefined;
            if (targetShortcutArg) manager = targetShortcutArg;
            else if (optionsOrManager instanceof AppShortcutManager) manager = optionsOrManager;

            descriptors = [{ combo, action, options: sharedOptions }];
        } else {
            descriptors = descriptorsOrCombo;
            if (actionOrOpt instanceof AppShortcutManager) {
                manager = actionOrOpt;
                sharedOptions = undefined;
            } else {
                sharedOptions = actionOrOpt as ShortcutRegisterOptions | undefined;
            }
            if (optionsOrManager instanceof AppShortcutManager) manager = optionsOrManager;
            else if (targetShortcutArg) manager = targetShortcutArg;
        }

        const res = attachElementInternal(node, descriptors, sharedOptions, manager);
        return () => {
            if (res && typeof res.destroy === "function") {
                res.destroy();
            }
        };
    };
}

function attachElementInternal(
    node: Element,
    descriptorsOrParams: unknown,
    sharedOpts?: ShortcutRegisterOptions,
    mgr: AppShortcutManager = appShortcut
) {
    let descriptors: ShortcutDescriptor[] = [];
    let options = sharedOpts;
    const manager = mgr;

    if (Array.isArray(descriptorsOrParams)) {
        descriptors = descriptorsOrParams as ShortcutDescriptor[];
    } else if (
        typeof descriptorsOrParams === "object" &&
        descriptorsOrParams !== null &&
        "combo" in descriptorsOrParams
    ) {
        const descObj = descriptorsOrParams as ShortcutDescriptor;
        descriptors = [descObj];
        options = descObj.options ?? sharedOpts;
    }

    const attachOn: ShortcutAttachTrigger =
        options?.attachOn ?? descriptors[0]?.options?.attachOn ?? "mount";

    let unregisters: (() => void)[] = [];

    const registerAll = () => {
        if (unregisters.length > 0) return;
        for (const desc of descriptors) {
            const combinedOptions = { ...options, ...desc.options };
            const unreg = manager.register(desc.combo, desc.action, combinedOptions);
            unregisters.push(unreg);
        }
    };

    const unregisterAll = () => {
        for (const unreg of unregisters) {
            unreg();
        }
        unregisters = [];
    };

    if (attachOn === "mount") {
        registerAll();
        return {
            destroy() {
                unregisterAll();
            },
        };
    }

    if (attachOn === "focus") {
        const onFocus = () => registerAll();
        const onBlur = () => unregisterAll();

        node.addEventListener("focus", onFocus, { capture: true });
        node.addEventListener("blur", onBlur, { capture: true });

        if (
            typeof document !== "undefined" &&
            (document.activeElement === node || node.contains(document.activeElement))
        ) {
            registerAll();
        }

        return {
            destroy() {
                node.removeEventListener("focus", onFocus, { capture: true });
                node.removeEventListener("blur", onBlur, { capture: true });
                unregisterAll();
            },
        };
    }

    if (attachOn === "hover") {
        const onEnter = () => registerAll();
        const onLeave = () => unregisterAll();

        node.addEventListener("pointerenter", onEnter);
        node.addEventListener("pointerleave", onLeave);

        return {
            destroy() {
                node.removeEventListener("pointerenter", onEnter);
                node.removeEventListener("pointerleave", onLeave);
                unregisterAll();
            },
        };
    }

    registerAll();
    return {
        destroy() {
            unregisterAll();
        },
    };
}

// --- Key Combo Parsing Helpers ---

export function getDeepActiveElement(): Element | null {
    if (typeof document === "undefined") return null;
    let active = document.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
    }
    return active;
}

const NON_TEXT_INPUT_TYPES = new Set([
    "checkbox",
    "radio",
    "range",
    "button",
    "submit",
    "reset",
    "image",
    "file",
]);

function isFocusedInInput(): boolean {
    const active = getDeepActiveElement();
    if (!active) return false;

    const tagName = active.tagName.toLowerCase();
    if (tagName === "input") {
        const type = (active as HTMLInputElement).type?.toLowerCase() || "text";
        return !NON_TEXT_INPUT_TYPES.has(type);
    }

    if (tagName === "textarea" || tagName === "select") {
        return true;
    }

    if ((active as HTMLElement).isContentEditable) {
        return true;
    }

    const role = active.getAttribute("role")?.toLowerCase();
    if (role && ["textbox", "combobox", "searchbox"].includes(role)) {
        return true;
    }

    if (active.closest && active.closest('[contenteditable="true"], [role="textbox"]')) {
        return true;
    }

    return false;
}

export function normalizeCombo(combo: string): string {
    const rawSteps = combo.trim().split(/\s+/).filter(Boolean);
    return rawSteps.map((step) => normalizeComboStep(step)).join(" ");
}

export function parseComboStep(normalizedStep: string): ParsedComboStep {
    let mainKey: string;
    let modifiers: string[];

    if (normalizedStep.endsWith("++")) {
        mainKey = "+";
        const prefix = normalizedStep.slice(0, -2);
        modifiers = prefix.split("+").filter(Boolean);
    } else if (normalizedStep === "+") {
        mainKey = "+";
        modifiers = [];
    } else {
        const parts = normalizedStep.split("+");
        mainKey = parts.at(-1)!;
        modifiers = parts.slice(0, -1);
    }

    return {
        mainKey,
        wantCmd: modifiers.includes("Cmd"),
        wantCtrl: modifiers.includes("Ctrl"),
        wantAlt: modifiers.includes("Alt"),
        wantShift: modifiers.includes("Shift"),
    };
}

export function normalizeComboStep(step: string): string {
    let trimmed = step.trim();
    let mainKeyIsPlus = false;

    if (trimmed === "+") {
        mainKeyIsPlus = true;
        trimmed = "";
    } else if (trimmed.endsWith("++")) {
        mainKeyIsPlus = true;
        trimmed = trimmed.slice(0, -2);
    } else if (trimmed.endsWith("+") && !trimmed.endsWith("++")) {
        const lastPlusIdx = trimmed.lastIndexOf("+");
        if (lastPlusIdx === trimmed.length - 1 && lastPlusIdx > 0) {
            const prefix = trimmed.slice(0, lastPlusIdx);
            const parts = prefix
                .split("+")
                .map((p) => p.trim().toLowerCase())
                .filter(Boolean);
            const validMods = new SvelteSet([
                "cmd",
                "meta",
                "command",
                "super",
                "ctrl",
                "control",
                "alt",
                "option",
                "shift",
            ]);
            if (parts.length > 0 && parts.every((p) => validMods.has(p))) {
                mainKeyIsPlus = true;
                trimmed = prefix;
            }
        }
    }

    const parts = trimmed
        .split("+")
        .map((p) => p.trim())
        .filter(Boolean);

    let hasCmd = false;
    let hasCtrl = false;
    let hasAlt = false;
    let hasShift = false;
    let parsedMainKey = "";

    const CMD_MODS = new SvelteSet(["cmd", "meta", "command", "super"]);
    const CTRL_MODS = new SvelteSet(["ctrl", "control"]);
    const ALT_MODS = new SvelteSet(["alt", "option"]);

    for (const part of parts) {
        const lower = part.toLowerCase();
        if (CMD_MODS.has(lower)) {
            hasCmd = true;
        } else if (CTRL_MODS.has(lower)) {
            hasCtrl = true;
        } else if (ALT_MODS.has(lower)) {
            hasAlt = true;
        } else if (lower === "shift") {
            hasShift = true;
        } else {
            parsedMainKey = part.toUpperCase();
        }
    }

    const mainKey = mainKeyIsPlus ? "+" : parsedMainKey;

    const normalizedParts: string[] = [];
    if (hasCmd) normalizedParts.push("Cmd");
    if (hasCtrl) normalizedParts.push("Ctrl");
    if (hasAlt) normalizedParts.push("Alt");
    if (hasShift) normalizedParts.push("Shift");
    if (mainKey) normalizedParts.push(mainKey);

    return normalizedParts.join("+");
}

let cachedIsMac: boolean | null = null;
function isMacPlatform(): boolean {
    if (cachedIsMac === null) {
        if (typeof window !== "undefined") {
            const os = getOS();
            cachedIsMac = os === "macos" || os === "ios";
        } else {
            cachedIsMac = false;
        }
    }
    return cachedIsMac;
}

export function matchEventToComboStep(
    event: KeyboardEvent,
    stepOrNormalizedString: ParsedComboStep | string,
    useCode: boolean = false
): boolean {
    const parsedStep =
        typeof stepOrNormalizedString === "string"
            ? parseComboStep(stepOrNormalizedString)
            : stepOrNormalizedString;

    const isMac = isMacPlatform();

    const { wantCmd, wantCtrl, wantAlt, wantShift } = parsedStep;

    // On Mac, Cmd maps to metaKey and Ctrl maps to ctrlKey.
    // On Windows/Linux, Cmd maps to ctrlKey or metaKey when wantCmd is true.
    const hasCmdMatch =
        isMac || (wantCmd && wantCtrl) || !wantCmd ? event.metaKey : event.ctrlKey || event.metaKey;

    if (wantCmd !== hasCmdMatch) return false;

    const hasCtrlMatch = !isMac && wantCmd && !wantCtrl ? false : event.ctrlKey;
    if (wantCtrl !== hasCtrlMatch) return false;

    if (wantAlt !== event.altKey) return false;
    if (wantShift !== event.shiftKey) return false;

    // Delegate to matchEventKeyToStepMainKey for mainKey matching (single source of truth)
    return matchEventKeyToStepMainKey(event, parsedStep, useCode);
}

export function matchEventToCombo(
    event: KeyboardEvent,
    normalizedCombo: string,
    useCode: boolean = false
): boolean {
    return matchEventToComboStep(event, normalizedCombo, useCode);
}

const PHYSICAL_CODE_MAP: Record<string, string[]> = {
    ESCAPE: ["ESCAPE"],
    ESC: ["ESCAPE"],
    ENTER: ["ENTER", "NUMPADENTER"],
    RETURN: ["ENTER", "NUMPADENTER"],
    SPACE: ["SPACE"],
    TAB: ["TAB"],
    BACKSPACE: ["BACKSPACE"],
    DELETE: ["DELETE"],
    SLASH: ["SLASH", "NUMPADDIVIDE"],
    "+": ["EQUAL", "NUMPADADD"],
    "=": ["EQUAL", "NUMPADADD"],
    "-": ["MINUS", "NUMPADSUBTRACT"],
    MINUS: ["MINUS", "NUMPADSUBTRACT"],
    ",": ["COMMA"],
    COMMA: ["COMMA"],
    ".": ["PERIOD", "NUMPADDECIMAL"],
    PERIOD: ["PERIOD", "NUMPADDECIMAL"],
    ";": ["SEMICOLON"],
    SEMICOLON: ["SEMICOLON"],
    "'": ["QUOTE"],
    QUOTE: ["QUOTE"],
    "`": ["BACKQUOTE"],
    BACKQUOTE: ["BACKQUOTE"],
    "[": ["BRACKETLEFT"],
    BRACKETLEFT: ["BRACKETLEFT"],
    "]": ["BRACKETRIGHT"],
    BRACKETRIGHT: ["BRACKETRIGHT"],
    "\\": ["BACKSLASH"],
    BACKSLASH: ["BACKSLASH"],
};

const LOGICAL_KEY_MAP: Record<string, (eventKey: string, rawEvent: KeyboardEvent) => boolean> = {
    "+": (_k, e) => e.key === "+" || e.key === "=",
    "=": (_k, e) => e.key === "+" || e.key === "=",
    ESCAPE: (k) => k === "ESCAPE",
    ESC: (k) => k === "ESCAPE",
    ENTER: (k) => k === "ENTER",
    RETURN: (k) => k === "ENTER",
    SPACE: (k) => k === " " || k === "SPACE",
    TAB: (k) => k === "TAB",
    BACKSPACE: (k) => k === "BACKSPACE",
    DELETE: (k) => k === "DELETE",
    UP: (k) => k === "ARROWUP",
    ARROWUP: (k) => k === "ARROWUP",
    DOWN: (k) => k === "ARROWDOWN",
    ARROWDOWN: (k) => k === "ARROWDOWN",
    LEFT: (k) => k === "ARROWLEFT",
    ARROWLEFT: (k) => k === "ARROWLEFT",
    RIGHT: (k) => k === "ARROWRIGHT",
    ARROWRIGHT: (k) => k === "ARROWRIGHT",
};

export function matchEventKeyToStepMainKey(
    event: KeyboardEvent,
    stepOrNormalizedString: ParsedComboStep | string,
    useCode: boolean = false
): boolean {
    const mainKey =
        typeof stepOrNormalizedString === "string"
            ? parseComboStep(stepOrNormalizedString).mainKey
            : stepOrNormalizedString.mainKey;

    if (useCode && event.code) {
        return matchPhysicalCode(event.code.toUpperCase(), mainKey);
    }

    const eventKey = event.key.toUpperCase();
    const matcher = LOGICAL_KEY_MAP[mainKey];
    if (matcher) {
        return matcher(eventKey, event);
    }

    return eventKey === mainKey;
}

function matchPhysicalCode(eventCode: string, mainKey: string): boolean {
    const targets = PHYSICAL_CODE_MAP[mainKey];
    if (targets) {
        return targets.includes(eventCode);
    }

    return [mainKey, `KEY${mainKey}`, `DIGIT${mainKey}`].includes(eventCode);
}
