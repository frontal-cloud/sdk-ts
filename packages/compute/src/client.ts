import { DEFAULT_COMPUTE_BASE_URL } from "./constants";
import { FrontalError } from "./error";
import { env } from "./keys";
import {
	type APIResponse,
	type ComputeConfig,
	type IComputeClient,
	type Service,
	type ServiceConfig,
	serviceConfigSchema,
	type ServiceLog,
	type ServiceMetrics,
} from "./types";
import { z } from "zod";

/**
 * Client for interacting with Frontal Compute services.
 * Implements IComputeClient interface.
 */
export class Compute implements IComputeClient {
	private readonly headers: Headers;
	private readonly baseUrl: string;

	/**
	 * Initializes a new instance of the Compute client.
	 * @param config - Configuration options for the client.
	 */
	constructor(config: ComputeConfig = {}) {
		const apiKey = config.apiKey || env.FRONTAL_API_KEY;
		this.baseUrl =
			config.baseUrl || env.FRONTAL_API_URL || DEFAULT_COMPUTE_BASE_URL;

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
	 * Internal helper to make authenticated requests to the Compute API.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}/compute${path}`, options);

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

	async put<T>(path: string, entity?: unknown, options: RequestInit = {}) {
		const headers = new Headers(this.headers);
		if (options.headers) {
			for (const [key, value] of new Headers(options.headers).entries()) {
				headers.set(key, value);
			}
		}

		return this.fetchRequest<T>(path, {
			method: "PUT",
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
	 * Lists all available services.
	 */
	async listServices(): Promise<APIResponse<Service[]>> {
		return this.get<Service[]>("/services");
	}

	/**
	 * Gets details of a specific service.
	 * @param id - The service ID.
	 */
	async getService(id: string): Promise<APIResponse<Service>> {
		return this.get<Service>(`/services/${id}`);
	}

	/**
	 * Creates a new service.
	 * @param config - The service configuration.
	 */
	async createService(config: ServiceConfig): Promise<APIResponse<Service>> {
		try {
			const validated = serviceConfigSchema.parse(config);
			return this.post<Service>("/services", validated);
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
	 * Updates an existing service.
	 * @param id - The service ID.
	 * @param config - The partial service configuration to update.
	 */
	async updateService(
		id: string,
		config: Partial<ServiceConfig>,
	): Promise<APIResponse<Service>> {
		try {
			const validated = serviceConfigSchema.partial().parse(config);
			return this.put<Service>(`/services/${id}`, validated);
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
	 * Deletes a service.
	 * @param id - The service ID.
	 */
	async deleteService(id: string): Promise<APIResponse<void>> {
		return this.delete<void>(`/services/${id}`);
	}

	/**
	 * Restarts a service.
	 * @param id - The service ID.
	 */
	async restartService(id: string): Promise<APIResponse<void>> {
		return this.post<void>(`/services/${id}/restart`);
	}

	/**
	 * Gets logs for a service.
	 * @param id - The service ID.
	 */
	async getLogs(id: string): Promise<APIResponse<ServiceLog[]>> {
		return this.get<ServiceLog[]>(`/services/${id}/logs`);
	}

	/**
	 * Gets metrics for a service.
	 * @param id - The service ID.
	 */
	async getMetrics(id: string): Promise<APIResponse<ServiceMetrics>> {
		return this.get<ServiceMetrics>(`/services/${id}/metrics`);
	}
}
