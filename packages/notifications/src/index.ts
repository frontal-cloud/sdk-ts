/**
 * @frontal-cloud/notifications
 *
 * Unified multi-channel notifications for Frontal Cloud.
 * Supports Email, SMS, and Push notifications with delivery tracking.
 */

export { Notifications } from "./client";
export { DEFAULT_NOTIFICATIONS_BASE_URL, VERSION } from "./constants";
export type {
	INotificationsClient,
	SendNotificationOptions,
	NotificationStatus,
	NotificationChannel,
	NotificationRecipient,
	NotificationPayload,
	NotificationsConfig,
} from "./types";
