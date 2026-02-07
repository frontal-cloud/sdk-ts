import { Notifications } from "./client";
import type {
	APIResponse,
	NotificationResult,
	NotificationStatus,
	SendNotificationOptions,
} from "./types";

/**
 * Internal global client for quick notification delivery.
 */
let globalClient: Notifications | null = null;

function getClient() {
	if (!globalClient) {
		globalClient = new Notifications();
	}
	return globalClient;
}

/**
 * Configure the global Notifications client.
 */
export function configure(config: { apiKey?: string; baseUrl?: string }): void {
	globalClient = new Notifications(config);
}

/**
 * Sends a notification using the global client.
 */
export function send(
	options: SendNotificationOptions,
): Promise<APIResponse<NotificationResult>> {
	return getClient().send(options);
}

/**
 * Gets notification status using the global client.
 */
export function getStatus(
	id: string,
): Promise<APIResponse<NotificationStatus>> {
	return getClient().getStatus(id);
}
