# random.ts

A collection of high-performance random value generator helper functions, incorporating cryptographic security APIs with robust fallbacks.

## API Reference

### Functions

#### `uuid`

Generates an RFC4122 v4 compliant UUID string.

```typescript
function uuid(): string;
```

#### `randomInt`

Returns a random integer between `min` and `max` (both inclusive).

```typescript
function randomInt(min: number, max: number): number;
```

#### `randomFloat`

Returns a random float between `min` (inclusive) and `max` (exclusive).

```typescript
function randomFloat(min: number, max: number): number;
```

#### `randomItem`

Returns a random item from the provided array, or `undefined` if the array is empty.

```typescript
function randomItem<T>(arr: T[]): T | undefined;
```

#### `shuffle`

Shuffles an array using the Fisher-Yates algorithm. Returns a new array copy.

```typescript
function shuffle<T>(arr: T[]): T[];
```

#### `randomString`

Generates a random alphanumeric string of a specified length.

```typescript
function randomString(length: number, chars?: string): string;
```

- **Defaults:** `chars` defaults to `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.

#### `randomBool`

Returns a random boolean based on a given true probability.

```typescript
function randomBool(probability?: number): boolean;
```

- **Defaults:** `probability` defaults to `0.5`.

#### `weightedRandom`

Selects an item from an array based on relative weights.

```typescript
function weightedRandom<T>(items: T[], weights: number[]): T | undefined;
```

---

## Important Technical Details

- **Cryptographic Security:** Both `uuid` and `randomString` automatically employ browser/runtime secure APIs (`crypto.randomUUID` or `crypto.getRandomValues`) if available.
- **Fisher-Yates Shuffle:** The `shuffle` utility creates a shallow clone (`[...arr]`) before shuffling, ensuring that the source array is never mutated.
- **Weighted Random Logic:** `weightedRandom` checks that arrays are non-empty and matching in size. It sums the weights and maps a random multiplier to select the index, safely handling non-integer weights.
