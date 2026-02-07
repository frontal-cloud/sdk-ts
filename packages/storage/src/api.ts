import { Storage } from "./client";
import type { APIResponse, ListObjectsResult, SignedUrlOptions } from "./types";

/**
 * Internal global client for Storage functional calls.
 */
let globalClient: Storage | null = null;

function getClient() {
	if (!globalClient) {
		globalClient = new Storage();
	}
	return globalClient;
}

/**
 * Configure the global Storage client.
 */
export function configure(config: { apiKey?: string; baseUrl?: string }): void {
	globalClient = new Storage(config);
}

/**
 * Uploads data using the global client.
 */
export function upload(
	bucket: string,
	key: string,
	data: BodyInit,
	contentType?: string,
): Promise<APIResponse<void>> {
	return getClient().upload(bucket, key, data, contentType);
}

/**
 * Downloads as Blob using the global client.
 */
export function download(
	bucket: string,
	key: string,
): Promise<APIResponse<Blob>> {
	return getClient().download(bucket, key);
}

/**
 * Generates signed URL using the global client.
 */
export function getSignedUrl(
	bucket: string,
	options: SignedUrlOptions,
): Promise<APIResponse<string>> {
	return getClient().getSignedUrl(bucket, options);
}

/**
 * Lists objects using the global client.
 */
export function list(
	bucket: string,
	prefix?: string,
): Promise<APIResponse<ListObjectsResult>> {
	return getClient().list(bucket, prefix);
}
