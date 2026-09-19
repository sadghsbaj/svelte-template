import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type {
    FeedbackAction,
    FeedbackDescription,
    FeedbackIcon,
    FeedbackInput,
    FeedbackStatus,
} from "$components/_system/feedback/feedback.types";

export type NotificationInput = Omit<FeedbackInput<"notification">, "position">;

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
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
    FeedbackAction as NotificationAction,
    FeedbackDescription as NotificationDescription,
    FeedbackDismissDetail as NotificationDismissDetail,
    FeedbackIcon as NotificationIcon,
    FeedbackPriority as NotificationPriority,
    FeedbackStatus as NotificationStatus,
} from "$components/_system/feedback/feedback.types";
