// Immediately detect and apply user preferences before browser paints
try {
    function initPreference(
        key: string,
        activeVal: string,
        inactiveVal: string,
        query: string,
        className: string
    ): boolean {
        const saved = localStorage.getItem(key);
        const systemMatches = window.matchMedia(query).matches;
        const isActive = saved === activeVal || (saved !== inactiveVal && systemMatches);

        document.documentElement.classList.toggle(className, isActive);
        return isActive;
    }

    // --- 1. THEME PREFERENCE ---
    const isDark = initPreference(
        "ui-theme",
        "dark",
        "light",
        "(prefers-color-scheme: dark)",
        "dark"
    );

    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    // Dynamically extract the background color from CSS variables to set the meta theme-color
    const themeColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-app")
        .trim();
    const meta = document.getElementById("theme-color-meta");
    if (meta && themeColor) {
        meta.setAttribute("content", themeColor);
    }

    // --- 2. MOTION PREFERENCE ---
    initPreference(
        "ui-motion-preference",
        "reduce",
        "no-preference",
        "(prefers-reduced-motion: reduce)",
        "ui-reduce-motion"
    );
} catch (error) {
    console.warn("UI preference initialization failed:", error);
}
