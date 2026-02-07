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
 * Zod schema for compute service configuration.
 */
export const serviceConfigSchema = z.object({
	name: z.string().min(1),
	image: z.string().min(1),
	cpu: z.number().positive(),
	memory: z.number().positive(), // MB
	env: z.record(z.string(), z.string()).optional(),
	networking: z
		.object({
			port: z.number().int().min(1).max(65535),
			public: z.boolean().optional(),
		})
		.optional(),
	scaling: z
		.object({
			minReplicas: z.number().int().min(0),
			maxReplicas: z.number().int().min(1),
			targetCPUUtilization: z.number().int().min(1).max(100).optional(),
		})
		.optional(),
	healthCheck: z
		.object({
			path: z.string().startsWith("/"),
			intervalSeconds: z.number().int().positive(),
		})
		.optional(),
});

/**
 * Compute service configuration.
 */
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;

/**
 * Zod schema for a compute service.
 */
export const serviceSchema = serviceConfigSchema.extend({
	id: z.string(),
	status: z.enum(["pending", "running", "failed", "deleted"]),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

/**
 * A compute service.
 */
export type Service = z.infer<typeof serviceSchema>;

/**
 * Zod schema for service metrics.
 */
export const serviceMetricsSchema = z.object({
	serviceId: z.string(),
	cpuUsage: z.number(),
	memoryUsage: z.number(),
	replicaCount: z.number().int(),
	timestamp: z.string().datetime(),
});

/**
 * Service metrics.
 */
export type ServiceMetrics = z.infer<typeof serviceMetricsSchema>;

/**
 * Log entry for a service.
 */
export const serviceLogSchema = z.object({
	timestamp: z.string().datetime(),
	stream: z.enum(["stdout", "stderr"]),
	message: z.string(),
});

/**
 * Service log entry.
 */
export type ServiceLog = z.infer<typeof serviceLogSchema>;

/**
 * Configuration for the Compute client.
 */
export const computeConfigSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.string().url().optional(),
});

/**
 * Compute configuration.
 */
export type ComputeConfig = z.infer<typeof computeConfigSchema>;

/**
 * Interface for the Compute client.
 */
export interface IComputeClient {
	/**
	 * Creates a new compute service.
	 */
	createService(config: ServiceConfig): Promise<APIResponse<Service>>;
	/**
	 * Lists all compute services.
	 */
	listServices(): Promise<APIResponse<Service[]>>;
	/**
	 * Gets details of a specific service.
	 */
	getService(id: string): Promise<APIResponse<Service>>;
	/**
	 * Updates an existing service.
	 */
	updateService(
		id: string,
		config: Partial<ServiceConfig>,
	): Promise<APIResponse<Service>>;
	/**
	 * Deletes a service.
	 */
	deleteService(id: string): Promise<APIResponse<void>>;
	/**
	 * Restarts a service.
	 */
	restartService(id: string): Promise<APIResponse<void>>;
	/**
	 * Gets logs for a service.
	 */
	getLogs(
		id: string,
		options?: { limit?: number; since?: string },
	): Promise<APIResponse<ServiceLog[]>>;
	/**
	 * Gets metrics for a service.
	 */
	getMetrics(id: string): Promise<APIResponse<ServiceMetrics>>;
}
