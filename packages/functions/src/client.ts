import { DEFAULT_FUNCTIONS_BASE_URL } from "./constants";
import { FrontalError } from "./error";
import { env } from "./keys";
import {
	type APIResponse,
	type FunctionConfig,
	functionConfigSchema,
	type FunctionEntry,
	type FunctionsConfig,
	type IFunctionsClient,
	type InvocationStats,
	type InvokeOptions,
	invokeOptionsSchema,
} from "./types";
import { z } from "zod";

/**
 * Client for interacting with Frontal Functions services.
 * Implements IFunctionsClient interface.
 */
export class Functions implements IFunctionsClient {
	private readonly headers: Headers;
	private readonly baseUrl: string;

	/**
	 * Initializes a new instance of the Functions client.
	 * @param config - Configuration options for the client.
	 */
	constructor(config: FunctionsConfig = {}) {
		const apiKey = config.apiKey || env.FRONTAL_API_KEY;
		this.baseUrl =
			config.baseUrl || env.FRONTAL_API_URL || DEFAULT_FUNCTIONS_BASE_URL;

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
	 * Internal helper to make authenticated requests to the Functions API.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}/functions${path}`, options);

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
	 * Deploys a new function.
	 * @param config - The function configuration.
	 */
	async deployFunction(
		config: FunctionConfig,
	): Promise<APIResponse<FunctionEntry>> {
		try {
			const validated = functionConfigSchema.parse(config);
			return this.post<FunctionEntry>("/deploy", validated);
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
	 * Lists all functions.
	 */
	async listFunctions(): Promise<APIResponse<FunctionEntry[]>> {
		return this.get<FunctionEntry[]>("/list");
	}

	/**
	 * Gets details of a specific function.
	 * @param id - The function ID.
	 */
	async getFunction(id: string): Promise<APIResponse<FunctionEntry>> {
		return this.get<FunctionEntry>(`/get/${id}`);
	}

	/**
	 * Deletes a function.
	 * @param id - The function ID.
	 */
	async deleteFunction(id: string): Promise<APIResponse<void>> {
		return this.delete<void>(`/delete/${id}`);
	}

	/**
	 * Invokes a function synchronously.
	 * @param id - The function ID.
	 * @param options - Invocation options.
	 */
	async invoke(
		id: string,
		options: InvokeOptions = {},
	): Promise<APIResponse<unknown>> {
		try {
			const validated = invokeOptionsSchema.parse(options);
			return this.post<unknown>(`/invoke/${id}`, validated);
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
	 * Retrieves invocation statistics for a function.
	 * @param id - The function ID.
	 */
	async getInvocationStats(id: string): Promise<APIResponse<InvocationStats>> {
		return this.get<InvocationStats>(`/stats/${id}`);
	}

	/**
	 * Updates only the trigger configuration for a function.
	 * @param id - The function ID.
	 * @param trigger - The new trigger configuration.
	 */
	async updateTriggers(
		id: string,
		trigger: FunctionConfig["trigger"],
	): Promise<APIResponse<FunctionEntry>> {
		return this.put<FunctionEntry>(`/triggers/${id}`, trigger);
	}
}
