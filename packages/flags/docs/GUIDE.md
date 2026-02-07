# Flags Integration Guide

Lean how to use `@frontal-cloud/flags` to manage feature toggles and remote configuration in your application.

## Table of Contents

1. [Configuration](#configuration)
2. [Evaluating Flags](#evaluating-flags)
3. [Context Management](#context-management)
4. [Error Handling](#error-handling)

## Configuration

The Flags client can be used as a singleton via the functional API or as an instance.

```typescript
import { Flags } from '@frontal-cloud/flags';

const flags = new Flags({
  apiKey: 'your-key',
  defaultContext: { tenant: 'acme' }
});
```

## Evaluating Flags

Use `getFlag` for single evaluations and `listFlags` for bulk retrievals.

### Boolean Flags
```typescript
const isEnabled = await flags.getFlag('my-feature', false);
```

### String/Number Flags
```typescript
const theme = await flags.getFlag('app-theme', 'light');
const maxUsers = await flags.getFlag('limit-users', 10);
```

## Context Management

Context is crucial for targeting specific users or groups.

```typescript
const result = await flags.getFlag('premium-feature', false, {
  subscription: 'gold',
  tier: 3
});
```

## Error Handling

By design, the Flags client never throws during evaluation. Instead, it returns the provided `defaultValue` and includes the reason in the result object.

```typescript
const result = await flags.getFlag('risky-flag', true);
if (result.reason) {
  console.warn(`Evaluation failed: ${result.reason}`);
}
```
