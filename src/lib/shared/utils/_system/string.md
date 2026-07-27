# string.ts

A collection of type-safe, optimized utility functions for advanced string manipulation, parsing, templating, and case conversions.

## API Reference

### Functions

#### `capitalize`

Capitalizes the first character of a string.

```typescript
function capitalize(str: string): string;
```

#### `stripHtml`

Strips HTML tags from a string. Recursively removes `<script>`, `<style>`, and `<noscript>` blocks (along with their internal contents) and decodes standard HTML entities.

```typescript
function stripHtml(str: string): string;
```

#### `template`

Interpolates template placeholders (e.g. `{{ user.name }}` or `{{value}}`) using a data object, resolving nested dot-notation paths safely.

```typescript
function template(str: string, data: Record<string, unknown>): string;
```

#### `slugify`

Converts a string into a URL-friendly slug, explicitly mapping German umlauts (`ä/ö/ü/ß` ➡️ `ae/oe/ue/ss`) and stripping other accents and diacritics.

```typescript
function slugify(str: string): string;
```

#### Case Conversion Functions

Converts input strings into various casing styles. Handles camelCase boundaries, acronyms, and non-alphanumeric splitters.

```typescript
function camelCase(str: string): string;
function kebabCase(str: string): string;
function pascalCase(str: string): string;
function snakeCase(str: string): string;
```

---

## Important Technical Details

- **Safe HTML Entity Decoding:** `stripHtml` decodes `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`, `&#39;`, `&#x27;`, and `&nbsp;` automatically using regular expression replacements.
- **German-Aware Slugification:** German accents are converted to their standard transcription equivalents (e.g. `München` ➡️ `muenchen`) rather than losing the letters entirely during normal diacritic normalization (which would make it `munchen`).
- **Acronym Word Splitting:** Case conversion functions split words at acronym boundaries (e.g. `HTTPRequest` splits into `HTTP` and `Request`), ensuring clean casing outputs.
