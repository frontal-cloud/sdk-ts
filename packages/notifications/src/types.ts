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
 * Supported notification channels.
 */
export const notificationChannelSchema = z.enum(["email", "sms", "push"]);

/**
 * Notification channel type.
 */
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

/**
 * Zod schema for notification recipient identifiers.
 * Must provide at least one identifier corresponding to the chosen channel.
 */
export const notificationRecipientSchema = z.object({
	email: z.string().email().optional(),
	phone: z.string().optional(), // International format recommended
	pushToken: z.string().optional(),
});

/**
 * Notification recipient.
 */
export type NotificationRecipient = z.infer<typeof notificationRecipientSchema>;

/**
 * Zod schema for the notification content payload.
 */
export const notificationPayloadSchema = z.object({
	title: z.string().optional(),
	body: z.string().min(1),
	data: z.record(z.string(), z.unknown()).optional(),
	templateId: z.string().optional(),
	templateVars: z.record(z.string(), z.string()).optional(),
});

/**
 * Notification content payload.
 */
export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;

/**
 * Options for sending a single notification.
 */
export const sendNotificationOptionsSchema = z.object({
	recipient: notificationRecipientSchema,
	channels: z.array(notificationChannelSchema).min(1),
	payload: notificationPayloadSchema,
});

/**
 * Send options.
 */
export type SendNotificationOptions = z.infer<
	typeof sendNotificationOptionsSchema
>;

/**
 * Current status of a dispatched notification.
 */
export const notificationStatusSchema = z.object({
	id: z.string(),
	sentAt: z.string().datetime(),
	channelStatuses: z.array(
		z.object({
			channel: notificationChannelSchema,
			status: z.enum(["sent", "failed", "pending", "delivered"]),
			error: z.string().optional(),
		}),
	),
});

/**
 * Notification status.
 */
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;

/**
 * Result of sending a notification (same shape as status).
 */
export type NotificationResult = NotificationStatus;

/**
 * Configuration for the Notifications client.
 */
export const notificationsConfigSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.string().url().optional(),
});

/**
 * Notifications configuration.
 */
export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;

/**
 * Interface for the Notifications client.
 */
export interface INotificationsClient {
	/**
	 * Sends a notification to one or more channels.
	 */
	send(
		options: SendNotificationOptions,
	): Promise<APIResponse<NotificationResult>>;
	/**
	 * Sends multiple notifications in a single batch.
	 */
	sendBatch(
		batch: SendNotificationOptions[],
	): Promise<APIResponse<NotificationStatus[]>>;
	/**
	 * Checks the delivery status of a previously sent notification.
	 */
	getStatus(id: string): Promise<APIResponse<NotificationStatus>>;
}
