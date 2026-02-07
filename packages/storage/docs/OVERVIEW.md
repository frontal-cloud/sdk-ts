# @frontal-cloud/storage

The Storage package offers a simple and scalable way to manage objects and files in Frontal Cloud storage buckets. It supports standard Blob and S3-compatible operations.

## Installation

```bash
bun add @frontal-cloud/storage
```

## Usage

### Uploading a File

```typescript
import { upload } from "@frontal-cloud/storage";

const file = new File(["hello world"], "hello.txt", { type: "text/plain" });

const result = await upload({
  bucket: "my-bucket",
  path: "uploads/hello.txt",
  data: file,
});

console.log(`File uploaded to: ${result.url}`);
```

### Downloading a File

```typescript
import { download } from "@frontal-cloud/storage";

const data = await download({
  bucket: "my-bucket",
  path: "uploads/hello.txt",
});

const text = await data.text();
console.log(text);
```

### Generating a Signed URL

```typescript
import { getSignedUrl } from "@frontal-cloud/storage";

const url = await getSignedUrl({
  bucket: "my-bucket",
  path: "private/document.pdf",
  expiresIn: 3600, // 1 hour
});

console.log(`Signed URL: ${url}`);
```

### Listing Objects

```typescript
import { list } from "@frontal-cloud/storage";

const files = await list({
  bucket: "my-bucket",
  prefix: "uploads/",
});

console.log(files);
```

## API Reference

### `upload(options)`

Uploads a file or data to a storage bucket.

### `download(options)`

Downloads a file from a storage bucket.

### `list(options)`

Lists objects in a bucket with optional prefix filtering.

### `getSignedUrl(options)`

Generates a temporary signed URL for accessing private objects.

### `configure(config)`

Sets the global configuration for the storage client.