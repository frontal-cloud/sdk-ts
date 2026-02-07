import { DEFAULT_FLAGS_BASE_URL } from "./constants";
import { FrontalError } from "./error";
import { env } from "./keys";
import type {
	APIResponse,
	FlagContext,
	FlagResult,
	FlagsConfig,
	IFlagsClient,
} from "./types";

/**
 * Client for evaluating feature flags via Frontal Cloud.
 * Implements IFlagsClient interface.
 */
export class Flags implements IFlagsClient {
	private readonly headers: Headers;
	private readonly baseUrl: string;
	private readonly defaultContext: FlagContext;
	private readonly apiKey: string;

	/**
	 * Initializes a new instance of the Flags client.
	 * @param config - Configuration options.
	 */
	constructor(config: FlagsConfig = {}) {
		this.apiKey = config.apiKey || env.FRONTAL_API_KEY || "";
		this.baseUrl =
			config.baseUrl || env.FRONTAL_API_URL || DEFAULT_FLAGS_BASE_URL;
		this.defaultContext = config.defaultContext || {};

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
	 * Internal helper to make authenticated requests to the Flags API.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}/flags${path}`, options);

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

	/**
	 * Evaluates a single flag for the given context.
	 * @param key - The flag key.
	 * @param defaultValue - Value to return if evaluation fails.
	 * @param context - Optional context for evaluation.
	 */
	async getFlag(
		key: string,
		defaultValue: unknown,
		context: FlagContext = {},
	): Promise<APIResponse<FlagResult>> {
		const combinedContext = { ...this.defaultContext, ...context };

		function coerceToFlagValue(v: unknown): string | number | boolean | null {
			if (v === null || v === undefined) return null;
			if (
				typeof v === "string" ||
				typeof v === "number" ||
				typeof v === "boolean"
			)
				return v;
			return null;
		}

		function fallbackResult(
			headers: Record<string, string> | null,
		): APIResponse<FlagResult> {
			return {
				data: {
					key,
					value: coerceToFlagValue(defaultValue),
					variant: "default",
					reason: "fallback",
				},
				error: null,
				headers,
			};
		}

		try {
			const response = await this.post<FlagResult>(`/evaluate/${key}`, {
				context: combinedContext,
			});
			if (response.error || response.data === null) {
				return fallbackResult(response.headers);
			}
			return response;
		} catch {
			return fallbackResult(null);
		}
	}

	/**
	 * Evaluates all flags for the given context.
	 * @param context - Optional context for evaluation.
	 */
	async listFlags(
		context: FlagContext = {},
	): Promise<APIResponse<FlagResult[]>> {
		const combinedContext = { ...this.defaultContext, ...context };
		return this.post<FlagResult[]>("/evaluate", { context: combinedContext });
	}
}
