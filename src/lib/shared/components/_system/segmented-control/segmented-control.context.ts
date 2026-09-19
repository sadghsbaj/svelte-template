import { createContext } from "svelte";

export interface SegmentedControlContext {
    isDisabled: () => boolean;
    isSelected: (value: string) => boolean;
    layout: () => "equal" | "auto";
    select: (value: string) => void;
}

const [getSegmentedControlContext, setSegmentedControlContext] =
    createContext<SegmentedControlContext>();

export { getSegmentedControlContext, setSegmentedControlContext };
