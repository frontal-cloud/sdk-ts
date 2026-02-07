# Compute Integration Guide

Learn how to manage long-lived services and containerized workloads using `@frontal-cloud/compute`.

## Features

- **Service Lifecycle**: Full control over service creation and deletion.
- **Monitoring**: Integrated CPU and memory metrics.
- **Logs**: Real-time access to container logs.

## Service Configuration

When creating a service, you must define its resource requirements and networking configuration.

```typescript
const config = {
  name: 'api-gateway',
  image: 'frontal/gateway:latest',
  cpu: 1,
  memory: 1024,
  networking: {
    port: 8080,
    public: true
  }
};
```

## Managing Replicas

You can update the number of replicas for a service at any time to handle varying traffic levels.

```typescript
await compute.updateService(id, {
  scaling: {
    minReplicas: 2,
    maxReplicas: 10
  }
});
```

## Observability

Monitor your services using the `getMetrics` and `getLogs` methods.

```typescript
const metrics = await compute.getMetrics(id);
const logs = await compute.getLogs(id, { limit: 100 });
```
