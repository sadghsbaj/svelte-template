/**
 * @file create-intercept-click.ts
 * Factory that returns a click handler which blocks the event when the element
 * is in a non-interactive state, then delegates to the original onclick handler.
 *
 * `isDisabled` is accepted as a getter so the returned handler always reads the
 * current reactive value instead of a snapshot captured at creation time.
 */

/**
 * Creates a click interceptor for interactive elements that can be disabled.
 *
 * @param isDisabled - Getter returning whether the element should block clicks.
 * @param onclick - Original onclick handler to delegate to when not disabled.
 */
export function createInterceptClick(
    isDisabled: () => boolean,
    onclick: ((e: MouseEvent) => void) | undefined
): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
        if (isDisabled()) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onclick?.(e);
    };
}
