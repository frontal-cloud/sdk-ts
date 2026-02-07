# @frontal-cloud/compute

Manage long-lived workloads (Services) on Frontal Cloud with ease. This package provides a robust, type-safe interface for deploying, scaling, and monitoring containerized applications.

## Installation

```bash
bun add @frontal-cloud/compute
```

## Features

- **Service Lifecycle**: Create, update, restart, and delete services.
- **Monitoring**: Real-time metrics for CPU and memory usage.
- **Observability**: Access stdout/stderr logs from your running services.
- **Auto-Scaling**: Configure scaling policies directly via the SDK.
- **Health Checks**: Define custom health check paths and intervals.

## Usage

### Creating a Service

```typescript
import { createService } from '@frontal-cloud/compute';

const service = await createService({
  name: 'my-api',
  image: 'nginx:latest',
  cpu: 0.5,
  memory: 512,
  networking: {
    port: 80,
    public: true,
  },
});

console.log(`Service created: ${service.id}`);
```

### Monitoring Metrics

```typescript
import { Compute } from '@frontal-cloud/compute';

const compute = new Compute();
const metrics = await compute.getMetrics('my-service-id');

console.log(`CPU Usage: ${metrics.cpuUsage}%`);
console.log(`Memory Usage: ${metrics.memoryUsage}MB`);
```

### Accessing Logs

```typescript
const logs = await compute.getLogs('my-service-id', { limit: 50 });
logs.forEach(log => {
  console.log(`[${log.timestamp}] ${log.stream}: ${log.message}`);
});
```

### Restarting a Service

```typescript
await compute.restartService('my-service-id');
```

## API Reference

The SDK exposes both a functional API (for quick tasks) and a `Compute` class (for more complex integrations). All inputs are validated at runtime using Zod.

## License

MIT