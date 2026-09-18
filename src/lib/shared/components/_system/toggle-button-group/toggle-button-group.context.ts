import { createContext } from "svelte";

export interface ToggleButtonGroupContext {
    isPressed: (value: string) => boolean;
    toggle: (value: string) => void;
}

const [getToggleButtonGroupContext, setToggleButtonGroupContext] =
    createContext<ToggleButtonGroupContext>();

export function getOptionalToggleButtonGroupContext(): ToggleButtonGroupContext | undefined {
    try {
        return getToggleButtonGroupContext();
    } catch {
        return undefined;
    }
}

export { setToggleButtonGroupContext };
