const TEXT_INPUT_TYPES = new Set(["email", "number", "password", "search", "tel", "text", "url"]);

export function isTextEntryControl(element: HTMLElement): boolean {
    if (element instanceof HTMLTextAreaElement || element.isContentEditable) {
        return true;
    }

    return element instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(element.type);
}
