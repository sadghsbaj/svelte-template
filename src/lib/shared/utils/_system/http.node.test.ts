import { describe, expect, test, vi } from "vitest";

import { delay } from "./async.svelte";
import { http, HttpClient, HttpError } from "./http";

describe("HTTP Utilities", () => {
    describe("HttpClient basic functions", () => {
        test("should append query parameters correctly to absolute and relative URLs", async () => {
            // Mock fetch to inspect the final URL received
            const mockFetch = vi
                .fn()
                .mockImplementation(() => Promise.resolve(Response.json({ ok: true })));

            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });

            await client.get("/users", {
                params: { limit: 10, filter: "active", empty: null, undef: undefined },
            });
            expect(mockFetch).toHaveBeenCalled();
            const request = mockFetch.mock.calls[0][0] as Request;
            expect(request.url).toBe("https://api.test/users?limit=10&filter=active");

            // Absolute URL with hash
            await client.get("https://api.test/v1/data#section", { params: { page: 2 } });
            const request2 = mockFetch.mock.calls[1][0] as Request;
            expect(request2.url).toBe("https://api.test/v1/data?page=2#section");
        });

        test("should serialize request body and set headers", async () => {
            const mockFetch = vi.fn().mockResolvedValue(Response.json({ created: true }));

            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });

            await client.post("/items", { body: { name: "test-item", values: [1, 2] } });
            const request = mockFetch.mock.calls[0][0] as Request;
            expect(request.headers.get("Content-Type")).toBe("application/json");
            const bodyText = await request.text();
            expect(JSON.parse(bodyText)).toEqual({ name: "test-item", values: [1, 2] });
        });

        test("should pass native body formats without serialization", async () => {
            const mockFetch = vi.fn().mockResolvedValue(new Response("raw"));
            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });

            const searchParams = new URLSearchParams({ key: "val" });
            await client.post("/raw", { body: searchParams });

            const request = mockFetch.mock.calls[0][0] as Request;
            // Native URLSearchParams is passed through
            const bodyText = await request.text();
            expect(bodyText).toBe("key=val");
        });

        test("should ignore body on GET requests without throwing TypeError", async () => {
            const mockFetch = vi.fn().mockResolvedValue(Response.json({ ok: true }));

            const client = new HttpClient({
                fetch: mockFetch,
                baseUrl: "https://api.test",
                body: { defaultData: "ignore-me" },
            });

            await expect(client.get("/users", { body: { filter: "ignored" } })).resolves.toEqual({
                ok: true,
            });
            const request = mockFetch.mock.calls[0][0] as Request;
            expect(request.method).toBe("GET");
            expect(request.body).toBeNull();
        });
    });

    describe("HttpClient Configuration and Extension", () => {
        test("should extend client configuration", async () => {
            const mockFetch = vi.fn().mockResolvedValue(Response.json({ success: true }));

            const api = http.extend({
                baseUrl: "https://api.example.com",
                headers: { Authorization: "Bearer token123" },
                fetch: mockFetch,
            });

            await api.get("/endpoints");
            const request = mockFetch.mock.calls[0][0] as Request;
            expect(request.url).toBe("https://api.example.com/endpoints");
            expect(request.headers.get("Authorization")).toBe("Bearer token123");
        });
    });

    describe("Interceptors", () => {
        test("should execute onRequest and onResponse interceptors", async () => {
            const mockFetch = vi.fn().mockResolvedValue(Response.json({ value: "original" }));

            const onRequestSpy = vi.fn((req: Request) => {
                req.headers.set("X-Custom-Req", "intercepted");
            });

            const onResponseSpy = vi.fn(() => {
                // Return custom mocked response instead
                return Response.json({ value: "intercepted-response" });
            });

            const client = new HttpClient({
                fetch: mockFetch,
                baseUrl: "https://api.test",
                onRequest: onRequestSpy,
                onResponse: onResponseSpy,
            });

            const data = await client.get<{ value: string }>("/test");
            expect(onRequestSpy).toHaveBeenCalled();
            expect(onResponseSpy).toHaveBeenCalled();
            expect(data.value).toBe("intercepted-response");

            const request = mockFetch.mock.calls[0][0] as Request;
            expect(request.headers.get("X-Custom-Req")).toBe("intercepted");
        });
    });

    describe("Error Handling", () => {
        test("should throw HttpError on failure and parse payload", async () => {
            const mockFetch = vi.fn().mockResolvedValue(
                Response.json(
                    { error: "bad request data" },
                    {
                        status: 400,
                        statusText: "Bad Request",
                    }
                )
            );

            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });

            try {
                await client.get("/failed");
                expect.unreachable("should have thrown HttpError");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpError);
                const httpError = error as HttpError;
                expect(httpError.status).toBe(400);
                expect(httpError.statusText).toBe("Bad Request");
                expect(httpError.data).toEqual({ error: "bad request data" });
            }
        });
    });

    describe("Timeouts & Aborts", () => {
        test("should throw TimeoutError when operation times out", async () => {
            // Mock fetch to delay response indefinitely
            const mockFetch = vi.fn().mockImplementation(async (req: Request) => {
                const signal = req.signal;
                return new Promise<Response>((resolve, reject) => {
                    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
                    if (signal.aborted) return onAbort();
                    signal.addEventListener("abort", onAbort);
                });
            });

            const client = new HttpClient({
                fetch: mockFetch,
                baseUrl: "https://api.test",
                timeout: 10,
            });

            await expect(client.get("/slow")).rejects.toThrow(/timed out/i);
        });

        test("should not throw TimeoutError if request completes in time", async () => {
            const mockFetch = vi.fn().mockImplementation(async () => {
                await delay(5);
                return Response.json({ ok: true });
            });

            const client = new HttpClient({
                fetch: mockFetch,
                baseUrl: "https://api.test",
                timeout: 50,
            });
            const data = await client.get("/fast");
            expect(data).toEqual({ ok: true });
        });

        test("should cleanly remove abort listener from original signal to prevent memory leaks", async () => {
            const mockFetch = vi.fn().mockResolvedValue(Response.json({ ok: true }));

            const controller = new AbortController();
            const signal = controller.signal;

            const addSpy = vi.spyOn(signal, "addEventListener");
            const removeSpy = vi.spyOn(signal, "removeEventListener");

            const client = new HttpClient({
                fetch: mockFetch,
                baseUrl: "https://api.test",
                timeout: 50,
            });

            await client.get("/leak-test", { signal });

            expect(addSpy).toHaveBeenCalledWith("abort", expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith("abort", expect.any(Function));
        });
    });

    describe("Empty Response Handling", () => {
        test("should return null without throwing on 204 No Content", async () => {
            const mockFetch = vi.fn().mockResolvedValue(
                new Response(null, {
                    status: 204,
                    statusText: "No Content",
                })
            );

            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });
            const data = await client.get("/nocontent");
            expect(data).toBeNull();
        });

        test("should return null without throwing on 200 OK with empty body", async () => {
            const mockFetch = vi.fn().mockResolvedValue(
                new Response("", {
                    status: 200,
                    statusText: "OK",
                    headers: { "Content-Type": "application/json" },
                })
            );

            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });
            const data = await client.get("/emptyjson");
            expect(data).toBeNull();
        });
    });

    describe("Binary Data Handling", () => {
        test("should parse binary response types as Blob instead of text to prevent corruption", async () => {
            const pngContent = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])]);
            const mockFetch = vi.fn().mockResolvedValue(
                new Response(pngContent, {
                    status: 200,
                    headers: { "Content-Type": "image/png" },
                })
            );

            const client = new HttpClient({ fetch: mockFetch, baseUrl: "https://api.test" });
            const data = await client.get<Blob>("/image.png");

            expect(data).toBeInstanceOf(Blob);
            expect(data.type).toBe("image/png");
            expect(data.size).toBe(8);
        });
    });
});
