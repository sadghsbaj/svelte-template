# http.ts

A focused, type-safe, and isomorphic HTTP client supporting request/response interceptors, query parameter serialization, custom fetch bindings, and clean error states.

## API Reference

### Classes

#### `HttpClient`

An isomorphic client wrapper around the browser/runtime `fetch` API.

```typescript
class HttpClient {
    constructor(defaults?: HttpRequestOptions);

    // Methods
    request<T>(url: string, options?: HttpRequestOptions): Promise<T>;
    get<T>(url: string, options?: HttpRequestOptions): Promise<T>;
    post<T>(url: string, options?: HttpRequestOptions): Promise<T>;
    put<T>(url: string, options?: HttpRequestOptions): Promise<T>;
    patch<T>(url: string, options?: HttpRequestOptions): Promise<T>;
    delete<T>(url: string, options?: HttpRequestOptions): Promise<T>;
    extend(config: HttpRequestOptions): HttpClient;
}
```

#### `HttpError`

Extends `Error` and is thrown when the response is not ok (status < 200 or >= 300).

- **Properties:**
    - `response: Response` - The raw fetch Response object.
    - `status: number` - HTTP status code (e.g. `404`, `500`).
    - `statusText: string` - HTTP status text.
    - `data: unknown` - The parsed response body (parsed JSON, text, or Blob).

---

### Interfaces

#### `HttpRequestOptions`

Extends native `RequestInit` (excluding `body`), adding custom configurations:

- `params?: Record<string, string | number | boolean | undefined | null>` - Query parameters.
- `body?: unknown` - Serializes plain objects/arrays to JSON automatically.
- `baseUrl?: string` - Prepended prefix for relative requests.
- `timeout?: number` - Request timeout limit in milliseconds. Throws `TimeoutError` on expiration.
- `fetch?: typeof globalThis.fetch` - Custom fetch implementation (crucial for SvelteKit Server-Side Rendering (SSR)).
- `onRequest?: (request: Request) => Promise<Request | void> | Request | void`
- `onResponse?: (response: Response) => Promise<Response | void> | Response | void`

---

## Important Technical Details

- **SvelteKit SSR Compatibility:** Always pass the load function's native `fetch` via the `fetch` property when running requests on SvelteKit servers:
    ```typescript
    // Inside load function
    const data = await http.get("/api/users", { fetch });
    ```
- **Response Auto-Parsing:**
    - `Content-Type: application/json` ➡️ parsed as a JavaScript object.
    - `Content-Type: text/*` or xml/javascript ➡️ read as plain text.
    - Others (binary, images, files) ➡️ read as a `Blob` to prevent UTF-8 corruption.
    - Empty status codes (`204`, `205`) resolve immediately to `null`.
- **Body Serialization:** Plain JS objects and arrays are serialized to JSON and the `Content-Type: application/json` header is appended automatically.
