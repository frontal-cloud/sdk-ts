import { DEFAULT_STORAGE_BASE_URL } from "./constants";
import { FrontalError } from "./error";
import { env } from "./keys";

function headersEntries(
	headers: Headers | HeadersInit,
): IterableIterator<[string, string]> {
	const h = new Headers(headers) as unknown as {
		entries(): IterableIterator<[string, string]>;
	};
	return h.entries();
}

function headersToRecord(headers: Headers): Record<string, string> {
	return Object.fromEntries(headersEntries(headers));
}
import {
	signedUrlOptionsSchema,
	type APIResponse,
	type IStorageClient,
	type ListObjectsResult,
	type SignedUrlOptions,
	type StorageConfig,
	type StorageObject,
} from "./types";
import { z } from "zod";

/**
 * Client for interacting with Frontal Storage services.
 * Implements IStorageClient interface.
 */
export class Storage implements IStorageClient {
	private readonly headers: Headers;
	private readonly baseUrl: string;
	private readonly apiKey: string;

	/**
	 * Initializes a new instance of the Storage client.
	 * @param config - Configuration options for the client.
	 */
	constructor(config: StorageConfig = {}) {
		this.apiKey = config.apiKey || env.FRONTAL_API_KEY || "";
		this.baseUrl =
			config.baseUrl || env.FRONTAL_API_URL || DEFAULT_STORAGE_BASE_URL;

		if (!this.apiKey && env.NODE_ENV !== "test") {
			throw new FrontalError(
				"Frontal API Key not found. Please set FRONTAL_API_KEY environment variable or pass it to the constructor.",
			);
		}

		this.headers = new Headers({
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
		});
	}

	/**
	 * Internal helper to make authenticated requests to the Storage API.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}/storage${path}`, options);

			if (!response.ok) {
				try {
					const rawError = await response.text();
					let errorData:
						| { message?: string; statusCode?: number; name?: string }
						| undefined;
					try {
						errorData = JSON.parse(rawError);
					} catch {
						errorData = {
							message: rawError || response.statusText,
							statusCode: response.status,
							name: "UnknownError",
						};
					}

					return {
						data: null,
						error: {
							message: errorData?.message ?? "Unknown error",
							statusCode: response.status,
							name: errorData?.name ?? "application_error",
						},
						headers: headersToRecord(response.headers),
					};
				} catch {
					return {
						data: null,
						error: {
							message: response.statusText,
							statusCode: response.status,
							name: "application_error",
						},
						headers: headersToRecord(response.headers),
					};
				}
			}

			// Handle void/empty responses
			if (response.status === 204) {
				return {
					data: null,
					error: null,
					headers: headersToRecord(response.headers),
				};
			}

			// Handle Blob/Stream responses differently if expected
			// This is tricky with generic T. We might need specific methods for blob/stream.
			// For now, implementing standard JSON handling here.
			// Special handling for download methods will be done in those specific methods.

			const data = await response.json();
			return {
				data: data as T,
				error: null,
				headers: headersToRecord(response.headers),
			};
		} catch (error) {
			return {
				data: null,
				error: {
					message:
						error instanceof Error ? error.message : "Unable to fetch data",
					statusCode: 0,
					name: "application_error",
				},
				headers: null,
			};
		}
	}

	async get<T>(path: string, options: RequestInit = {}) {
		const headers = new Headers(this.headers);
		if (options.headers) {
			for (const [key, value] of headersEntries(options.headers)) {
				headers.set(key, value);
			}
		}

		return this.fetchRequest<T>(path, {
			method: "GET",
			...options,
			headers,
		});
	}

	async post<T>(path: string, entity?: unknown, options: RequestInit = {}) {
		const headers = new Headers(this.headers);
		if (options.headers) {
			for (const [key, value] of headersEntries(options.headers)) {
				headers.set(key, value);
			}
		}

		return this.fetchRequest<T>(path, {
			method: "POST",
			body: JSON.stringify(entity),
			...options,
			headers,
		});
	}

	async deleteWrapper<T>(path: string, options: RequestInit = {}) {
		const headers = new Headers(this.headers);
		if (options.headers) {
			for (const [key, value] of headersEntries(options.headers)) {
				headers.set(key, value);
			}
		}

		return this.fetchRequest<T>(path, {
			method: "DELETE",
			...options,
			headers,
		});
	}

	/**
	 * Uploads data to a bucket.
	 * @param bucket - The bucket name.
	 * @param key - The object key.
	 * @param data - The data to upload.
	 * @param contentType - The content type of the data.
	 */
	async upload(
		bucket: string,
		key: string,
		data: BodyInit,
		contentType = "application/octet-stream",
	): Promise<APIResponse<void>> {
		const headers = new Headers(this.headers);
		headers.set("Content-Type", contentType);

		return this.fetchRequest<void>(`/${bucket}/${key}`, {
			method: "PUT",
			body: data,
			headers,
		});
	}

	/**
	 * Downloads data from a bucket as a Blob.
	 * @param bucket - The bucket name.
	 * @param key - The object key.
	 */
	async download(bucket: string, key: string): Promise<APIResponse<Blob>> {
		try {
			const response = await fetch(`${this.baseUrl}/storage/${bucket}/${key}`, {
				headers: this.headers,
			});

			if (!response.ok) {
				return {
					data: null,
					error: {
						message: `Frontal Storage download error: ${response.status}`,
						statusCode: response.status,
						name: "download_error",
					},
					headers: headersToRecord(response.headers),
				};
			}

			const data = await response.blob();
			return {
				data,
				error: null,
				headers: headersToRecord(response.headers),
			};
		} catch (error) {
			return {
				data: null,
				error: {
					message:
						error instanceof Error ? error.message : "Unable to download data",
					statusCode: 0,
					name: "download_error",
				},
				headers: null,
			};
		}
	}

	/**
	 * Downloads data from a bucket as a stream.
	 * @param bucket - The bucket name.
	 * @param key - The object key.
	 */
	async downloadStream(
		bucket: string,
		key: string,
	): Promise<APIResponse<ReadableStream<Uint8Array>>> {
		try {
			const response = await fetch(`${this.baseUrl}/storage/${bucket}/${key}`, {
				headers: this.headers,
			});

			if (!response.ok || !response.body) {
				return {
					data: null,
					error: {
						message: `Frontal Storage stream error: ${response.status}`,
						statusCode: response.status,
						name: "stream_error",
					},
					headers: headersToRecord(response.headers),
				};
			}

			return {
				data: response.body as ReadableStream<Uint8Array>,
				error: null,
				headers: headersToRecord(response.headers),
			};
		} catch (error) {
			return {
				data: null,
				error: {
					message:
						error instanceof Error ? error.message : "Unable to stream data",
					statusCode: 0,
					name: "stream_error",
				},
				headers: null,
			};
		}
	}

	/**
	 * Deletes an object from a bucket.
	 * @param bucket - The bucket name.
	 * @param key - The object key.
	 */
	async delete(bucket: string, key: string): Promise<APIResponse<void>> {
		return this.deleteWrapper<void>(`/${bucket}/${key}`);
	}

	/**
	 * Lists objects in a bucket with optional prefix.
	 * @param bucket - The bucket name.
	 * @param prefix - Optional prefix to filter objects.
	 */
	async list(
		bucket: string,
		prefix?: string,
	): Promise<APIResponse<ListObjectsResult>> {
		const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
		return this.get<ListObjectsResult>(`/${bucket}${query}`);
	}

	/**
	 * Generates a signed URL for temporary access.
	 * @param bucket - The bucket name.
	 * @param options - Signed URL options.
	 */
	async getSignedUrl(
		bucket: string,
		options: SignedUrlOptions,
	): Promise<APIResponse<string>> {
		try {
			const validated = signedUrlOptionsSchema.parse(options);
			return this.post<string>(`/${bucket}/sign`, validated);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					data: null,
					error: {
						message: error instanceof Error ? error.message : String(error),
						statusCode: 400,
						name: "validation_error",
					},
					headers: null,
				};
			}
			throw error;
		}
	}

	/**
	 * Copies an object within or across buckets.
	 * @param sourceBucket - Source bucket name.
	 * @param sourceKey - Source object key.
	 * @param destBucket - Destination bucket name.
	 * @param destKey - Destination object key.
	 */
	async copyObject(
		sourceBucket: string,
		sourceKey: string,
		destBucket: string,
		destKey: string,
	): Promise<APIResponse<void>> {
		return this.post<void>(`/${sourceBucket}/${sourceKey}/copy`, {
			destBucket,
			destKey,
		});
	}

	/**
	 * Moves (renames) an object.
	 * @param sourceBucket - Source bucket name.
	 * @param sourceKey - Source object key.
	 * @param destBucket - Destination bucket name.
	 * @param destKey - Destination object key.
	 */
	async moveObject(
		sourceBucket: string,
		sourceKey: string,
		destBucket: string,
		destKey: string,
	): Promise<APIResponse<void>> {
		return this.post<void>(`/${sourceBucket}/${sourceKey}/move`, {
			destBucket,
			destKey,
		});
	}

	/**
	 * Retrieves metadata for a specific object.
	 * @param bucket - The bucket name.
	 * @param key - The object key.
	 */
	async getMetadata(
		bucket: string,
		key: string,
	): Promise<APIResponse<StorageObject>> {
		return this.get<StorageObject>(`/${bucket}/${key}/metadata`);
	}
}
