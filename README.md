<picture>
  <source srcset="./assets/banner-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="./assets/banner.png" media="(prefers-color-scheme: light)">
  <img src="./assets/banner-dark.png" alt="Frontal Banner">
</picture>

# Frontal SDK

A powerful, modular SDK for building high-performance applications with AI, Compute, Functions, Flags, Logging, Notifications, and Storage capabilities.

## Overview

This repository is a monorepo containing various packages designed to simplify the development of distributed systems. It leverages modern tooling like Bun, Turborepo, and Changesets for a seamless developer experience.

## Features

- **Modular Architecture**: Use only the packages you need.
- **Fast Development**: Powered by Bun and Turborepo for ultra-fast builds and tests.
- **Type-Safe**: Written entirely in TypeScript with strict type checking.
- **Automated Versioning**: Streamlined release process with Changesets.

## Packages

| Package | Description | Version |
| :--- | :--- | :--- |
| [`@frontal-cloud/ai`](./packages/ai) | AI integration and utilities. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/ai) |
| [`@frontal-cloud/compute`](./packages/compute) | Distributed compute capabilities. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/compute) |
| [`@frontal-cloud/functions`](./packages/functions) | Serverless functions orchestration. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/functions) |
| [`@frontal-cloud/flags`](./packages/flags) | Feature flags and configuration. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/flags) |
| [`@frontal-cloud/logging`](./packages/logging) | Structured logging utilities. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/logging) |
| [`@frontal-cloud/notifications`](./packages/notifications) | Notifications delivery and management. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/notifications) |
| [`@frontal-cloud/storage`](./packages/storage) | Scalable storage interactions. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/storage) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.3.8 or later)
- [Node.js](https://nodejs.org) (v18 or later) - for compatibility
- [Git](https://git-scm.com) - for version control

### Development Setup

#### Option 1: Standard Setup

```bash
# Clone the repository
git clone https://github.com/frontal-cloud/sdk-ts.git
cd sdk-ts

# Install dependencies
bun install

# Initial setup
bun run setup
```

#### Option 2: Nix Development Environment

```bash
# Enter Nix development shell
nix develop

# Or use flakes directly
nix shell
```

### Development Commands

```bash
# Build all packages
bun run build

# Run tests (with Vitest)
bun run test
bun run test:watch
bun run test:coverage

# Lint and format
bun run lint
bun run lint:fix
bun run format

# Type checking
bun run type-check

# Clean build artifacts
bun run clean
```

### Environment Configuration

Copy `.env.example` to `.env` and configure your environment:

```bash
cp .env.example .env
```

Key environment variables:
- `FRONTAL_CLOUD_API_KEY` - Your API key
- `NODE_ENV` - Environment (development/test/production)
- `DEBUG` - Enable debug logging (optional)

## Documentation

Detailed documentation for each package can be found in their respective directories:
- [AI](./packages/ai/README.md)
- [Compute](./packages/compute/README.md)
- [Functions](./packages/functions/README.md)
- [Flags](./packages/flags/README.md)
- [Logging](./packages/logging/README.md)
- [Notifications](./packages/notifications/README.md)
- [Storage](./packages/storage/README.md)

General project documentation is available in the [`docs`](./docs) folder.

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.
