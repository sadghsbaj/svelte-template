import type { Component, Snippet } from "svelte";

export type FeedbackStatus = "base" | "accent" | "info" | "success" | "warning" | "danger";
export type FeedbackPriority = "polite" | "assertive" | "off";
export type FeedbackPhase = "queued" | "entering" | "visible" | "exiting";
export type FeedbackPauseReason = "hover" | "focus" | "press" | "drag" | "document-hidden";
export type FeedbackDismissReason =
    | "timeout"
    | "close-button"
    | "middle-click"
    | "swipe"
    | "action"
    | "escape"
    | "programmatic"
    | "clear";

export type FeedbackIcon = Component<{ size?: number; class?: string }>;
export type FeedbackDescription = string | readonly string[];

export interface FeedbackAction {
    label: string;
    onSelect: () => void | Promise<void>;
    dismissOnSelect?: boolean;
}

export interface FeedbackDismissDetail {
    id: string;
    reason: FeedbackDismissReason;
}

export interface FeedbackInput<P extends string> {
    id?: string;
    position: P;
    status?: FeedbackStatus;
    title: string;
    description?: FeedbackDescription;
    icon?: FeedbackIcon;
    trailing?: Snippet;
    action?: FeedbackAction;
    duration?: number | null;
    dismissible?: boolean;
    closeButton?: boolean;
    pauseOnInteraction?: boolean;
    priority?: FeedbackPriority;
    onDismiss?: (detail: FeedbackDismissDetail) => void;
}

export interface FeedbackRecord<P extends string> {
    id: string;
    position: P;
    status: FeedbackStatus;
    title: string;
    description?: FeedbackDescription;
    icon?: FeedbackIcon;
    trailing?: Snippet;
    action?: FeedbackAction;
    duration: number | null;
    dismissible: boolean;
    closeButton: boolean;
    pauseOnInteraction: boolean;
    priority: FeedbackPriority;
    onDismiss?: (detail: FeedbackDismissDetail) => void;
    phase: FeedbackPhase;
    dismissReason?: FeedbackDismissReason;
}

export interface FeedbackAnnouncement {
    token: number;
    priority: Exclude<FeedbackPriority, "off">;
    text: string;
}
