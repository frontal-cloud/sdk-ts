# @frontal-cloud/functions

The Functions package provides a client for deploying and invoking serverless functions at the edge. It enables you to run code closer to your users for lower latency and improved performance.

## Installation

```bash
bun add @frontal-cloud/functions
```

## Usage

### Deploying a Function

```typescript
import { deployFunction } from "@frontal-cloud/functions";

const deployment = await deployFunction({
  name: "my-edge-function",
  entrypoint: "./src/index.ts",
  runtime: "nodejs-18",
  env: {
    API_KEY: "secret",
  },
});

console.log(`Function deployed at: ${deployment.url}`);
```

### Invoking a Function

```typescript
import { invoke } from "@frontal-cloud/functions";

const response = await invoke("my-edge-function", {
  payload: { name: "World" },
});

console.log(response); // "Hello, World!"
```

### Listing Functions

```typescript
import { listFunctions } from "@frontal-cloud/functions";

const functions = await listFunctions();
console.log(functions);
```

## API Reference

### `deployFunction(config)`

Deploys a new version of a serverless function.

- `config`: Object containing function name, entrypoint, runtime, etc.

### `invoke(name, options)`

Invokes a deployed function.

- `name`: The name of the function to invoke.
- `options`: Object containing payload and other invocation parameters.

### `listFunctions()`

Retrieves a list of all deployed functions.

### `configure(config)`

Sets the global configuration for the functions client.