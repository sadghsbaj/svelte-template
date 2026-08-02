<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Attachment } from "svelte/attachments";

    import { getViewStateContext } from "./view.context";

    interface Props {
        view: string;
        overflow?: "auto" | "hidden" | "scroll" | "visible";
        children?: Snippet;
    }

    let { view, overflow = "auto", children }: Props = $props();

    const getViewState = getViewStateContext();
    if (!getViewState) {
        throw new Error("AppView must be rendered within an AppViews container");
    }

    const viewState = $derived(getViewState());
    const inTransition = $derived(viewState.getInTransition(view));
    const outTransition = $derived(viewState.getOutTransition(view));
    const transitionParams = $derived(viewState.isAnimated(view) ? {} : { duration: 0 });

    /**
     * Configures the custom `--app-view-overflow` CSS property on DOM mount
     * when a non-default overflow behavior is specified via component props.
     */
    const viewOverflow: Attachment = (node) => {
        if (overflow !== "auto") {
            (node as HTMLElement).style.setProperty("--app-view-overflow", overflow);
        }
    };

    /**
     * Tracks and restores scroll coordinates across view navigation lifecycles,
     * capturing scroll offsets before destruction and reapplying them on mount.
     */
    const scrollRestoration: Attachment = (node) => {
        const el = node as HTMLElement;

        let lastPos = 0;
        let lastHeight = 0;

        const handleScroll = () => {
            lastPos = el.scrollTop;
            lastHeight = el.scrollHeight;
        };
        // eslint-disable-next-line unicorn/prefer-observer-apis
        el.addEventListener("scroll", handleScroll, { passive: true });

        requestAnimationFrame(() => {
            viewState.restoreScroll(el, view);
            lastPos = el.scrollTop;
            lastHeight = el.scrollHeight;
        });

        return () => {
            el.removeEventListener("scroll", handleScroll);
            const height = el.scrollHeight > 0 ? el.scrollHeight : lastHeight;
            const pos = el.scrollHeight > 0 ? el.scrollTop : lastPos;
            if (height > 0) {
                viewState.savePosition(view, { pos, height });
            }
        };
    };
</script>

{#if viewState.isCurrent(view)}
    <div
        class="app-view"
        in:inTransition={transitionParams}
        out:outTransition={transitionParams}
        {@attach scrollRestoration}
        {@attach viewOverflow}
    >
        {@render children?.()}
    </div>
{/if}
