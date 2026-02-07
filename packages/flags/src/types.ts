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
 * Zod schema for flag evaluation context.
 */
export const flagContextSchema = z.record(
	z.string(),
	z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

/**
 * Flag evaluation context.
 */
export type FlagContext = z.infer<typeof flagContextSchema>;

/**
 * Zod schema for a flag evaluation result.
 */
export const flagResultSchema = z.object({
	key: z.string(),
	value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
	variant: z.string().optional(),
	reason: z.string().optional(),
});

/**
 * Flag evaluation result.
 */
export type FlagResult = z.infer<typeof flagResultSchema>;

/**
 * Configuration for the Flags client.
 */
export const flagsConfigSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.string().url().optional(),
	defaultContext: flagContextSchema.optional(),
	refreshInterval: z.number().int().positive().optional(),
});

/**
 * Flags configuration.
 */
export type FlagsConfig = z.infer<typeof flagsConfigSchema>;

/**
 * Interface for the Flags client.
 */
export interface IFlagsClient {
	/**
	 * Evaluates a single flag.
	 */
	getFlag(
		key: string,
		defaultValue: unknown,
		context?: FlagContext,
	): Promise<APIResponse<FlagResult>>;
	/**
	 * Evaluates all flags for the given context.
	 */
	listFlags(context?: FlagContext): Promise<APIResponse<FlagResult[]>>;
}
