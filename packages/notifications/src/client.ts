import { DEFAULT_NOTIFICATIONS_BASE_URL } from "./constants";
import { FrontalError } from "./error";
import { env } from "./keys";
import {
	type APIResponse,
	type INotificationsClient,
	type NotificationResult,
	type NotificationStatus,
	type NotificationsConfig,
	type SendNotificationOptions,
	sendNotificationOptionsSchema,
} from "./types";
import { z } from "zod";

/**
 * Client for sending notifications via Frontal Cloud.
 * Implements INotificationsClient interface.
 */
export class Notifications implements INotificationsClient {
	private readonly headers: Headers;
	private readonly baseUrl: string;

	/**
	 * Initializes a new instance of the Notifications client.
	 * @param config - Configuration options.
	 */
	constructor(config: NotificationsConfig = {}) {
		const apiKey = config.apiKey || env.FRONTAL_API_KEY;
		this.baseUrl =
			config.baseUrl || env.FRONTAL_API_URL || DEFAULT_NOTIFICATIONS_BASE_URL;

		if (!apiKey && env.NODE_ENV !== "test") {
			throw new FrontalError(
				"Frontal API Key not found. Please set FRONTAL_API_KEY environment variable or pass it to the constructor.",
			);
		}

		this.headers = new Headers({
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		});
	}

	/**
	 * Internal helper to make authenticated requests to the Notifications API.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(
				`${this.baseUrl}/notifications${path}`,
				options,
			);

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
						headers: Object.fromEntries(response.headers.entries()),
					};
				} catch {
					return {
						data: null,
						error: {
							message: response.statusText,
							statusCode: response.status,
							name: "application_error",
						},
						headers: Object.fromEntries(response.headers.entries()),
					};
				}
			}

			// Handle void/empty responses
			if (response.status === 204) {
				return {
					data: null,
					error: null,
					headers: Object.fromEntries(response.headers.entries()),
				};
			}

			const data = await response.json();
			return {
				data: data as T,
				error: null,
				headers: Object.fromEntries(response.headers.entries()),
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
			for (const [key, value] of new Headers(options.headers).entries()) {
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
			for (const [key, value] of new Headers(options.headers).entries()) {
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

	async delete<T>(path: string, options: RequestInit = {}) {
		const headers = new Headers(this.headers);
		if (options.headers) {
			for (const [key, value] of new Headers(options.headers).entries()) {
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
	 * Sends a notification.
	 * @param options - Notification options.
	 */
	async send(
		options: SendNotificationOptions,
	): Promise<APIResponse<NotificationResult>> {
		try {
			const validated = sendNotificationOptionsSchema.parse(options);
			return this.post<NotificationResult>("/send", validated);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					data: null,
					error: {
						message: error.message,
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
	 * Sends multiple notifications in a single batch.
	 * @param batch - Array of send options.
	 */
	async sendBatch(
		batch: SendNotificationOptions[],
	): Promise<APIResponse<NotificationStatus[]>> {
		try {
			const validated = batch.map((opts) =>
				sendNotificationOptionsSchema.parse(opts),
			);
			return this.post<NotificationStatus[]>("/send/batch", validated);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					data: null,
					error: {
						message: error.message,
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
	 * Gets the status of a notification.
	 * @param id - The notification ID.
	 */
	async getStatus(id: string): Promise<APIResponse<NotificationStatus>> {
		return this.get<NotificationStatus>(`/status/${id}`);
	}

	/**
	 * Cancels a scheduled notification.
	 * @param id - The notification ID.
	 */
	async cancel(id: string): Promise<APIResponse<void>> {
		return this.delete<void>(`/cancel/${id}`);
	}
}
