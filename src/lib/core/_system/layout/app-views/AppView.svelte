<script lang="ts">
    import { getContext, type Snippet } from "svelte";
    import type { Attachment } from "svelte/attachments";

    import type { ViewState } from "./viewState.svelte";

    interface Props {
        view: string;
        children?: Snippet;
    }

    let { view, children }: Props = $props();

    const getViewState = getContext<(() => ViewState<string>) | undefined>("VIEW_STATE");
    if (!getViewState) {
        throw new Error("AppView must be rendered within an AppViews container");
    }

    const viewState = $derived(getViewState());

    const inTransition = $derived(viewState.getInTransition(view));
    const outTransition = $derived(viewState.getOutTransition(view));
    const transitionParams = $derived(
        viewState.isAnimated(view) ? {} : { duration: 0 }
    );

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
        data-layout="app-view"
        data-view={view}
        in:inTransition={transitionParams}
        out:outTransition={transitionParams}
        {@attach scrollRestoration}
    >
        {@render children?.()}
    </div>
{/if}
