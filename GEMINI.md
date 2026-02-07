# Gemini Project Context

This file provides context for the Gemini AI agent to understand the project structure, conventions, and key files.

## Project Overview

This is a modular TypeScript monorepo for building a powerful SDK for distributed systems. The SDK includes packages for AI, Compute, Functions, and Storage.

The project uses a modern toolchain:
- **Bun**: As the package manager and JavaScript runtime.
- **Turborepo**: For high-performance build system orchestration in the monorepo.
- **TypeScript**: For static typing.
- **Biome**: For code formatting and linting, configured in `biome.jsonc`.
- **Changesets**: For managing versioning and publishing of packages.

## Packages

The monorepo contains the following packages under the `packages/` directory:
- `@frontal-cloud/ai`: AI integration and utilities.
- `@frontal-cloud/compute`: Distributed compute capabilities.
- `@frontal-cloud/functions`: Serverless functions orchestration.
- `@frontal-cloud/storage`: Scalable storage interactions.
- `@frontal-cloud/notifications`: Scalable notifications interactions.
- `@frontal-cloud/logging`: Scalable logger interactions.

## Building and Running

### Key Commands

- `bun install`: Install all dependencies for the monorepo.
- `bun run setup`: A script for initial setup, likely building all packages.
- `bun run build`: Build all packages using Turborepo.
- `bun run dev`: Run all packages in development mode (with watch).
- `bun run test`: Run tests across all packages.
- `bun run lint:ts`: Run the Biome linter across the codebase.
- `bun run format`: Format all code using Biome.
- `bun run changeset`: Create a new changeset for versioning.
- `bun run release`: Build packages and publish new versions based on changesets.

## Development Conventions

### Commit Messages

- The project follows the **Conventional Commits** specification.
- Commit messages are linted using `commitlint` with the configuration in `commitlint.config.js`.
- **Format**: `<type>(<scope>): <subject>`
- **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Allowed Scopes**: `ai`, `compute`, `functions`, `storage`, `repo`, `deps`, `ci`, `release`, `docs`, `scripts`, `misc`.

### Code Style

- The project uses **Biome** for code formatting and linting.
- The configuration is located in `biome.jsonc`.
- Key formatting rules include an 80-character line width, space indentation, and LF line endings.

### CI/CD

- The CI pipeline is defined in `.github/workflows/ci.yml` and other files in that directory.
- It runs on pull requests and uses reusable workflows for different CI jobs.
- The pipeline includes steps for building, testing, and checking code quality.

### Versioning and Releasing

- The project uses **Changesets** to manage releases.
- To create a release, run `bun run changeset`, which will prompt you to select the packages that have changed and the type of version bump.
- Merging changesets to the `main` branch triggers a release process.
