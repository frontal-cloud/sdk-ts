import { Flags } from "./client";
import type { APIResponse, FlagContext, FlagResult } from "./types";

/**
 * Internal global client for quick flag evaluation.
 */
let globalClient: Flags | null = null;

function getClient() {
	if (!globalClient) {
		globalClient = new Flags();
	}
	return globalClient;
}

/**
 * Configure the global Flags client.
 */
export function configure(config: { apiKey?: string; baseUrl?: string }): void {
	globalClient = new Flags(config);
}

/**
 * Evaluates a single flag using the global client.
 */
export function getFlag(
	key: string,
	defaultValue: unknown,
	context?: FlagContext,
): Promise<APIResponse<FlagResult>> {
	return getClient().getFlag(key, defaultValue, context);
}

/**
 * Lists all flags using the global client.
 */
export function listFlags(
	context?: FlagContext,
): Promise<APIResponse<FlagResult[]>> {
	return getClient().listFlags(context);
}
