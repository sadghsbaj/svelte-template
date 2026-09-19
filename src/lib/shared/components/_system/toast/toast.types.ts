import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type {
    FeedbackAction,
    FeedbackDescription,
    FeedbackIcon,
    FeedbackInput,
    FeedbackStatus,
} from "$components/_system/feedback/feedback.types";

export type ToastPosition =
    | "top-start"
    | "top-center"
    | "top-end"
    | "bottom-start"
    | "bottom-center"
    | "bottom-end";

export type ToastInput = Omit<FeedbackInput<ToastPosition>, "position" | "items"> & {
    position?: ToastPosition;
};

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    status?: FeedbackStatus;
    title: string;
    description?: FeedbackDescription;
    icon?: FeedbackIcon;
    leading?: Snippet;
    trailing?: Snippet;
    action?: FeedbackAction;
    dismissible?: boolean;
    closeButton?: boolean;
    closeLabel?: string;
    onDismiss?: () => void;
    onAction?: () => void;
    class?: string;
    element?: HTMLDivElement;
}

export type {
    FeedbackAction as ToastAction,
    FeedbackDescription as ToastDescription,
    FeedbackDismissDetail as ToastDismissDetail,
    FeedbackIcon as ToastIcon,
    FeedbackPriority as ToastPriority,
    FeedbackStatus as ToastStatus,
} from "$components/_system/feedback/feedback.types";
