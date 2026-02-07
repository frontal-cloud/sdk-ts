# Local Development Guide

This guide covers everything you need to know to get started with development on this project.

## Prerequisites

- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)

## Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/example/sdk-ts.git
   cd sdk-ts
   ```

2. **Run the setup script**:
   ```bash
   bun run setup
   ```
   This script installs dependencies and builds all packages.

## Daily Workflow

### Running Development Servers

To start the development environment for all packages:
```bash
bun run dev
```

### Making Changes

1. Create a new branch: `git checkout -b feature/my-new-feature`.
2. Implement your changes.
3. Run tests: `bun run test`.
4. Ensure linting passes: `bun run lint`.

### Committing Changes

We use Husky and Commitlint to enforce Conventional Commits.

```bash
git commit -m "feat(ai): adds new inference method"
```

If your change requires a version bump, add a changeset before committing:
```bash
bun run changeset
```

## Troubleshooting

### Cleaning the cache

If you encounter weird build issues, you can clean the project:
```bash
bun run clean
```

### Reinstalling dependencies

```bash
bun install
```
