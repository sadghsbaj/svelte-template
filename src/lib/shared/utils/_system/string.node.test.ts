import { describe, expect, test } from "vitest";

import {
    camelCase,
    capitalize,
    kebabCase,
    pascalCase,
    slugify,
    snakeCase,
    stripHtml,
    template,
} from "./string";

describe("String Utilities", () => {
    describe("capitalize", () => {
        test("should capitalize the first letter of a word", () => {
            expect(capitalize("hello")).toBe("Hello");
            expect(capitalize("world")).toBe("World");
        });

        test("should keep already capitalized first letters unchanged", () => {
            expect(capitalize("Hello")).toBe("Hello");
            expect(capitalize("HTML")).toBe("HTML");
        });

        test("should work on a single character", () => {
            expect(capitalize("a")).toBe("A");
            expect(capitalize("Z")).toBe("Z");
        });

        test("should return empty string for empty input", () => {
            expect(capitalize("")).toBe("");
        });
    });

    describe("stripHtml", () => {
        test("should remove standard HTML tags", () => {
            expect(stripHtml("<p>Hello <strong>World</strong>!</p>")).toBe("Hello World!");
            expect(stripHtml("<div>Click <a href='#'>here</a>.</div>")).toBe("Click here.");
        });

        test("should remove script blocks along with their contents", () => {
            expect(stripHtml("Hello <script>console.log('hi');</script>World")).toBe("Hello World");
            expect(stripHtml('<script type="text/javascript">alert(1);</script>')).toBe("");
        });

        test("should remove style blocks along with their contents", () => {
            expect(stripHtml("Text <style>body { color: red; }</style> More Text")).toBe(
                "Text  More Text"
            );
        });

        test("should remove noscript blocks along with their contents", () => {
            expect(stripHtml("Active <noscript><p>Please enable JS</p></noscript> Page")).toBe(
                "Active  Page"
            );
        });

        test("should decode common HTML entities", () => {
            expect(
                stripHtml("A &amp; B &lt; C &gt; D &quot; E &apos; F &#39; G &#x27; H &nbsp; I")
            ).toBe("A & B < C > D \" E ' F ' G ' H   I");
        });

        test("should handle empty or null-like strings safely", () => {
            expect(stripHtml("")).toBe("");
        });
    });

    describe("template", () => {
        test("should interpolate flat template placeholders", () => {
            const result = template("Hello {{name}}! Welcome to {{city}}.", {
                name: "Colin",
                city: "Berlin",
            });
            expect(result).toBe("Hello Colin! Welcome to Berlin.");
        });

        test("should trim whitespace around placeholder paths", () => {
            const result = template("Hello {{  name  }}!", { name: "Colin" });
            expect(result).toBe("Hello Colin!");
        });

        test("should resolve nested paths using dot-notation", () => {
            const data = {
                user: {
                    profile: {
                        name: "Colin",
                        address: {
                            city: "Berlin",
                        },
                    },
                },
            };
            const result = template(
                "{{user.profile.name}} lives in {{user.profile.address.city}}.",
                data
            );
            expect(result).toBe("Colin lives in Berlin.");
        });

        test("should replace undefined or null placeholders with empty strings", () => {
            const result = template("Hello {{user.name}}! My age is {{age}}.", {
                user: {}, // user.name resolves to undefined
                age: null,
            });
            expect(result).toBe("Hello ! My age is .");
        });

        test("should convert objects and arrays to string representation safely", () => {
            const data = {
                items: [1, 2, 3],
                info: { x: 1 },
            };
            const result = template("Items: {{items}}, Info: {{info}}", data);
            expect(result).toBe("Items: 1,2,3, Info: [object Object]");
        });
    });

    describe("slugify", () => {
        test("should lowercase, convert spaces to hyphens, and strip punctuation", () => {
            expect(slugify("Hello World!")).toBe("hello-world");
            expect(slugify("This is a Test...")).toBe("this-is-a-test");
        });

        test("should collapse multiple consecutive hyphens and trim boundaries", () => {
            expect(slugify("---hello    world---")).toBe("hello-world");
            expect(slugify("foo / bar / baz")).toBe("foo-bar-baz");
        });

        test("should map German umlauts and eszett explicitly", () => {
            expect(slugify("München und Köln")).toBe("muenchen-und-koeln");
            expect(slugify("Straße und Äpfel")).toBe("strasse-und-aepfel");
            expect(slugify("ÖVP und Über")).toBe("oevp-und-ueber");
        });

        test("should strip other accents and diacritics", () => {
            expect(slugify("café résumé")).toBe("cafe-resume");
            expect(slugify("crème brûlée")).toBe("creme-brulee");
            expect(slugify("naïve garçon")).toBe("naive-garcon");
        });

        test("should return empty string for empty input", () => {
            expect(slugify("")).toBe("");
        });
    });

    describe("Case Conversions", () => {
        const testCases = [
            {
                raw: "hello world",
                camel: "helloWorld",
                kebab: "hello-world",
                pascal: "HelloWorld",
                snake: "hello_world",
            },
            {
                raw: "foo-bar-baz",
                camel: "fooBarBaz",
                kebab: "foo-bar-baz",
                pascal: "FooBarBaz",
                snake: "foo_bar_baz",
            },
            {
                raw: "PascalCaseName",
                camel: "pascalCaseName",
                kebab: "pascal-case-name",
                pascal: "PascalCaseName",
                snake: "pascal_case_name",
            },
            {
                raw: "acronymHTMLReader",
                camel: "acronymHtmlReader",
                kebab: "acronym-html-reader",
                pascal: "AcronymHtmlReader",
                snake: "acronym_html_reader",
            },
            {
                raw: "XMLHttpRequest",
                camel: "xmlHttpRequest",
                kebab: "xml-http-request",
                pascal: "XmlHttpRequest",
                snake: "xml_http_request",
            },
            {
                raw: "hello_world_snake",
                camel: "helloWorldSnake",
                kebab: "hello-world-snake",
                pascal: "HelloWorldSnake",
                snake: "hello_world_snake",
            },
        ];

        test("camelCase", () => {
            for (const c of testCases) {
                expect(camelCase(c.raw)).toBe(c.camel);
            }
            expect(camelCase("")).toBe("");
        });

        test("kebabCase", () => {
            for (const c of testCases) {
                expect(kebabCase(c.raw)).toBe(c.kebab);
            }
            expect(kebabCase("")).toBe("");
        });

        test("pascalCase", () => {
            for (const c of testCases) {
                expect(pascalCase(c.raw)).toBe(c.pascal);
            }
            expect(pascalCase("")).toBe("");
        });

        test("snakeCase", () => {
            for (const c of testCases) {
                expect(snakeCase(c.raw)).toBe(c.snake);
            }
            expect(snakeCase("")).toBe("");
        });
    });
});
