export const blocklistConfig: (string | RegExp)[] = [
    // Disallow named font-weight utilities to enforce consistent numeric weights (e.g. font-400, font-500)
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,

    // Disallow raw base colors & grays to enforce semantic tokens (e.g. base-*, accent-*, danger-*, warning-*, success-*)
    /^(?:[a-z-]+-)?(?:slate|gray|zinc|neutral|stone|blue|green|orange|red)(?:-\d+)?(?:\/\d+)?$/,

    // Disallow utility z-indices >= 10,000 to preserve top-layer priority reserved for the AppLayer system
    /^z-(\[?(?:[1-9]\d{4,})\]?)$/,

    // Disallow aria-disabled - use disabled (resolves to disabled & aria disabled)
    /^aria-disabled:/,
];
