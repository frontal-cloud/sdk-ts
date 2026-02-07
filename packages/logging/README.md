# @frontal-cloud/logging

High-performance, structured logging for Frontal applications. This package provides a unified observability interface that logs highly readable output in development and rich, searchable JSON in production.

## Installation

```bash
bun add @frontal-cloud/logging
```

## Features

- **Pino Powered**: Uses `pino` for ultra-fast, non-blocking local logging.
- **Unified Gateway**: Automatically routes logs to Frontal's centralized observability platform.
- **Structured Metadata**: Enforce consistent metadata schemas with Zod.
- **Query Support**: Retrieve historical logs directly via the SDK.
- **Environment Aware**: Automatically captures service, version, and environment context.

## Usage

### Basic Logging

```typescript
import { Logger } from '@frontal-cloud/logging';

const logger = new Logger({
  defaultMetadata: { service: 'auth-api' }
});

logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { quota: '90%' });
logger.error('Database connection failed', { error: 'ECONNREFUSED' });
```

### Local Only Logging

If you want to disable remote ingestion during specific development phases:

```typescript
const logger = new Logger({ localOnly: true });
```

### Querying Logs

```typescript
const logs = await logger.query({
  levels: ['error', 'fatal'],
  startTime: '2024-01-01T00:00:00Z',
  limit: 10
});
```

## Configuration

The logger respects `NODE_ENV` and `LOG_LEVEL` environment variables. It automatically disables remote ingestion if `FRONTAL_API_KEY` is not present.

## License

MIT