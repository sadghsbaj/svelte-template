import type { Snippet } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { HTMLAttributes } from "svelte/elements";

import type {
    FloatingAnchor,
    FloatingContext,
    FloatingDirection,
    FloatingOffset,
    FloatingPadding,
    FloatingPlacement,
    FloatingPositionResult,
    FloatingSide,
} from "$components/_system/floating/floating.types";

export type PopoverPhase = "closed" | "positioning" | "entering" | "open" | "exiting";
export type PopoverRole = "dialog" | "menu" | "listbox" | "tree" | "grid";
export type PopoverOpenReason = "trigger" | "programmatic" | "context-menu";
export type PopoverCloseReason =
    "trigger" | "outside-pointer" | "escape" | "programmatic" | "focus-out" | "anchor-detached";
export type PopoverReason = PopoverOpenReason | PopoverCloseReason;

export interface PopoverChangeDetail {
    reason: PopoverReason;
    event?: Event;
    trigger: HTMLElement | null;
    content: HTMLElement | null;
}

export interface PopoverDismissDetail extends PopoverChangeDetail {
    reason: PopoverCloseReason;
}

export interface PopoverDismissOptions {
    outsidePointer?: boolean;
    escape?: boolean;
    focusOutside?: boolean;
    anchorDetached?: boolean;
}

export type PopoverInitialFocus =
    | "auto"
    | "first-focusable"
    | "last-focusable"
    | "self"
    | (string & {})
    | HTMLElement
    | ((content: HTMLElement) => HTMLElement | null)
    | false;
export type PopoverRestoreFocus =
    "auto" | boolean | HTMLElement | ((detail: PopoverDismissDetail) => HTMLElement | null);

export interface PopoverAnimationContext {
    phase: "enter" | "exit";
    reason: PopoverReason;
    placement: FloatingPlacement;
    side: FloatingSide;
    alignment: FloatingContext["alignment"];
    transformOrigin: string;
    reducedMotion: boolean;
}

export type PopoverAnimation = (
    element: HTMLElement,
    context: PopoverAnimationContext
) => Animation | null;

export interface PopoverMethods {
    openPopover: (reason?: PopoverOpenReason, event?: Event) => void;
    close: (reason?: PopoverCloseReason, event?: Event) => void;
    toggle: (event?: Event) => void;
}

export interface PopoverTriggerContext extends PopoverMethods {
    attachment: Attachment<HTMLElement>;
    open: boolean;
    disabled: boolean;
    triggerId: string;
    contentId: string;
}

export interface PopoverContext extends PopoverMethods {
    open: boolean;
    present: boolean;
    phase: PopoverPhase;
    disabled: boolean;
    triggerId: string;
    contentId: string;
    triggerElement: HTMLElement | null;
    element: HTMLElement | null;
}

export type PopoverContentContext = PopoverContext &
    FloatingContext & {
        updatePosition: () => void;
    };

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
    open?: boolean;
    disabled?: boolean;
    anchor?: FloatingAnchor;
    placement?: FloatingPlacement;
    offset?: number | FloatingOffset;
    padding?: number | FloatingPadding;
    flip?: boolean;
    shift?: boolean;
    boundary?: "viewport" | HTMLElement;
    direction?: FloatingDirection;
    trackPosition?: boolean;
    dismiss?: boolean | PopoverDismissOptions;
    modal?: boolean;
    initialFocus?: PopoverInitialFocus;
    restoreFocus?: PopoverRestoreFocus;
    role?: PopoverRole;
    animation?: "default" | "none" | PopoverAnimation;
    element?: HTMLDivElement;
    triggerElement?: HTMLElement;
    onOpenChange?: (open: boolean, detail: PopoverChangeDetail) => void;
    onDismiss?: (detail: PopoverDismissDetail) => boolean | void;
    onPositionChange?: (result: FloatingPositionResult) => void;
    onPositionError?: (error: Error) => void;
    trigger?: Snippet<[PopoverTriggerContext]>;
    children?: Snippet<[PopoverContentContext]>;
}
