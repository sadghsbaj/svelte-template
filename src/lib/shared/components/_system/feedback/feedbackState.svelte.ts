import { uuid } from "$utils";
import { SvelteSet } from "svelte/reactivity";

import type {
    FeedbackAnnouncement,
    FeedbackDismissReason,
    FeedbackInput,
    FeedbackPauseReason,
    FeedbackPriority,
    FeedbackRecord,
    FeedbackStatus,
} from "./feedback.types";

interface FeedbackStateOptions<P extends string> {
    defaultDuration: number;
    defaultPosition: P;
    limit: number;
}

interface TimerState {
    remaining: number;
    startedAt: number;
    timeout: ReturnType<typeof setTimeout> | null;
    pauseReasons: Set<FeedbackPauseReason>;
}

function resolvePriority(status: FeedbackStatus, priority?: FeedbackPriority): FeedbackPriority {
    if (priority) return priority;
    return status === "danger" ? "assertive" : "polite";
}

function announcementText(record: FeedbackRecord<string>): string {
    const description = Array.isArray(record.description)
        ? record.description.join(". ")
        : record.description;
    return [record.title, description, record.items?.join(". ")].filter(Boolean).join(". ");
}

export class FeedbackState<P extends string> {
    #defaultDuration: number;
    #defaultPosition: P;
    #limit: number;
    #announcementToken = 0;
    #records = $state<FeedbackRecord<P>[]>([]);
    #announcement = $state<FeedbackAnnouncement | null>(null);

    // Timer internals are imperative and intentionally do not participate in rendering.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    #timers = new Map<string, TimerState>();

    constructor(options: FeedbackStateOptions<P>) {
        this.#defaultDuration = options.defaultDuration;
        this.#defaultPosition = options.defaultPosition;
        this.#limit = options.limit;
    }

    get records(): readonly FeedbackRecord<P>[] {
        return this.#records;
    }

    get announcement(): FeedbackAnnouncement | null {
        return this.#announcement;
    }

    setLimit(limit: number): void {
        this.#limit = Math.max(1, Math.floor(limit));
        this.#promoteQueued();
    }

    show(input: Omit<FeedbackInput<P>, "position"> & { position?: P }): string {
        const status = input.status ?? "base";
        const duration = input.duration === undefined ? this.#defaultDuration : input.duration;
        const record: FeedbackRecord<P> = {
            id: input.id ?? uuid(),
            position: input.position ?? this.#defaultPosition,
            status,
            title: input.title,
            description: input.description,
            items: input.items,
            icon: input.icon,
            trailing: input.trailing,
            duration: duration === null || duration <= 0 ? null : duration,
            dismissible: input.dismissible ?? true,
            pauseOnInteraction: input.pauseOnInteraction ?? true,
            priority: resolvePriority(status, input.priority),
            onDismiss: input.onDismiss,
            phase: "queued",
        };

        const existingIndex = this.#records.findIndex((item) => item.id === record.id);
        if (existingIndex !== -1) {
            this.#clearTimer(record.id);
            this.#records.splice(existingIndex, 1);
        }
        this.#records.push(record);
        this.#promoteQueued();
        return record.id;
    }

    update(id: string, patch: Partial<Omit<FeedbackInput<P>, "id">>): void {
        const record = this.#records.find((item) => item.id === id);
        if (!record || record.phase === "exiting") return;

        if (patch.position !== undefined && patch.position !== record.position) {
            this.#clearTimer(id);
            record.position = patch.position;
            record.phase = "queued";
            this.#promoteQueued();
        }
        if (patch.status !== undefined) record.status = patch.status;
        if (patch.title !== undefined) record.title = patch.title;
        if (patch.description !== undefined) record.description = patch.description;
        if (patch.items !== undefined) record.items = patch.items;
        if (patch.icon !== undefined) record.icon = patch.icon;
        if (patch.trailing !== undefined) record.trailing = patch.trailing;
        if (patch.dismissible !== undefined) record.dismissible = patch.dismissible;
        if (patch.pauseOnInteraction !== undefined) {
            record.pauseOnInteraction = patch.pauseOnInteraction;
        }
        if (patch.priority !== undefined) record.priority = patch.priority;
        if (patch.onDismiss !== undefined) record.onDismiss = patch.onDismiss;
        if (patch.duration !== undefined) {
            record.duration = patch.duration === null || patch.duration <= 0 ? null : patch.duration;
            this.#clearTimer(id);
            if (record.phase === "visible") this.#startTimer(record);
        }
        if (patch.status !== undefined && patch.priority === undefined) {
            record.priority = resolvePriority(patch.status);
        }
    }

    markEntered(id: string): void {
        const record = this.#records.find((item) => item.id === id);
        if (!record || record.phase !== "entering") return;
        record.phase = "visible";
        this.#startTimer(record);
    }

    requestDismiss(id: string, reason: FeedbackDismissReason, fromUser = false): void {
        const record = this.#records.find((item) => item.id === id);
        if (!record || record.phase === "exiting") return;
        if (fromUser && !record.dismissible) return;

        if (record.phase === "queued") {
            record.onDismiss?.({ id, reason });
            const index = this.#records.findIndex((item) => item.id === id);
            if (index !== -1) this.#records.splice(index, 1);
            this.#promoteQueued();
            return;
        }

        this.#clearTimer(id);
        record.dismissReason = reason;
        record.phase = "exiting";
        record.onDismiss?.({ id, reason });
    }

    dismiss(id: string): void {
        this.requestDismiss(id, "programmatic");
    }

    completeDismiss(id: string): void {
        const index = this.#records.findIndex((item) => item.id === id);
        if (index === -1 || this.#records[index]?.phase !== "exiting") return;
        this.#clearTimer(id);
        this.#records.splice(index, 1);
        this.#promoteQueued();
    }

    clear(): void {
        for (const record of this.#records) {
            if (record.phase !== "exiting") this.requestDismiss(record.id, "clear");
        }
    }

    pause(id: string, reason: FeedbackPauseReason): void {
        const record = this.#records.find((item) => item.id === id);
        if (
            !record ||
            record.duration === null ||
            (!record.pauseOnInteraction && reason !== "document-hidden")
        ) {
            return;
        }
        const timer = this.#timerFor(record);
        if (timer.pauseReasons.has(reason)) return;

        if (timer.pauseReasons.size === 0 && timer.timeout !== null) {
            timer.remaining = Math.max(0, timer.remaining - (performance.now() - timer.startedAt));
            clearTimeout(timer.timeout);
            timer.timeout = null;
        }
        timer.pauseReasons.add(reason);
    }

    resume(id: string, reason: FeedbackPauseReason): void {
        const record = this.#records.find((item) => item.id === id);
        const timer = this.#timers.get(id);
        if (!record || !timer || !timer.pauseReasons.delete(reason)) return;
        if (timer.pauseReasons.size === 0 && record.phase === "visible") {
            this.#scheduleTimer(record, timer);
        }
    }

    pauseAll(reason: FeedbackPauseReason): void {
        for (const record of this.#records) this.pause(record.id, reason);
    }

    resumeAll(reason: FeedbackPauseReason): void {
        for (const record of this.#records) this.resume(record.id, reason);
    }

    reset(): void {
        for (const id of this.#timers.keys()) this.#clearTimer(id);
        this.#records = [];
        this.#announcement = null;
    }

    #timerFor(record: FeedbackRecord<P>): TimerState {
        let timer = this.#timers.get(record.id);
        if (!timer) {
            timer = {
                remaining: record.duration ?? 0,
                startedAt: 0,
                timeout: null,
                pauseReasons: new SvelteSet<FeedbackPauseReason>(),
            };
            this.#timers.set(record.id, timer);
        }
        return timer;
    }

    #startTimer(record: FeedbackRecord<P>): void {
        if (record.duration === null || typeof window === "undefined") return;
        const timer = this.#timerFor(record);
        timer.remaining = record.duration;
        if (timer.pauseReasons.size === 0) this.#scheduleTimer(record, timer);
    }

    #scheduleTimer(record: FeedbackRecord<P>, timer: TimerState): void {
        if (timer.remaining <= 0) {
            this.requestDismiss(record.id, "timeout");
            return;
        }
        timer.startedAt = performance.now();
        timer.timeout = setTimeout(() => {
            timer.timeout = null;
            this.requestDismiss(record.id, "timeout");
        }, timer.remaining);
    }

    #clearTimer(id: string): void {
        const timer = this.#timers.get(id);
        if (!timer) return;
        if (timer.timeout !== null) clearTimeout(timer.timeout);
        this.#timers.delete(id);
    }

    #promoteQueued(): void {
        const positions = new SvelteSet(this.#records.map((record) => record.position));
        for (const position of positions) {
            this.#promotePosition(position);
        }
    }

    #promotePosition(position: P): void {
        const visible = this.#records.filter(
            (record) => record.position === position && record.phase !== "queued"
        ).length;
        const available = Math.max(0, this.#limit - visible);
        const queued = this.#records
            .filter((record) => record.position === position && record.phase === "queued")
            .slice(0, available);

        for (const record of queued) {
            record.phase = "entering";
            if (record.priority !== "off") {
                this.#announcement = {
                    token: ++this.#announcementToken,
                    priority: record.priority,
                    text: announcementText(record as FeedbackRecord<string>),
                };
            }
        }
    }
}
