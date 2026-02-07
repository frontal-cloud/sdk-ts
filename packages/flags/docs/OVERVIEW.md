# @frontal-cloud/flags

The Flags package provides a scalable feature flag management solution for Frontal Cloud applications. It enables you to toggle features on and off, perform A/B testing, and manage remote configuration in real-time.

## Installation

```bash
bun add @frontal-cloud/flags
```

## Usage

### retrieving a Flag

```typescript
import { getFlag } from "@frontal-cloud/flags";

const isNewFeatureEnabled = await getFlag("new-feature", {
  userId: "user-123",
  tier: "premium",
});

if (isNewFeatureEnabled) {
  // Show new feature
} else {
  // Show legacy feature
}
```

### Listing All Flags

```typescript
import { listFlags } from "@frontal-cloud/flags";

const flags = await listFlags();
console.log(flags);
```

### Configuration

You can configure the flags client globally:

```typescript
import { configure } from "@frontal-cloud/flags";

configure({
  baseUrl: "https://api.frontal.cloud/flags",
  apiKey: process.env.FRONTAL_API_KEY,
});
```

## API Reference

### `getFlag(key, context)`

Evaluates a specific feature flag for the given context.

- `key`: The unique identifier of the flag.
- `context`: (Optional) Object containing user or environment data for targeted evaluation.

### `listFlags()`

Retrieves all available feature flags and their configurations.

### `configure(config)`

Sets the global configuration for the flags client.
