# @frontal-cloud/storage

A block-storage compatible SDK for Frontal Cloud. Provides a simple, type-safe API for managing files, assets, and large data objects with high reliability and global distribution.

## Installation

```bash
bun add @frontal-cloud/storage
```

## Features

- **Blob/S3 Compatible**: Familiar API patterns for effortless integration.
- **Strict Validation**: Zod-backed schemas for all object metadata and options.
- **Signed URLs**: Temporarily expose private objects with secure, time-limited URLs.
- **Streaming**: Native support for uploading and downloading objects as streams.
- **Advanced Management**: Copy and move objects within or between buckets.
- **Metadata Support**: Simple interface for getting and setting custom object metadata.

## Usage

### Simple Upload

```typescript
import { upload } from '@frontal-cloud/storage';

await upload('my-bucket', 'images/logo.png', myFileBlob, 'image/png');
```

### Downloading as Stream

```typescript
import { Storage } from '@frontal-cloud/storage';

const storage = new Storage();
const stream = await storage.downloadStream('my-bucket', 'heavy-file.zip');

// Pipe to a file or process
for await (const chunk of stream) {
  // ...
}
```

### signed URLs

```typescript
import { getSignedUrl } from '@frontal-cloud/storage';

const url = await getSignedUrl('my-bucket', {
  key: 'private-video.mp4',
  expiresIn: 3600, // 1 hour
  operation: 'read',
});
```

### Move/Rename Object

```typescript
await storage.moveObject(
  'old-bucket', 'old-name.txt',
  'new-bucket', 'new-name.txt'
);
```

## API Reference

The package provides a `Storage` class for instance-based usage and exported functional wrappers for quick access. All inputs are validated at runtime.

## License

MIT