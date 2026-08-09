export const blocklistConfig: (string | RegExp)[] = [
    // 1. Font-Weight Wörter sperren (nur font-400, font-500 etc. erlauben)
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,

    // 2. Direkte Verwendung gemappter Hauptfarben & Grautöne sperren
    // (zwingt zu base-*, accent-*, danger-*, warning-*, success-*)
    /^(?:[a-z-]+-)?(?:slate|gray|zinc|neutral|stone|blue|green|orange|red)(?:-\d+)?(?:\/\d+)?$/,

    // 3. Z-Index Utilities ab 10.000 sperren (Top-Layer Schutz für AppLayer)
    /^z-(\[?(?:[1-9]\d{4,})\]?)$/,
];
