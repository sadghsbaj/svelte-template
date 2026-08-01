export interface DomMetrics {
    count: number;
    depth: number;
}

/**
 * Analyzes DOM structure by walking elements from a root node.
 * Ignores elements inside #dev-perf-overlay so the overlay does not inflate metric counts.
 */
export function analyzeDomStructure(root?: Element | Document): DomMetrics {
    if (typeof document === "undefined") {
        return { count: 0, depth: 0 };
    }

    const targetRoot = root ?? document;
    if (!targetRoot) {
        return { count: 0, depth: 0 };
    }

    const overlay = document.getElementById("dev-perf-overlay");
    let totalCount = 0;
    let maxDepth = 0;

    function walk(node: Element, currentDepth: number) {
        // Skip dev performance overlay and all its children
        if (overlay && (node === overlay || overlay.contains(node))) {
            return;
        }

        totalCount++;
        if (currentDepth > maxDepth) {
            maxDepth = currentDepth;
        }

        for (const child of node.children) {
            walk(child, currentDepth + 1);
        }
    }

    const startNode = targetRoot instanceof Document ? targetRoot.body : targetRoot;
    if (startNode) {
        walk(startNode, 1);
    }

    return {
        count: totalCount,
        depth: maxDepth,
    };
}
