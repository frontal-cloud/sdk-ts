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

### Installation

```bash
bun install
```

### Development

```bash
# Initial setup
bun run setup

# Build all packages
bun run build

# Run tests
bun run test

# Lint and format
bun run lint:ts
bun run format
```

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
