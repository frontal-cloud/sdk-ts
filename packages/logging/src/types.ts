import { z } from "zod";

/**
 * Standard error response structure.
 */
export interface ErrorResponse {
	message: string;
	statusCode: number;
	name: string;
}

/**
 * Standard API response structure.
 */
export interface APIResponse<T> {
	data: T | null;
	error: ErrorResponse | null;
	headers: Record<string, string> | null;
}

/**
 * Valid log levels.
 */
export const logLevelSchema = z.enum([
	"debug",
	"info",
	"warn",
	"error",
	"fatal",
]);

/**
 * Log level type.
 */
export type LogLevel = z.infer<typeof logLevelSchema>;

/**
 * Zod schema for log metadata.
 */
export const logMetadataSchema = z
	.object({
		service: z.string().optional(),
		environment: z.string().optional(),
		version: z.string().optional(),
		traceId: z.string().optional(),
		spanId: z.string().optional(),
	})
	.catchall(z.unknown());

/**
 * Log metadata type.
 */
export type LogMetadata = z.infer<typeof logMetadataSchema>;

/**
 * Zod schema for a log entry.
 */
export const logEntrySchema = z.object({
	timestamp: z.string().datetime(),
	level: logLevelSchema,
	message: z.string(),
	metadata: logMetadataSchema.optional(),
});

/**
 * Log entry type.
 */
export type LogEntry = z.infer<typeof logEntrySchema>;

/**
 * Options for querying logs.
 */
export const queryLogsOptionsSchema = z.object({
	startTime: z.string().datetime().optional(),
	endTime: z.string().datetime().optional(),
	levels: z.array(logLevelSchema).optional(),
	query: z.string().optional(),
	limit: z.number().int().positive().default(100),
});

/**
 * Query options.
 */
export type QueryLogsOptions = z.infer<typeof queryLogsOptionsSchema>;

/**
 * Configuration for the Logger.
 */
export const loggingConfigSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.string().url().optional(),
	defaultMetadata: logMetadataSchema.optional(),
	localOnly: z.boolean().optional(),
});

/**
 * Logging configuration.
 */
export type LoggingConfig = z.infer<typeof loggingConfigSchema>;

/**
 * Interface for the Logger client.
 */
export interface ILogger {
	/**
	 * Sends a raw log entry to the gateway.
	 */
	log(entry: LogEntry): Promise<APIResponse<void>>;
	/**
	 * Logs a debug message.
	 */
	debug(message: string, metadata?: LogMetadata): void;
	/**
	 * Logs an informational message.
	 */
	info(message: string, metadata?: LogMetadata): void;
	/**
	 * Logs a warning message.
	 */
	warn(message: string, metadata?: LogMetadata): void;
	/**
	 * Logs an error message.
	 */
	error(message: string, metadata?: LogMetadata): void;
	/**
	 * Logs a fatal message.
	 */
	fatal(message: string, metadata?: LogMetadata): void;
	/**
	 * Queries historical logs from the gateway.
	 */
	query(options: QueryLogsOptions): Promise<APIResponse<LogEntry[]>>;
}
