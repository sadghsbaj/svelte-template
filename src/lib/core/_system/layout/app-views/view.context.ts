import { createContext } from "svelte";

import type { ViewState } from "./viewState.svelte";

/**
 * Type-safe Svelte 5 context getter and setter pair for view state management.
 */
export const [getViewStateContext, setViewStateContext] = createContext<() => ViewState<string>>();
