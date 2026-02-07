# @frontal-cloud/notifications

The Notifications package provides a unified interface for sending multi-channel notifications (Email, SMS, Push) from your Frontal Cloud applications. It simplifies the process of managing templates, recipients, and delivery status.

## Installation

```bash
bun add @frontal-cloud/notifications
```

## Usage

### Sending an Email

```typescript
import { Notifications } from "@frontal-cloud/notifications";

const notifications = new Notifications({
  apiKey: process.env.FRONTAL_API_KEY,
});

await notifications.send({
  channel: "email",
  to: "user@example.com",
  subject: "Welcome to Frontal!",
  templateId: "welcome-email",
  data: {
    name: "Gabriel",
  },
});
```

### Sending an SMS

```typescript
await notifications.send({
  channel: "sms",
  to: "+15550102030",
  text: "Your verification code is 123456",
});
```

### Checking Delivery Status

```typescript
const status = await notifications.getStatus("notification-id-123");
console.log(status); // "delivered", "failed", "pending"
```

## API Reference

### `Notifications(config)`

Creates a new Notifications client.

### `notifications.send(options)`

Sends a notification via the specified channel.

- `options`: Object containing channel, recipient, content/template, etc.

### `notifications.getStatus(id)`

Retrieves the delivery status of a notification.