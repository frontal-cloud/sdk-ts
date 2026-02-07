# @frontal-cloud/notifications

A unified, multi-channel notification SDK for Frontal Cloud. Send Emails, SMS, and Push notifications with a single, type-safe API and track their delivery status in real-time.

## Installation

```bash
bun add @frontal-cloud/notifications
```

## Features

- **Core Channels**: Support for high-reliability Email, SMS, and Push delivery.
- **Batch Operations**: Send hundreds of notifications in a single API call for maximum efficiency.
- **Status Tracking**: Real-time delivery tracking for every channel and message.
- **Zod Validation**: Strict validation for recipients, payloads, and channel options.
- **Template Support**: Seamless integration with Frontal Notification templates.

## Usage

### Sending an Email

```typescript
import { send } from '@frontal-cloud/notifications';

await send({
  recipient: { email: 'user@example.com' },
  channels: ['email'],
  payload: {
    title: 'Welcome!',
    body: 'Thanks for joining Frontal.',
  },
});
```

### Sending SMS and Push Simultaneously

```typescript
await send({
  recipient: {
    phone: '+1234567890',
    pushToken: 'expo-token-abc',
  },
  channels: ['sms', 'push'],
  payload: {
    body: 'Your package has arrived!',
  },
});
```

### Batch Sending

```typescript
import { Notifications } from '@frontal-cloud/notifications';

const client = new Notifications();
const statuses = await client.sendBatch([
  {
    recipient: { email: 'user1@example.com' },
    channels: ['email'],
    payload: { body: 'Message 1' },
  },
  {
    recipient: { email: 'user2@example.com' },
    channels: ['email'],
    payload: { body: 'Message 2' },
  },
]);
```

### Checking Delivery Status

```typescript
const status = await client.getStatus('notification-id-123');
console.log(status.channelStatuses);
```

## Configuration

The SDK can be configured with an API key and base URL. It follows standard Frontal Cloud authentication patterns.

## License

MIT