# Storage Integration Guide

Seamlessly manage files and objects using `@frontal-cloud/storage`.

## Uploading Data

Supports Blobs, Buffers, Strings, and Streams.

```typescript
import { upload } from '@frontal-cloud/storage';

await upload('bucket-name', 'path/to/file.txt', 'File content');
```

## Signed URLs

Generate temporary URLs for secure uploads or downloads.

```typescript
import { getSignedUrl } from '@frontal-cloud/storage';

const url = await getSignedUrl('bucket', {
  key: 'private.png',
  operation: 'read',
  expiresIn: 600
});
```

## Object Management

Easily move or copy objects between locations.

```typescript
await storage.copyObject(
  'source-bucket', 'source.jpg',
  'dest-bucket', 'backup.jpg'
);
```
