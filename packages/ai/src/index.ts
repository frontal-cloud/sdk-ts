/**
 * @frontal-cloud/ai
 *
 * A powerful, type-safe AI SDK for Frontal Cloud.
 * Provides unified access to LLMs, embeddings, and more.
 */

export { generateText, streamText, embed } from "./api";
export { AI } from "./client";
export { VERSION, DEFAULT_AI_BASE_URL } from "./constants";
export type {
	Message,
	GenerateTextOptions,
	GenerateTextResult,
	StreamTextOptions,
	EmbedOptions,
	EmbedResult,
	AIConfig,
} from "./types";
