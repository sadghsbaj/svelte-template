import { FeedbackState } from "$components/_system/feedback/feedbackState.svelte";
import type {
    FeedbackAnnouncement,
    FeedbackDismissReason,
    FeedbackPauseReason,
    FeedbackRecord,
    FeedbackStatus,
} from "$components/_system/feedback/feedback.types";

import type { NotificationInput } from "./notification.types";

type NotificationUpdate = Partial<Omit<NotificationInput, "id">>;

class NotificationState {
    #state = new FeedbackState<"notification">({
        defaultDuration: 6500,
        defaultPosition: "notification",
        defaultCloseButton: false,
        limit: 4,
    });

    get records(): readonly FeedbackRecord<"notification">[] {
        return this.#state.records;
    }

    get announcement(): FeedbackAnnouncement | null {
        return this.#state.announcement;
    }

    setLimit(limit: number): void {
        this.#state.setLimit(limit);
    }

    show(input: NotificationInput): string {
        return this.#state.show({ ...input, closeButton: false });
    }

    update(id: string, patch: NotificationUpdate): void {
        this.#state.update(id, { ...patch, closeButton: false });
    }

    markEntered(id: string): void {
        this.#state.markEntered(id);
    }

    requestDismiss(id: string, reason: FeedbackDismissReason, fromUser = false): void {
        this.#state.requestDismiss(id, reason, fromUser);
    }

    dismiss(id: string): void {
        this.#state.dismiss(id);
    }

    completeDismiss(id: string): void {
        this.#state.completeDismiss(id);
    }

    clear(): void {
        this.#state.clear();
    }

    pause(id: string, reason: FeedbackPauseReason): void {
        this.#state.pause(id, reason);
    }

    resume(id: string, reason: FeedbackPauseReason): void {
        this.#state.resume(id, reason);
    }

    pauseAll(reason: FeedbackPauseReason): void {
        this.#state.pauseAll(reason);
    }

    resumeAll(reason: FeedbackPauseReason): void {
        this.#state.resumeAll(reason);
    }

    reset(): void {
        this.#state.reset();
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
