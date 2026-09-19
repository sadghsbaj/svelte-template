import type {
    ActiveTooltip,
    ResolvedTooltipOptions,
    TooltipCloseReason,
    TooltipInput,
    TooltipOpenReason,
} from "./tooltip.types";

const SKIP_DELAY_DURATION = 300;
export const TOOLTIP_CONTENT_ID = "app-tooltip";

function addDescription(element: HTMLElement): void {
    const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    if (!ids.includes(TOOLTIP_CONTENT_ID)) ids.push(TOOLTIP_CONTENT_ID);
    element.setAttribute("aria-describedby", ids.join(" "));
}

function removeDescription(element: HTMLElement): void {
    const ids = (element.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((id) => id && id !== TOOLTIP_CONTENT_ID);
    if (ids.length > 0) element.setAttribute("aria-describedby", ids.join(" "));
    else element.toggleAttribute("aria-describedby", false);
}

export function resolveTooltipOptions(input: TooltipInput): ResolvedTooltipOptions {
    const options = typeof input === "string" ? { content: input } : input;
    const title = options.title ?? options.content ?? "";

    return {
        title,
        description: options.description,
        leading: options.leading,
        trailing: options.trailing,
        placement: options.placement ?? "top",
        offset: options.offset ?? 8,
        padding: options.padding ?? 8,
        flip: options.flip ?? true,
        shift: options.shift ?? true,
        openDelay: Math.max(0, options.openDelay ?? 450),
        closeDelay: Math.max(0, options.closeDelay ?? 80),
        disabled: options.disabled ?? false,
        animation: options.animation ?? "default",
    };
}

class TooltipState {
    private openTimer: ReturnType<typeof setTimeout> | null = null;
    private closeTimer: ReturnType<typeof setTimeout> | null = null;
    private pendingTrigger: HTMLElement | null = null;
    private lastCloseTime = -Infinity;
    private nextToken = 0;

    active = $state<ActiveTooltip | null>(null);
    open = $state(false);

    requestOpen(
        trigger: HTMLElement,
        input: TooltipInput,
        reason: TooltipOpenReason
    ): void {
        const options = resolveTooltipOptions(input);
        this.clearCloseTimer();

        if (options.disabled || !options.title.trim()) {
            this.close(trigger, "disabled", true);
            return;
        }

        if (this.active?.trigger === trigger) {
            this.active = { ...this.active, options, reason };
            this.open = true;
            return;
        }

        this.clearOpenTimer();
        this.pendingTrigger = trigger;
        const warm = this.active !== null || performance.now() - this.lastCloseTime <= SKIP_DELAY_DURATION;
        const delay = reason === "focus" || warm ? 0 : options.openDelay;

        const activate = (): void => {
            this.openTimer = null;
            if (this.pendingTrigger !== trigger || !trigger.isConnected) return;
            this.pendingTrigger = null;
            if (this.active && this.active.trigger !== trigger) {
                removeDescription(this.active.trigger);
            }
            addDescription(trigger);
            this.active = {
                token: ++this.nextToken,
                trigger,
                options,
                reason,
            };
            this.open = true;
        };

        if (delay === 0) activate();
        else this.openTimer = setTimeout(activate, delay);
    }

    requestClose(trigger: HTMLElement, reason: TooltipCloseReason, immediate = false): void {
        if (this.pendingTrigger === trigger) {
            this.clearOpenTimer();
            this.pendingTrigger = null;
        }
        if (this.active?.trigger !== trigger) return;

        this.clearCloseTimer();
        const delay = immediate ? 0 : this.active.options.closeDelay;
        if (delay === 0) this.close(trigger, reason);
        else this.closeTimer = setTimeout(() => this.close(trigger, reason), delay);
    }

    keepOpen(trigger: HTMLElement): void {
        if (this.active?.trigger === trigger) this.clearCloseTimer();
    }

    requestCloseFromContent(trigger: HTMLElement): void {
        const activeElement = trigger.ownerDocument.activeElement;
        const hasKeyboardFocus =
            this.active?.reason === "focus" && activeElement && trigger.contains(activeElement);
        if (trigger.matches(":hover") || hasKeyboardFocus) return;
        this.requestClose(trigger, "pointer");
    }

    update(trigger: HTMLElement, input: TooltipInput): void {
        if (this.active?.trigger !== trigger) return;
        const options = resolveTooltipOptions(input);
        if (options.disabled || !options.title.trim()) {
            this.close(trigger, "disabled", true);
            return;
        }
        this.active = { ...this.active, options };
    }

    unregister(trigger: HTMLElement): void {
        if (this.pendingTrigger === trigger) {
            this.clearOpenTimer();
            this.pendingTrigger = null;
        }
        if (this.active?.trigger === trigger) {
            removeDescription(trigger);
            this.close(trigger, "disabled", true);
        }
    }

    completeClose(token: number): void {
        if (this.active?.token !== token || this.open) return;
        removeDescription(this.active.trigger);
        this.active = null;
        this.lastCloseTime = performance.now();
    }

    reset(): void {
        this.clearOpenTimer();
        this.clearCloseTimer();
        this.pendingTrigger = null;
        if (this.active) removeDescription(this.active.trigger);
        this.active = null;
        this.open = false;
        this.lastCloseTime = -Infinity;
    }

    private close(trigger: HTMLElement, reason: TooltipCloseReason, immediate = false): void {
        if (this.active?.trigger !== trigger) return;
        this.clearCloseTimer();
        this.active = { ...this.active, reason };
        this.open = false;
        if (immediate && this.active.options.animation === "none") {
            this.completeClose(this.active.token);
        }
    }

    private clearOpenTimer(): void {
        if (this.openTimer === null) return;
        clearTimeout(this.openTimer);
        this.openTimer = null;
    }

    private clearCloseTimer(): void {
        if (this.closeTimer === null) return;
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
    }
}

export const tooltipState = new TooltipState();
