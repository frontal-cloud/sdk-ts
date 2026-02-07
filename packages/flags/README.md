# @frontal-cloud/flags

A powerful, type-safe feature flag SDK for Frontal Cloud. Manage feature releases, A/B tests, and remote configuration with minimal latency.

## Installation

```bash
bun add @frontal-cloud/flags
```

## Features

- **Real-time Evaluation**: Low-latency flag evaluation with local caching.
- **Contextual Targeting**: Evaluate flags based on user ID, email, or any custom context.
- **Type-Safe**: Strict Zod validation for flag results and context.
- **Graceful Fallbacks**: Always returns a default value if evaluation fails or is offline.

## Usage

### Basic Evaluation

```typescript
import { getFlag } from '@frontal-cloud/flags';

const result = await getFlag('new-dashboard-ui', false);

if (result.value) {
  renderNewDashboard();
} else {
  renderOldDashboard();
}
```

### Contextual Evaluation

```typescript
const result = await getFlag('beta-feature', false, {
  userId: 'user-123',
  groups: ['beta-testers'],
});
```

### List All Flags

```typescript
import { listFlags } from '@frontal-cloud/flags';

const flags = await listFlags({ environment: 'production' });
console.log(flags);
```

## Configuration

```typescript
import { configure } from '@frontal-cloud/flags';

configure({
  apiKey: 'your-api-key',
  defaultContext: { appVersion: '1.2.3' }
});
```

## License

MIT
