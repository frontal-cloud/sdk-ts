# Notifications Integration Guide

Reach your users via Email, SMS, and Push using `@frontal-cloud/notifications`.

## Sending Notifications

A single method to reach multiple channels.

```typescript
import { send } from '@frontal-cloud/notifications';

await send({
  recipient: {
    email: 'user@example.com',
    phone: '+15551234567'
  },
  channels: ['email', 'sms'],
  payload: {
    title: 'Security Alert',
    body: 'A new login was detected from a new device.'
  }
});
```

## Batching

Send multiple messages in one request to optimize network usage.

```typescript
const results = await client.sendBatch([...messages]);
```

## Status Tracking

Monitor delivery success or failures.

```typescript
const status = await client.getStatus(id);
status.channelStatuses.forEach(cs => {
  console.log(`${cs.channel}: ${cs.status}`);
});
```
