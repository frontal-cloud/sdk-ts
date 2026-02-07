# Functions Integration Guide

Frontal Functions allow you to run serverless code at the edge with minimal latency and high scalability.

## Deployment

Deploy your function code by specifying the runtime, handler, and resource limits.

```typescript
import { deployFunction } from '@frontal-cloud/functions';

const fn = await deployFunction({
  name: 'my-function',
  runtime: 'nodejs20',
  handler: 'index.handler',
  memory: 256,
  timeout: 10
});
```

## Invocation

Functions can be invoked synchronously via the SDK or triggered via HTTP/Cron/Queue.

```typescript
import { invoke } from '@frontal-cloud/functions';

const result = await invoke('my-function', {
  payload: { data: 'hello' }
});
```

## Triggers

Manage function triggers without redeploying your code.

```typescript
await client.updateTriggers('my-function', {
  type: 'cron',
  schedule: '*/5 * * * *' // Every 5 minutes
});
```
