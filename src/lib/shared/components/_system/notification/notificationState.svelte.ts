import { FeedbackState } from "$components/_system/feedback/feedbackState.svelte";
import type { FeedbackStatus } from "$components/_system/feedback/feedback.types";

import type { NotificationInput } from "./notification.types";

class NotificationState extends FeedbackState<"notification"> {
    constructor() {
        super({ defaultDuration: 6500, defaultPosition: "notification", limit: 4 });
    }

    success(title: string, options: Omit<NotificationInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "success" });
    }

    warning(title: string, options: Omit<NotificationInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "warning" });
    }

    danger(title: string, options: Omit<NotificationInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "danger" });
    }

    info(title: string, options: Omit<NotificationInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "info" });
    }

    accent(title: string, options: Omit<NotificationInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "accent" });
    }

    withStatus(
        status: FeedbackStatus,
        title: string,
        options: Omit<NotificationInput, "title" | "status"> = {}
    ): string {
        return this.show({ ...options, title, status });
    }
}

export const notification = new NotificationState();
