import { DEFAULT_LOGGING_BASE_URL } from "./constants";
import { env } from "./keys";
import type {
	APIResponse,
	ILogger,
	LogEntry,
	LogMetadata,
	LoggingConfig,
	QueryLogsOptions,
} from "./types";
import pino from "pino";

/**
 * Client for logging to Frontal Cloud.
 * Implements ILogger interface.
 */
export class Logger implements ILogger {
	private readonly headers: Headers;
	private readonly baseUrl: string;
	private readonly localOnly: boolean;
	private readonly defaultMetadata: LogMetadata;
	private readonly pinoLogger: pino.Logger;
	private readonly apiKey: string;

	/**
	 * Initializes a new instance of the Logger.
	 * @param config - Configuration options.
	 */
	constructor(config: LoggingConfig = {}) {
		this.apiKey = config.apiKey || env.FRONTAL_API_KEY || "";
		this.baseUrl =
			config.baseUrl || env.FRONTAL_API_URL || DEFAULT_LOGGING_BASE_URL;
		this.localOnly =
			config.localOnly ?? (env.NODE_ENV === "development" || !this.apiKey);

		this.defaultMetadata = {
			environment: env.NODE_ENV || "development",
			...config.defaultMetadata,
		};

		this.pinoLogger = pino({
			level: env.LOG_LEVEL || "info",
			base: this.defaultMetadata,
		});

		this.headers = new Headers({
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
		});
	}

	/**
	 * Internal helper to make authenticated requests to the Logging API.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}/logging${path}`, options);

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
	 * Sends a raw log entry to the gateway.
	 */
	async log(entry: LogEntry): Promise<APIResponse<void>> {
		if (this.localOnly) {
			this.pinoLogger.info(entry);
			return { data: null, error: null, headers: null };
		}
		// We don't validate specific log entries here against schema to avoid overhead, relying on server validation or user's prior validation
		return this.post<void>("/entries", entry);
	}

	/**
	 * Logs a debug message.
	 */
	debug(message: string, metadata?: LogMetadata): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level: "debug",
			message,
			metadata: { ...this.defaultMetadata, ...metadata },
		};
		this.pinoLogger.debug(entry);
		if (!this.localOnly) {
			this.log(entry).catch((err) => {
				console.error("Failed to send log to Frontal Cloud:", err);
			});
		}
	}

	/**
	 * Logs an informational message.
	 */
	info(message: string, metadata?: LogMetadata): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level: "info",
			message,
			metadata: { ...this.defaultMetadata, ...metadata },
		};
		this.pinoLogger.info(entry);
		if (!this.localOnly) {
			this.log(entry).catch((err) => {
				console.error("Failed to send log to Frontal Cloud:", err);
			});
		}
	}

	/**
	 * Logs a warning message.
	 */
	warn(message: string, metadata?: LogMetadata): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level: "warn",
			message,
			metadata: { ...this.defaultMetadata, ...metadata },
		};
		this.pinoLogger.warn(entry);
		if (!this.localOnly) {
			this.log(entry).catch((err) => {
				console.error("Failed to send log to Frontal Cloud:", err);
			});
		}
	}

	/**
	 * Logs an error message.
	 */
	error(message: string, metadata?: LogMetadata): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level: "error",
			message,
			metadata: { ...this.defaultMetadata, ...metadata },
		};
		this.pinoLogger.error(entry);
		if (!this.localOnly) {
			this.log(entry).catch((err) => {
				console.error("Failed to send log to Frontal Cloud:", err);
			});
		}
	}

	/**
	 * Logs a fatal message.
	 */
	fatal(message: string, metadata?: LogMetadata): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level: "fatal",
			message,
			metadata: { ...this.defaultMetadata, ...metadata },
		};
		this.pinoLogger.fatal(entry);
		if (!this.localOnly) {
			this.log(entry).catch((err) => {
				console.error("Failed to send log to Frontal Cloud:", err);
			});
		}
	}

	/**
	 * Queries historical logs from the gateway.
	 */
	async query(options: QueryLogsOptions): Promise<APIResponse<LogEntry[]>> {
		return this.post<LogEntry[]>("/query", options);
	}
}
