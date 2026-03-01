# Contributing to SDK Monorepo

Thank you for your interest in contributing! We want to make contributing to this project as easy and transparent as possible.

## Development Process

1. **Fork the repo** and create your branch from the default branch.
2. **Install dependencies**: `bun install`.
3. **Run setup**: `bun run setup` to build packages.
4. **Make your changes**.
5. **Ensure tests pass**: `bun run test`.
6. **Lint and format**: `bun run lint:ts` and `bun run format`.
7. **Add a changeset**: `bun run changeset` if your changes should trigger a version bump.
8. **Submit a Pull Request**.

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Format: `<type>(<scope>): <subject>`

Example: `feat(ai): adds support for new model`

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files

Scopes: `ai`, `compute`, `functions`, `storage`, `flags`, `logging`, `notifications`, `repo`, `scripts`, `docs`.

## Testing Guidelines

We use Vitest for testing across all packages. Here's how to write and run tests effectively.

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run tests for a specific package
cd packages/storage
bun run test
```

### Test Structure

Tests should be placed in:
- `src/**/*.test.ts` - Unit tests alongside source files
- `src/**/*.spec.ts` - Specification tests
- `tests/**/*.test.ts` - Integration tests

### Writing Tests

#### Basic Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { StorageClient } from '../src/client';

describe('StorageClient', () => {
  let client: StorageClient;

  beforeEach(() => {
    client = new StorageClient({
      apiKey: 'test-key',
      baseUrl: 'https://api.test.com'
    });
  });

  it('should initialize with correct config', () => {
    expect(client.config.apiKey).toBe('test-key');
    expect(client.config.baseUrl).toBe('https://api.test.com');
  });

  it('should upload file successfully', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const result = await client.upload(mockFile);
    
    expect(result.success).toBe(true);
    expect(result.url).toMatch(/^https:\/\//);
  });
});
```

#### Mocking External Dependencies

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock fetch globally
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

import fetch from 'node-fetch';

describe('API Client', () => {
  it('should make correct API call', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    });

    // Test your code...
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api endpoint'),
      expect.any(Object)
    );
  });
});
```

### Test Coverage

We maintain 80% coverage thresholds across all packages. To check coverage:

```bash
bun run test:coverage
```

Coverage reports are generated in:
- `coverage/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - Machine-readable report
- `coverage/packages/*/` - Per-package coverage

### Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
3. **Mock External Services**: Always mock external API calls and network requests
4. **Test Edge Cases**: Test error conditions and boundary values
5. **Keep Tests Focused**: Each test should verify one specific behavior
6. **Use Test Helpers**: Create reusable test utilities for common operations

### Environment Variables for Testing

The test setup automatically configures:
- `NODE_ENV=test`
- `CI=true`

You can override these in your local `.env.test` file if needed.

## Code Style

We use Biome for code formatting and linting. Please ensure your IDE is configured to use Biome or run the following commands before committing:

```bash
bun run format
bun run lint:ts
```

## Adding a Changeset

If your change is a feature or a bug fix that should be released, you must add a changeset:

```bash
bun run changeset
```

Follow the prompts to select the packages and the type of version bump (patch, minor, or major).

## Questions?

If you have any questions, feel free to open an issue!
