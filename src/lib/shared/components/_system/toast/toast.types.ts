import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type {
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

export type ToastInput = Omit<
    FeedbackInput<ToastPosition>,
    "position" | "items" | "description"
> & {
    position?: ToastPosition;
    description?: string;
};

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    status?: FeedbackStatus;
    title: string;
    description?: string;
    icon?: FeedbackIcon;
    leading?: Snippet;
    trailing?: Snippet;
    class?: string;
    element?: HTMLDivElement;
}

export type {
    FeedbackDismissDetail as ToastDismissDetail,
    FeedbackIcon as ToastIcon,
    FeedbackPriority as ToastPriority,
    FeedbackStatus as ToastStatus,
} from "$components/_system/feedback/feedback.types";
