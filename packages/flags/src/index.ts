/**
 * @frontal-cloud/flags
 *
 * Scalable feature flag management for Frontal Cloud.
 * Supports targeted evaluation and real-time configuration.
 */

export { getFlag, configure, listFlags } from "./api";
export { Flags } from "./client";
export { DEFAULT_FLAGS_BASE_URL, VERSION } from "./constants";
export type {
	FlagContext,
	FlagResult,
	FlagsConfig,
} from "./types";
