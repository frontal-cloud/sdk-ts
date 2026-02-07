/**
 * @frontal-cloud/functions
 *
 * Scalable serverless functions at the edge.
 */

export { configure, deployFunction, invoke, listFunctions } from "./api";
export { Functions } from "./client";
export { VERSION, DEFAULT_FUNCTIONS_BASE_URL } from "./constants";
export type {
	FunctionConfig,
	FunctionEntry,
	InvokeOptions,
	FunctionsConfig,
	InvocationStats,
} from "./types";
