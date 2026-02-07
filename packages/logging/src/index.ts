/**
 * @frontal-cloud/logging
 *
 * High-performance structured logging for Frontal applications.
 * Combines local development comfort with remote observability.
 */

export { DEFAULT_LOGGING_BASE_URL, VERSION } from "./constants";
export { Logger } from "./logger";
export type {
	ILogger,
	LogEntry,
	LogLevel,
	LogMetadata,
	QueryLogsOptions,
	LoggingConfig,
} from "./types";
