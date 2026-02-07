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
