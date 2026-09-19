import { FeedbackState } from "$components/_system/feedback/feedbackState.svelte";

import type { ToastInput, ToastPosition } from "./toast.types";

class ToastState extends FeedbackState<ToastPosition> {
    constructor() {
        super({ defaultDuration: 4000, defaultPosition: "bottom-end", limit: 4 });
    }

    success(title: string, options: Omit<ToastInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "success" });
    }

    warning(title: string, options: Omit<ToastInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "warning" });
    }

    danger(title: string, options: Omit<ToastInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "danger" });
    }

    info(title: string, options: Omit<ToastInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "info" });
    }

    accent(title: string, options: Omit<ToastInput, "title" | "status"> = {}): string {
        return this.show({ ...options, title, status: "accent" });
    }
}

export const toast = new ToastState();
