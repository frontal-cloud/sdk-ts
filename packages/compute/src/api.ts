import { Compute } from "./client";
import type { APIResponse, Service, ServiceConfig } from "./types";

/**
 * Internal global client for functional API calls.
 */
let globalClient: Compute | null = null;

function getClient() {
	if (!globalClient) {
		globalClient = new Compute();
	}
	return globalClient;
}

/**
 * Configure the global Compute client.
 */
export function configure(config: { apiKey?: string; baseUrl?: string }): void {
	globalClient = new Compute(config);
}

/**
 * Creates a new compute service using the global client.
 */
export function createService(
	config: ServiceConfig,
): Promise<APIResponse<Service>> {
	return getClient().createService(config);
}

/**
 * Lists all services using the global client.
 */
export function listServices(): Promise<APIResponse<Service[]>> {
	return getClient().listServices();
}

/**
 * Gets a service by ID using the global client.
 */
export function getService(id: string): Promise<APIResponse<Service>> {
	return getClient().getService(id);
}

/**
 * Restarts a service using the global client.
 */
export function restartService(id: string): Promise<APIResponse<void>> {
	return getClient().restartService(id);
}
