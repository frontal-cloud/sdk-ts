/**
 * @frontal-cloud/compute
 *
 * Manage long-lived workloads on Frontal Cloud.
 */

export {
	getService,
	configure,
	createService,
	listServices,
	restartService,
} from "./api";
export { Compute } from "./client";
export { VERSION, DEFAULT_COMPUTE_BASE_URL } from "./constants";
export type {
	Service,
	ServiceMetrics,
	ServiceLog,
	ComputeConfig,
} from "./types";
