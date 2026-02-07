import { Functions } from "./client";
import type {
	APIResponse,
	FunctionConfig,
	FunctionEntry,
	InvokeOptions,
} from "./types";

/**
 * Internal global client for quick-start functional API calls.
 */
let globalClient: Functions | null = null;

function getClient() {
	if (!globalClient) {
		globalClient = new Functions();
	}
	return globalClient;
}

/**
 * Configure the global Functions client.
 */
export function configure(config: { apiKey?: string; baseUrl?: string }): void {
	globalClient = new Functions(config);
}

/**
 * Deploys a function using the global client.
 */
export function deployFunction(
	config: FunctionConfig,
): Promise<APIResponse<FunctionEntry>> {
	return getClient().deployFunction(config);
}

/**
 * Invokes a function using the global client.
 */
export function invoke(
	id: string,
	options: InvokeOptions = {},
): Promise<unknown> {
	return getClient().invoke(id, options);
}

/**
 * Lists all functions using the global client.
 */
export function listFunctions(): Promise<APIResponse<FunctionEntry[]>> {
	return getClient().listFunctions();
}
