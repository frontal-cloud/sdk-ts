# Architecture Overview

This SDK is designed as a modular monorepo, allowing for clear separation of concerns and independent versioning of components.

## Core Components

### 1. AI (`@frontal-cloud/ai`)
Handles interactions with AI models, including inference, prompt management, and streaming responses.

### 2. Compute (`@frontal-cloud/compute`)
Provides an abstraction layer for distributed compute tasks, allowing runners to execute code in various environments.

### 3. Functions (`@frontal-cloud/functions`)
A serverless functions orchestration layer, enabling developers to deploy and trigger functions easily.

### 4. Storage (`@frontal-cloud/storage`)
An interface for interacting with various storage providers (S3, local, etc.) in a unified way.

## Build System

We use **Turborepo** to manage our build pipeline. It provides:
- **Remote Caching**: Speeds up CI/CD pipeline.
- **Task Orchestration**: Runs tasks (build, lint, test) in the correct order based on dependency graphs.
- **Parallel Execution**: Maximizes CPU usage during builds.

## Dependency Management

**Bun** is our primary package manager and runtime. It offers:
- Fast dependency resolution and installation.
- Native TypeScript support.
- A built-in high-performance test runner.

## Release Strategy

We use **Changesets** to manage the versioning and publishing of our packages. This ensures that only changed packages are versioned and published, with automated changelog generation.
