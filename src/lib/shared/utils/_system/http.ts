/**
 * @file Focused, type-safe, and isomorphic HTTP request utility.
 *
 * Implements an HttpClient that supports request/response interceptors,
 * query parameter merging, body serialization, timeouts, and custom fetch
 * implementations (such as SvelteKit's native fetch for SSR).
 */

export interface HttpRequestOptions extends Omit<RequestInit, "body"> {
    /** Optional query parameters to append to the URL. */
    params?: Record<string, string | number | boolean | undefined | null>;
    /** Optional request body. Automatically serialized if it is a plain object or array. */
    body?: unknown;
    /** Base URL to prepend to request paths. */
    baseUrl?: string;
    /** Timeout in milliseconds. Rejects with a TimeoutError on expiration. */
    timeout?: number;
    /** Custom fetch implementation (critical for SvelteKit's load functions to run on SSR). */
    fetch?: typeof globalThis.fetch;
    /** Interceptor triggered before dispatching the request. */
    onRequest?: (request: Request) => Promise<Request | void> | Request | void;
    /** Interceptor triggered after receiving the response. */
    onResponse?: (response: Response) => Promise<Response | void> | Response | void;
}

/**
 * Standard HTTP Error class wrapping the failed response and parsed error payload.
 */
export class HttpError extends Error {
    public readonly response: Response;
    public readonly status: number;
    public readonly statusText: string;
    public readonly data: unknown;

    constructor(response: Response, data: unknown) {
        super(`HTTP Request failed with status ${response.status} (${response.statusText})`);
        this.name = "HttpError";
        this.response = response;
        this.status = response.status;
        this.statusText = response.statusText;
        this.data = data;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Appends query parameters to a URL string.
 * Safely handles both absolute and relative paths, preserving hashes.
 */
function appendParams(urlStr: string, params: HttpRequestOptions["params"]): string {
    if (!params) return urlStr;

    const isRelative = !/^[a-z]+:\/\//i.test(urlStr) && !urlStr.startsWith("//");
    const dummyBase = "https://dummy.local";
    const url = new URL(urlStr, isRelative ? dummyBase : undefined);

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    }

    if (isRelative) {
        return url.pathname + url.search + url.hash;
    }
    return url.href;
}

/**
 * Serializes the request body based on its type.
 * Returns the serialized body and default content-type header if serializable.
 */
function serializeBody(body: unknown): { body: BodyInit; contentType?: string } | undefined {
    if (body === undefined || body === null) {
        return undefined;
    }

    // Pass through native body types
    if (
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        body instanceof Uint8Array ||
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        typeof body === "string"
    ) {
        return { body: body as BodyInit };
    }

    // Automatically serialize plain objects and arrays to JSON
    return {
        body: JSON.stringify(body),
        contentType: "application/json",
    };
}

/**
 * An isomorphic HttpClient.
 */
export class HttpClient {
    #defaults: HttpRequestOptions;

    constructor(defaults: HttpRequestOptions = {}) {
        this.#defaults = defaults;
    }

    /**
     * Executes an HTTP request.
     */
    async request<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
        const fetchFn = options.fetch || this.#defaults.fetch || globalThis.fetch;
        const baseUrl = options.baseUrl ?? this.#defaults.baseUrl;
        const isAbsolute = /^[a-z]+:\/\//i.test(url) || url.startsWith("//");

        let finalUrl =
            baseUrl && !isAbsolute
                ? `${baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`
                : url;

        // Merge query parameters
        const mergedParams = { ...this.#defaults.params, ...options.params };
        finalUrl = appendParams(finalUrl, mergedParams);

        // Merge headers
        const headers = new Headers(this.#defaults.headers);
        const optHeaders = new Headers(options.headers);
        optHeaders.forEach((value, key) => headers.set(key, value));

        // Serialize body payload
        const serialized = serializeBody(options.body ?? this.#defaults.body);
        let bodyInit: BodyInit | undefined;
        if (serialized) {
            bodyInit = serialized.body;
            if (serialized.contentType && !headers.has("Content-Type")) {
                headers.set("Content-Type", serialized.contentType);
            }
        }

        // Set up timeouts
        const timeoutMs = options.timeout ?? this.#defaults.timeout;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        let controller: AbortController | undefined;
        const originalSignal = options.signal || this.#defaults.signal;
        let signal = originalSignal;

        const onAbort = (): void => {
            controller?.abort();
        };

        if (timeoutMs) {
            controller = new AbortController();
            if (originalSignal) {
                originalSignal.addEventListener("abort", onAbort);
            }
            signal = controller.signal;
            timeoutId = setTimeout(() => {
                controller?.abort(new DOMException("The operation timed out.", "TimeoutError"));
            }, timeoutMs);
        }

        const method = (options.method || this.#defaults.method || "GET").toUpperCase();

        // Prevent passing body to GET or HEAD requests as required by standard Request specification
        const isBodyAllowed = method !== "GET" && method !== "HEAD";

        // Copy options and delete custom properties to prevent passing them to native Request
        const cleanRequestInit = { ...options };
        delete cleanRequestInit.params;
        delete cleanRequestInit.body;
        delete cleanRequestInit.baseUrl;
        delete cleanRequestInit.timeout;
        delete cleanRequestInit.fetch;
        delete cleanRequestInit.onRequest;
        delete cleanRequestInit.onResponse;

        let requestObj = new Request(finalUrl, {
            ...cleanRequestInit,
            method,
            headers,
            body: isBodyAllowed ? bodyInit : undefined,
            signal,
        });

        // Trigger onRequest interceptor
        const onRequest = options.onRequest || this.#defaults.onRequest;
        if (onRequest) {
            const modified = await onRequest(requestObj);
            if (modified instanceof Request) {
                requestObj = modified;
            }
        }

        try {
            let response = await fetchFn(requestObj);

            // Trigger onResponse interceptor
            const onResponse = options.onResponse || this.#defaults.onResponse;
            if (onResponse) {
                const modified = await onResponse(response);
                if (modified instanceof Response) {
                    response = modified;
                }
            }

            // Parse response content safely handling 204/205, empty bodies, and binary data
            let data: unknown = null;
            if (response.status !== 204 && response.status !== 205) {
                const contentType = (response.headers.get("Content-Type") || "").toLowerCase();

                // If it is JSON, parse safely
                if (contentType.includes("application/json")) {
                    const text = await response.text();
                    if (text) {
                        try {
                            data = JSON.parse(text);
                        } catch {
                            data = text;
                        }
                    }
                }
                // If it is text-like, read as text
                else if (
                    contentType.includes("text/") ||
                    contentType.includes("application/xml") ||
                    contentType.includes("application/javascript")
                ) {
                    data = await response.text();
                }
                // Otherwise treat as binary and read as Blob to prevent UTF-8 corruption
                else {
                    data = await response.blob();
                }
            }

            if (!response.ok) {
                throw new HttpError(response, data);
            }

            return data as T;
        } catch (error) {
            // Convert abort triggered by timeout into a TimeoutError
            if (
                error instanceof DOMException &&
                error.name === "AbortError" &&
                controller?.signal.aborted
            ) {
                throw new DOMException("The operation timed out.", "TimeoutError");
            }
            throw error;
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (timeoutMs && originalSignal) {
                originalSignal.removeEventListener("abort", onAbort);
            }
        }
    }

    get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: "GET" });
    }

    post<T>(url: string, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: "POST" });
    }

    put<T>(url: string, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: "PUT" });
    }

    patch<T>(url: string, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: "PATCH" });
    }

    delete<T>(url: string, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(url, { ...options, method: "DELETE" });
    }

    /**
     * Creates a new HttpClient instance extending the configurations of this instance.
     */
    extend(config: HttpRequestOptions): HttpClient {
        const mergedHeaders = {
            ...Object.fromEntries(new Headers(this.#defaults.headers).entries()),
            ...Object.fromEntries(new Headers(config.headers).entries()),
        };

        return new HttpClient({
            ...this.#defaults,
            ...config,
            headers: mergedHeaders,
        });
    }
}

export const http = new HttpClient();
