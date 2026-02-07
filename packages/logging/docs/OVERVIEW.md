# @frontal-cloud/logging

The Logging package provides a high-performance structured logging solution for Frontal applications. It combines the ease of local development logging with the power of remote observability and log aggregation.

## Installation

```bash
bun add @frontal-cloud/logging
```

## Usage

### Basic Logging

```typescript
import { Logger } from "@frontal-cloud/logging";

const logger = new Logger({
  service: "my-service",
  level: "info",
});

logger.info("Service started", { port: 3000 });
logger.error("Database connection failed", { error: err });
```

### Log Levels

The logger supports standard log levels:
- `debug`
- `info`
- `warn`
- `error`
- `fatal`

### remote Logging

By default, logs are printed to the console. To enable remote logging to Frontal Cloud, configure the transport:

```typescript
const logger = new Logger({
  service: "payment-service",
  transports: ["console", "http"], // Send to console and remote HTTP endpoint
  apiKey: process.env.FRONTAL_API_KEY,
});
```

## API Reference

### `Logger(config)`

Creates a new Logger instance.

- `config`: Configuration object for service name, log level, and transports.

### `logger.info(message, metadata)`

Logs an informational message.

### `logger.error(message, error)`

Logs an error message.

### `logger.warn(message, metadata)`

Logs a warning message.

### `logger.debug(message, metadata)`

Logs a debug message.