import { DEFAULT_AI_BASE_URL } from "./constants";
import { FrontalError } from "./error";
import { env } from "./keys";
import {
	type APIResponse,
	type EmbedOptions,
	embedOptionsSchema,
	type EmbeddingsResponse,
	type EmbedResult,
	type GenerateTextOptions,
	type GenerateTextResult,
	type IAIClient,
	type StreamTextOptions,
	type StreamTextResult,
	type GenerateObjectOptions,
	type GenerateObjectResult,
	type GenerateSpeechOptions,
	generateSpeechOptionsSchema,
	type GenerateImageOptions,
	generateImageOptionsSchema,
	type GenerateImageResult,
	type GenerateVideoOptions,
	generateVideoOptionsSchema,
	type GenerateVideoResult,
	type TranscriptionOptions,
	transcriptionOptionsSchema,
	type TranscriptionResult,
	type ModerationOptions,
	moderationOptionsSchema,
	type ModerationResult,
	type Prompt,
	type PromptChain,
	type Tool,
	type VariableDefinition,
	type ChatMessage,
	type ChatCompletionRequest,
	type ChatCompletionResponse,
} from "./types";
import { z } from "zod";

/**
 * Client for interacting with Frontal AI services.
 * Implements IAIClient interface.
 */
export class AI implements IAIClient {
	private readonly headers: Headers;
	private readonly baseUrl: string;

	/**
	 * Initializes a new instance of the AI client.
	 * @param config - Configuration options for the client.
	 */
	constructor(config: { apiKey?: string; baseUrl?: string } = {}) {
		const apiKey = config.apiKey || env.FRONTAL_API_KEY;
		this.baseUrl = config.baseUrl || env.FRONTAL_API_URL || DEFAULT_AI_BASE_URL;

		if (!apiKey && env.NODE_ENV !== "test") {
			throw new FrontalError(
				"Frontal API Key not found. Please set FRONTAL_API_KEY environment variable or pass it to the constructor.",
			);
		}

		this.headers = new Headers({
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		});
	}

	/**
	 * Internal helper to make authenticated requests to the AI Gateway.
	 */
	async fetchRequest<T>(
		path: string,
		options: RequestInit = {},
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}${path}`, options);

			if (!response.ok) {
				try {
					const rawError = await response.text();
					let errorData:
						| { message?: string; statusCode?: number; name?: string }
						| undefined;
					try {
						errorData = JSON.parse(rawError);
					} catch {
						errorData = {
							message: rawError || response.statusText,
							statusCode: response.status,
							name: "UnknownError",
						};
					}

					return {
						data: null,
						error: {
							message: errorData?.message ?? "Unknown error",
							statusCode: response.status,
							name: errorData?.name ?? "application_error",
						},
						headers: Object.fromEntries(response.headers.entries()),
					};
				} catch {
					return {
						data: null,
						error: {
							message: response.statusText,
							statusCode: response.status,
							name: "application_error",
						},
						headers: Object.fromEntries(response.headers.entries()),
					};
				}
			}

			const data = await response.json();
			return {
				data: data as T,
				error: null,
				headers: Object.fromEntries(response.headers.entries()),
			};
		} catch (error) {
			return {
				data: null,
				error: {
					message:
						error instanceof Error ? error.message : "Unable to fetch data",
					statusCode: 0,
					name: "application_error",
				},
				headers: null,
			};
		}
	}

	async post<T>(path: string, entity?: unknown, options: RequestInit = {}) {
		const headers = new Headers(this.headers);
		if (options.headers) {
			for (const [key, value] of new Headers(options.headers).entries()) {
				headers.set(key, value);
			}
		}

		const requestOptions = {
			method: "POST",
			body: JSON.stringify(entity),
			...options,
			headers,
		};

		return this.fetchRequest<T>(path, requestOptions);
	}

	/**
	 * Generates text using a large language model.
	 * @param options - Text generation options.
	 * @returns A promise that resolves to the generation result.
	 */
	async generateText(
		options: GenerateTextOptions,
	): Promise<APIResponse<GenerateTextResult>> {
		try {
			// Handle prompt vs messages
			let messages: ChatMessage[] = [];
			if (typeof options.prompt === "string") {
				messages = [{ role: "user", content: options.prompt }];
			} else if (Array.isArray(options.prompt)) {
				messages = options.prompt;
			}
			if (options.messages) {
				messages = options.messages;
			}

			const requestBody: ChatCompletionRequest = {
				model: options.model,
				messages,
				temperature: options.temperature,
				top_p: options.topP,
				frequency_penalty: options.frequencyPenalty,
				presence_penalty: options.presencePenalty,
				stop: options.stopSequences,
				max_tokens: options.maxTokens,
			};

			const response = await this.post<ChatCompletionResponse>(
				"/chat/completions",
				requestBody,
			);

			if (response.error || !response.data) {
				return {
					data: null,
					error: response.error,
					headers: response.headers,
				};
			}

			const choice = response.data.choices[0];

			return {
				data: {
					text: choice.message.content || "",
					finishReason:
						(choice.finish_reason as GenerateTextResult["finishReason"]) ||
						"unknown",
					usage: {
						promptTokens: response.data.usage?.prompt_tokens || 0,
						completionTokens: response.data.usage?.completion_tokens || 0,
						totalTokens: response.data.usage?.total_tokens || 0,
					},
				},
				error: null,
				headers: response.headers,
			};
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Streams text generation chunks.
	 * @param options - Text generation options.
	 * @returns A result object containing the text stream.
	 */
	streamText(options: StreamTextOptions): StreamTextResult {
		// Handle prompt vs messages
		let messages: ChatMessage[] = [];
		if (typeof options.prompt === "string") {
			messages = [{ role: "user", content: options.prompt }];
		} else if (Array.isArray(options.prompt)) {
			messages = options.prompt;
		}
		if (options.messages) {
			messages = options.messages;
		}

		const requestBody: ChatCompletionRequest = {
			model: options.model,
			messages,
			temperature: options.temperature,
			top_p: options.topP,
			frequency_penalty: options.frequencyPenalty,
			presence_penalty: options.presencePenalty,
			stop: options.stopSequences,
			max_tokens: options.maxTokens,
			stream: true,
		};

		const { onChunk } = options;

		const textStream = new ReadableStream<string>({
			start: async (controller) => {
				try {
					const response = await fetch(`${this.baseUrl}/chat/completions`, {
						method: "POST",
						headers: this.headers,
						body: JSON.stringify(requestBody),
					});

					if (!response.ok) {
						controller.error(
							new FrontalError(
								`Frontal AI Streaming error: ${response.status}`,
							),
						);
						return;
					}

					const reader = response.body?.getReader();
					if (!reader) {
						controller.error(new Error("Response body is null"));
						return;
					}

					const decoder = new TextDecoder();
					let buffer = "";

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split("\n");
						buffer = lines.pop() || "";

						for (const line of lines) {
							const trimmed = line.trim();
							if (trimmed === "" || trimmed === "data: [DONE]") continue;
							if (trimmed.startsWith("data: ")) {
								try {
									const data = JSON.parse(trimmed.slice(6));
									// OpenAI chunk format
									const content = data.choices?.[0]?.delta?.content;
									if (content) {
										if (onChunk) onChunk(content);
										controller.enqueue(content);
									}
								} catch (e) {
									console.warn("Error parsing stream chunk", e);
								}
							}
						}
					}
				} catch (error) {
					controller.error(
						error instanceof Error ? error : new Error(String(error)),
					);
				} finally {
					controller.close();
				}
			},
		});

		return {
			textStream,
			usage: Promise.resolve({
				promptTokens: 0,
				completionTokens: 0,
				totalTokens: 0,
			}),
		};
	}

	/**
	 * Generates embeddings for text.
	 * @param options - Embedding options.
	 * @returns A promise that resolves to the embedding result.
	 */
	async embed(options: EmbedOptions): Promise<APIResponse<EmbedResult>> {
		try {
			const validated = embedOptionsSchema.parse(options);

			// Map to OpenAI format
			const requestBody = {
				model: validated.model,
				input: validated.input,
			};

			const response = await this.post<EmbeddingsResponse>(
				"/embeddings",
				requestBody,
			);

			if (response.error || !response.data) {
				return {
					data: null,
					error: response.error,
					headers: response.headers,
				};
			}

			// Map back to EmbedResult
			return {
				data: {
					embeddings: response.data.data.map((d) => d.embedding),
					usage: {
						totalTokens: response.data.usage.total_tokens,
					},
				},
				error: null,
				headers: response.headers,
			};
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Generates a structured object based on the provided schema.
	 */
	async generateObject<T>(
		options: GenerateObjectOptions<T>,
	): Promise<APIResponse<GenerateObjectResult<T>>> {
		try {
			const { schema, prompt, model, temperature, maxRetries } = options;

			const attempts = (maxRetries ?? 0) + 1;
			let lastError: APIResponse<GenerateObjectResult<T>>["error"] = null;
			let lastHeaders: APIResponse<GenerateObjectResult<T>>["headers"] = null;

			const systemInstruction = `You are a helpful assistant designed to output JSON. The JSON must strictly follow this schema description: ${JSON.stringify(schema)}`;
			const messages: ChatMessage[] = [
				{ role: "system", content: systemInstruction },
				{ role: "user", content: prompt },
			];

			const requestBody: ChatCompletionRequest = {
				model,
				messages,
				temperature,
				response_format: { type: "json_object" },
			};

			for (let attempt = 0; attempt < attempts; attempt++) {
				if (attempt > 0) {
					await new Promise((r) => setTimeout(r, 500));
				}

				try {
					const response = await this.post<ChatCompletionResponse>(
						"/chat/completions",
						requestBody,
					);

					if (response.error || !response.data) {
						const status = response.error?.statusCode ?? 0;
						const retryable = status >= 500 || status === 429;
						if (!retryable) {
							return {
								data: null,
								error: response.error,
								headers: response.headers,
							};
						}
						lastError = response.error;
						lastHeaders = response.headers;
						continue;
					}

					const content = response.data.choices[0].message.content;
					if (!content) {
						lastError = {
							message: "No content generated",
							statusCode: 500,
							name: "generation_error",
						};
						lastHeaders = response.headers;
						continue;
					}

					let object: T;
					try {
						object = JSON.parse(content);
						if (schema instanceof z.ZodType) {
							object = schema.parse(object);
						}
					} catch {
						lastError = {
							message: "Failed to parse or validate JSON",
							statusCode: 500,
							name: "parse_error",
						};
						lastHeaders = response.headers;
						continue;
					}

					return {
						data: {
							object,
							usage: {
								promptTokens: response.data.usage?.prompt_tokens || 0,
								completionTokens: response.data.usage?.completion_tokens || 0,
								totalTokens: response.data.usage?.total_tokens || 0,
							},
						},
						error: null,
						headers: response.headers,
					};
				} catch (err) {
					lastError = {
						message: err instanceof Error ? err.message : "Request failed",
						statusCode: 0,
						name: "network_error",
					};
					lastHeaders = null;
				}
			}

			return {
				data: null,
				error: lastError,
				headers: lastHeaders,
			};
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Generates speech from text.
	 */
	async generateSpeech(
		options: GenerateSpeechOptions,
	): Promise<APIResponse<ArrayBuffer>> {
		try {
			const validated = generateSpeechOptionsSchema.parse(options);
			// Fetch blob/buffer
			try {
				const response = await fetch(`${this.baseUrl}/audio/speech`, {
					method: "POST",
					headers: this.headers,
					body: JSON.stringify({
						model: validated.model || "tts-1",
						input: validated.text,
						voice: validated.voice,
						speed: validated.speed,
						response_format: validated.format,
					}),
				});

				if (!response.ok) {
					return {
						data: null,
						error: {
							message: response.statusText,
							statusCode: response.status,
							name: "api_error",
						},
						headers: Object.fromEntries(response.headers.entries()),
					};
				}

				const arrayBuffer = await response.arrayBuffer();
				return {
					data: arrayBuffer,
					error: null,
					headers: Object.fromEntries(response.headers.entries()),
				};
			} catch (err) {
				return {
					data: null,
					error: {
						message: err instanceof Error ? err.message : "Details unknown",
						statusCode: 0,
						name: "network_error",
					},
					headers: null,
				};
			}
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Generates an image.
	 */
	async generateImage(
		options: GenerateImageOptions,
	): Promise<APIResponse<GenerateImageResult>> {
		try {
			const validated = generateImageOptionsSchema.parse(options);

			// Map to OpenAI options
			const requestBody = {
				prompt: validated.prompt,
				model: validated.model || "dall-e-3",
				n: validated.n || 1,
				size: validated.size || "1024x1024",
				quality: validated.quality,
				style: validated.style,
				response_format: "url", // default
			};

			const response = await this.post<{
				data: Array<{ url?: string; b64_json?: string }>;
			}>("/images/generations", requestBody);

			if (response.error || !response.data) {
				return {
					data: null,
					error: response.error,
					headers: response.headers,
				};
			}

			return {
				data: {
					images: response.data.data.map((img) => ({
						url: img.url,
						b64_json: img.b64_json,
					})),
				},
				error: null,
				headers: response.headers,
			};
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Generates a video.
	 */
	async generateVideo(
		options: GenerateVideoOptions,
	): Promise<APIResponse<GenerateVideoResult>> {
		try {
			const validated = generateVideoOptionsSchema.parse(options);
			return this.post<GenerateVideoResult>("/videos/generate", validated);
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Transcribes audio.
	 */
	async transcribe(
		options: TranscriptionOptions,
	): Promise<APIResponse<TranscriptionResult>> {
		try {
			const validated = transcriptionOptionsSchema.parse(options);

			// FormData for file upload
			const formData = new FormData();
			formData.append("file", validated.file);
			formData.append("model", validated.model);
			if (validated.language) formData.append("language", validated.language);
			if (validated.prompt) formData.append("prompt", validated.prompt);
			if (validated.response_format)
				formData.append("response_format", validated.response_format);
			if (validated.temperature)
				formData.append("temperature", String(validated.temperature));

			// fetchRequest doesn't support FormData body easily with current strictly typed wrapper if it forces JSON?
			// this.post uses JSON.stringify.
			// So we use fetchRequest directly but we need to override headers (Content-Type: multipart/form-data usually handled by fetch automatically if body is FormData, so we must UNSET Content-Type)

			const headers = new Headers(this.headers);
			headers.delete("Content-Type"); // Let browser/runtime set it with boundary

			const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
				method: "POST",
				headers,
				body: formData,
			});

			if (!response.ok) {
				// Handle error similar to fetchRequest
				const errorData = (await response.json().catch(() => ({}))) as {
					message?: string;
					error?: { type?: string };
				};
				return {
					data: null,
					error: {
						message: errorData?.message ?? response.statusText,
						statusCode: response.status,
						name: errorData?.error?.type ?? "api_error",
					},
					headers: Object.fromEntries(response.headers.entries()),
				};
			}

			const data = await response.json();
			return {
				data: data as TranscriptionResult,
				error: null,
				headers: Object.fromEntries(response.headers.entries()),
			};
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Moderates content.
	 */
	async moderate(
		options: ModerationOptions,
	): Promise<APIResponse<ModerationResult>> {
		try {
			const validated = moderationOptionsSchema.parse(options);
			// map input to OpenAI format
			const requestBody = {
				input: validated.input,
				model: validated.model || "text-moderation-latest",
			};

			return this.post<ModerationResult>("/moderations", requestBody);
		} catch (error) {
			return this.handleValidationErrors(error);
		}
	}

	/**
	 * Lists available models in the Frontal AI Gateway.
	 */
	async listModels(): Promise<APIResponse<string[]>> {
		const headers = new Headers(this.headers);
		const response = await this.fetchRequest<
			{ data: Array<{ id: string }> } | { data: string[] }
		>("/models", {
			method: "GET",
			headers,
		});

		if (response.error || !response.data) {
			return {
				data: null,
				error: response.error,
				headers: response.headers,
			};
		}

		// Handle OpenAI format { object: "list", data: [{ id: "..." }] }
		let models: string[] = [];
		if (response.data.data && Array.isArray(response.data.data)) {
			models = (response.data.data as Array<{ id: string }>).map((m) => m.id);
		} else if (Array.isArray(response.data)) {
			// Fallback for simple arrays
			models = response.data;
		}

		return {
			data: models,
			error: null,
			headers: response.headers,
		};
	}

	// Utility Methods

	/**
	 * Roughly estimates the number of tokens in a text string.
	 * Uses a simple heuristic: 1 token ~= 4 characters.
	 */
	countTokens(text: string): number {
		return Math.ceil(text.length / 4);
	}

	/**
	 * Estimates the cost implementation.
	 * This is a placeholder as cost depends on model-specific pricing.
	 */
	estimateCost(options: {
		model: string;
		inputTokens: number;
		outputTokens: number;
	}): number {
		// Placeholder rates
		const rates: Record<string, { input: number; output: number }> = {
			"frontal-ai-fast": { input: 0.000001, output: 0.000002 }, // per token
			default: { input: 0.00001, output: 0.00003 },
		};
		const rate = rates[options.model] || rates.default;
		return (
			options.inputTokens * rate.input + options.outputTokens * rate.output
		);
	}

	// Step Tracking
	private currentStep = 0;

	stepCountIs(count: number): void {
		this.currentStep = count;
	}

	getCurrentStep(): number {
		return this.currentStep;
	}

	resetSteps(): void {
		this.currentStep = 0;
	}

	// Prompt Management using local registry for this instance
	private prompts: Map<string, Prompt> = new Map();

	createPrompt(options: {
		name: string;
		template: string;
		variables: Record<string, VariableDefinition>;
		metadata?: Record<string, unknown>;
	}): Prompt {
		const prompt: Prompt = {
			...options,
			version: "1.0.0", // Default version
		};
		this.prompts.set(options.name, prompt);
		return prompt;
	}

	getPrompt(name: string, version?: string): APIResponse<Prompt> {
		const prompt = this.prompts.get(name);
		if (!prompt) {
			return {
				data: null,
				error: {
					message: `Prompt not found: ${name}`,
					statusCode: 404,
					name: "not_found",
				},
				headers: null,
			};
		}
		// Versioning logic is simplified here (only tracking one version in map for now)
		if (version && prompt.version !== version) {
			// In a real system, we might fetch from backend or history
			console.warn(`Requested version ${version} but found ${prompt.version}`);
		}
		return { data: prompt, error: null, headers: null };
	}

	updatePrompt(name: string, updates: Partial<Prompt>): APIResponse<Prompt> {
		const response = this.getPrompt(name);
		if (response.error || !response.data) {
			return response;
		}
		const prompt = response.data;
		const updatedPrompt = { ...prompt, ...updates };
		this.prompts.set(name, updatedPrompt);
		return { data: updatedPrompt, error: null, headers: null };
	}

	chainPrompts(...prompts: Prompt[]): PromptChain {
		return { prompts };
	}

	// Tool System
	private tools: Map<string, Tool> = new Map();

	defineTool<TParams, TResult>(options: {
		name: string;
		description: string;
		parameters: z.ZodSchema<TParams> | Record<string, unknown>;
		execute: (params: TParams) => Promise<TResult>;
	}): Tool<TParams, TResult> {
		return options;
	}

	registerTool(tool: Tool): void {
		if (this.tools.has(tool.name)) {
			console.warn(`Overwriting existing tool: ${tool.name}`);
		}
		this.tools.set(tool.name, tool);
	}

	getTools(): Tool[] {
		return Array.from(this.tools.values());
	}

	async executeTool(
		name: string,
		params: unknown,
	): Promise<APIResponse<unknown>> {
		const tool = this.tools.get(name);
		if (!tool) {
			return {
				data: null,
				error: {
					message: `Tool not found: ${name}`,
					statusCode: 404,
					name: "not_found",
				},
				headers: null,
			};
		}
		try {
			let result: unknown;
			if (tool.parameters instanceof z.ZodType) {
				const validatedParams = tool.parameters.parse(params);
				result = await tool.execute(validatedParams);
			} else {
				result = await tool.execute(params);
			}
			return { data: result, error: null, headers: null };
		} catch (error) {
			return {
				data: null,
				error: {
					message:
						error instanceof Error ? error.message : "Tool execution failed",
					statusCode: 500,
					name: "execution_error",
				},
				headers: null,
			};
		}
	}

	private handleValidationErrors(error: unknown): APIResponse<never> {
		if (error instanceof z.ZodError) {
			return {
				data: null,
				error: {
					message: error.message,
					statusCode: 400,
					name: "validation_error",
				},
				headers: null,
			};
		}
		throw error;
	}
}
