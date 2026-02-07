# @frontal-cloud/compute

The Compute package allows you to manage long-lived workloads, such as virtual machines and containers, on Frontal Cloud. It provides a programmatic interface to provision, configure, and monitor your compute resources.

## Installation

```bash
bun add @frontal-cloud/compute
```

## Usage

### Listing Services

```typescript
import { listServices } from "@frontal-cloud/compute";

const services = await listServices();

services.forEach((service) => {
  console.log(`${service.name} (${service.status})`);
});
```

### Creating a Service

```typescript
import { createService } from "@frontal-cloud/compute";

const service = await createService({
  name: "my-app",
  image: "nginx:latest",
  replicas: 2,
  resources: {
    cpu: "100m",
    memory: "128Mi",
  },
});

console.log(`Service created: ${service.id}`);
```

### Restarting a Service

```typescript
import { restartService } from "@frontal-cloud/compute";

await restartService("my-app-id");
console.log("Service restarted successfully.");
```

## API Reference

### `listServices()`

Retrieves a list of all active compute services.

### `createService(config)`

Provisions a new compute service with the specified configuration.

- `config`: Object defining the service properties (name, image, resources, etc.).

### `getService(id)`

Retrieves details for a specific service.

### `restartService(id)`

Restarts the specified service.