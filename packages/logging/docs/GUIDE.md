# Logging Integration Guide

Monitor your application in real-time with `@frontal-cloud/logging`.

## Core Concepts

- **Levels**: debug, info, warn, error, fatal.
- **Local Dev**: Uses Pino for clean console output.
- **Production**: Routes logs to Frontal Observatory.

## Structured Logging

Always provide metadata to make your logs more searchable.

```typescript
logger.info('Order processed', {
  orderId: 'abc-123',
  amount: 49.99,
  currency: 'USD'
});
```

## Historical Queries

Retrieve logs based on timeframe and severity.

```typescript
const logs = await logger.query({
  levels: ['error', 'fatal'],
  startTime: '2024-02-01T12:00:00Z'
});
```
