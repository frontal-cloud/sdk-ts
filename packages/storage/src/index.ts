/**
 * @frontal-cloud/storage
 *
 * Simple, scalable object storage for Frontal Cloud.
 * Fully compatible with Blob and S3 standard patterns.
 */

export { configure, upload, download, list, getSignedUrl } from "./api";
export { Storage } from "./client";
export { DEFAULT_STORAGE_BASE_URL, VERSION } from "./constants";
export type {
	BucketConfig,
	StorageObject,
	ListObjectsResult,
	SignedUrlOptions,
	StorageConfig,
} from "./types";
