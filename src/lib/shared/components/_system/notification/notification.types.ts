import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type {
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
    items?: readonly string[];
    icon?: FeedbackIcon;
    leading?: Snippet;
    trailing?: Snippet;
    class?: string;
    element?: HTMLDivElement;
}

export type {
    FeedbackDescription as NotificationDescription,
    FeedbackDismissDetail as NotificationDismissDetail,
    FeedbackIcon as NotificationIcon,
    FeedbackPriority as NotificationPriority,
    FeedbackStatus as NotificationStatus,
} from "$components/_system/feedback/feedback.types";
