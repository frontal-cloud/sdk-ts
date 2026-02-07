<picture>
  <source srcset="./assets/banner-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="./assets/banner.png" media="(prefers-color-scheme: light)">
  <img src="./assets/banner-dark.png" alt="Frontal Banner">
</picture>

# Frontal SDK

A powerful, modular SDK for building high-performance applications with AI, Compute, Functions, and Storage capabilities.

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
| [`@frontal-cloud/storage`](./packages/storage) | Scalable storage interactions. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/storage) |
| [`@frontal-cloud/notifications`](./packages/notifications) | Scalable notifications interactions. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/notifications) |
| [`@frontal-cloud/logging`](./packages/logging) | Scalable logger interactions. | ![npm](https://img.shields.io/npm/v/@frontal-cloud/logging) |

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

# Run dev mode
bun run dev

# Run tests
bun run test

# Lint code
bun run lint
```

## Documentation

Detailed documentation for each package can be found in their respective directories:
- [AI Docs](./packages/ai/README.md)
- [Compute Docs](./packages/compute/README.md)
- [Functions Docs](./packages/functions/README.md)
- [Storage Docs](./packages/storage/README.md)

General project documentation is available in the [`docs`](./docs) folder.

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.
