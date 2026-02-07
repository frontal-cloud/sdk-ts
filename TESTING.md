# Testing Guide

We use [Bun's native test runner](https://bun.sh/docs/cli/test) for our unit and integration tests.

## Running Tests

### Run all tests

```bash
bun run test
```

This will use Turborepo to run tests across all packages in parallel.

### Run tests for a specific package

```bash
bun turbo run test --filter=@frontal-cloud/ai
```

### Watch mode

```bash
bun run test:watch
```

## Writing Tests

Tests should be placed in `tests/` directories or alongside the source code with a `.test.ts` extension.

### Example Test

```typescript
import { expect, test } from "bun:test";

test("math works", () => {
  expect(2 + 2).toBe(4);
});
```

## Best Practices

- **Mocking**: Use `bun:test`'s mocking capabilities for external dependencies.
- **Coverage**: Aim for high test coverage on core logic.
- **Speed**: Keep tests fast. Large integration tests should be separated from unit tests if they significantly slow down the suite.
