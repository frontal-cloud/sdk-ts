import { AI } from "./client";
import type {
	APIResponse,
	EmbedOptions,
	EmbedResult,
	GenerateTextOptions,
	GenerateTextResult,
	StreamTextOptions,
	StreamTextResult,
} from "./types";

/**
 * Internal global client for functional API calls.
 */
let globalClient: AI | null = null;

function getClient() {
	if (!globalClient) {
		globalClient = new AI();
	}
	return globalClient;
}

/**
 * Configure the global AI client.
 * @param config - Configuration options.
 */
export function configure(config: { apiKey?: string; baseUrl?: string }): void {
	globalClient = new AI(config);
}

/**
 * Generates text using the default model and global client.
 */
export function generateText(
	options: GenerateTextOptions,
): Promise<APIResponse<GenerateTextResult>> {
	return getClient().generateText(options);
}

/**
 * Streams text using the default model and global client.
 */
export function streamText(options: StreamTextOptions): StreamTextResult {
	return getClient().streamText(options);
}

/**
 * Generates embeddings using the global client.
 */
export function embed(
	options: EmbedOptions,
): Promise<APIResponse<EmbedResult>> {
	return getClient().embed(options);
}

/**
 * Creates a provider instance for compatibility with other AI SDKs.
 */
export function createFrontal(config?: { apiKey?: string; baseUrl?: string }) {
	const client = new AI(config);
	return (modelId: string) => {
		return {
			modelId,
			generateText: (
				opts: Omit<GenerateTextOptions, "model">,
			): Promise<APIResponse<GenerateTextResult>> =>
				client.generateText({ ...opts, model: modelId }),
			streamText: (opts: Omit<StreamTextOptions, "model">): StreamTextResult =>
				client.streamText({ ...opts, model: modelId }),
		};
	};
}

/**
 * Default frontal provider instance.
 */
export const frontal = createFrontal();
