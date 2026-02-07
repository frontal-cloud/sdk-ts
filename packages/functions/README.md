# @frontal-cloud/functions

Deploy and manage high-performance serverless functions at the edge. Frontal Functions are designed for event-driven logic, microservices, and rapid API development.

## Installation

```bash
bun add @frontal-cloud/functions
```

## Features

- **Global Distribution**: Functions are deployed to edge nodes globally for low-latency execution.
- **Multiple Triggers**: Supports HTTP endpoints, Cron schedules, and Queue consumers.
- **Runtimes**: First-class support for Node.js (18/20), Python 3.9, and Go 1.x.
- **Observability**: Built-in statistics for invocation counts, error rates, and duration.
- **Elastic Scaling**: Automatic scaling based on request volume.

## Usage

### Deploying a Function

```typescript
import { deployFunction } from '@frontal-cloud/functions';

const fn = await deployFunction({
  name: 'process-image',
  runtime: 'nodejs20',
  handler: 'index.handler',
  memory: 512,
  timeout: 30,
  trigger: {
    type: 'http',
  },
});

console.log(`Function deployed at: ${fn.url}`);
```

### Synchronous Invocation

```typescript
import { invoke } from '@frontal-cloud/functions';

const response = await invoke('process-image', {
  payload: { imageId: '123' },
});
```

### Monitoring Stats

```typescript
import { Functions } from '@frontal-cloud/functions';

const client = new Functions();
const stats = await client.getInvocationStats('process-image');

console.log(`Total Invocations: ${stats.totalInvocations}`);
console.log(`Average Duration: ${stats.averageDuration}ms`);
```

### Updating a Schedule (Cron)

```typescript
await client.updateTriggers('my-cron-job', {
  type: 'cron',
  schedule: '0 * * * *', // Hourly
});
```

## Configuration

Functions can be configured via environment variables (`FRONTAL_API_KEY`, `FRONTAL_API_URL`) or by passing a config object to the `Functions` constructor.

## License

MIT