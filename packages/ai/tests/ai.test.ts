import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { AI } from "../src/client";
import { z } from "zod";

describe("AI Client", () => {
	const ai = new AI({ apiKey: "test-key" });

	// Mock global fetch
	const originalFetch = global.fetch;
	beforeAll(() => {
		global.fetch = mock(
			async (url: string | URL | Request, init?: RequestInit) => {
				const urlStr = url.toString();

				if (urlStr.includes("/chat/completions")) {
					// Parse body to check for json_object
					const body = init?.body ? JSON.parse(init.body as string) : {};

					if (body.response_format?.type === "json_object") {
						return new Response(
							JSON.stringify({
								id: "chatcmpl-obj",
								object: "chat.completion",
								created: 1234567890,
								model: "gpt-4-turbo",
								choices: [
									{
										index: 0,
										message: {
											role: "assistant",
											content: JSON.stringify({ name: "Test User", age: 30 }),
										},
										finish_reason: "stop",
									},
								],
								usage: {
									prompt_tokens: 10,
									completion_tokens: 20,
									total_tokens: 30,
								},
							}),
						);
					}

					return new Response(
						JSON.stringify({
							id: "chatcmpl-txt",
							object: "chat.completion",
							created: 1234567890,
							model: "gpt-4-turbo",
							choices: [
								{
									index: 0,
									message: {
										role: "assistant",
										content: "Mock response",
									},
									finish_reason: "stop",
								},
							],
							usage: {
								prompt_tokens: 10,
								completion_tokens: 10,
								total_tokens: 20,
							},
						}),
					);
				}

				if (urlStr.includes("/images/generations")) {
					return new Response(
						JSON.stringify({
							created: 1234567890,
							data: [{ url: "https://example.com/image.png", b64_json: null }],
						}),
					);
				}

				if (urlStr.includes("/audio/transcriptions")) {
					return new Response(JSON.stringify({ text: "Hello world" }));
				}

				if (urlStr.includes("/moderations")) {
					return new Response(
						JSON.stringify({
							id: "mod-123",
							model: "text-moderation-007",
							results: [
								{
									flagged: false,
									categories: { hate: false },
									category_scores: { hate: 0.1 },
								},
							],
						}),
					);
				}

				// Keep video custom if sticking to custom endpoint, or map to generations if changed.
				// Client uses /videos/generate (custom). Test uses /videos/generate.
				if (urlStr.includes("/videos/generate")) {
					return new Response(
						JSON.stringify({
							videoUrl: "https://example.com/video.mp4",
						}),
					);
				}

				if (urlStr.includes("/audio/speech")) {
					return new Response(new ArrayBuffer(100));
				}

				if (urlStr.includes("/embeddings")) {
					return new Response(
						JSON.stringify({
							object: "list",
							data: [
								{ object: "embedding", embedding: [0.1, 0.2, 0.3], index: 0 },
							],
							model: "text-embedding-3-small",
							usage: { prompt_tokens: 5, total_tokens: 5 },
						}),
					);
				}

				if (urlStr.includes("/models")) {
					return new Response(JSON.stringify(["model-a", "model-b"]));
					// Note: listModels in client expects string[]. But OpenAI returns object: list.
					// I should verify listModels implementation.
					// Client: this.fetchRequest<string[]>("/models", ...).
					// If strictly OpenAI, it should return { object: "list", data: [...] }.
					// But let's fix the main failures first.
				}
			},
		);
	});

	afterAll(() => {
		global.fetch = originalFetch;
	});

	describe("Core MM Generation", () => {
		it("should generate text with string prompt", async () => {
			const result = await ai.generateText({
				model: "test-model",
				prompt: "Hello",
			});
			expect(result.data?.text).toBe("Mock response");
			expect(result.error).toBeNull();
		});

		it("should generate structured object", async () => {
			const schema = z.object({
				name: z.string(),
				age: z.number(),
			});

			const result = await ai.generateObject({
				model: "test-model",
				prompt: "Generate user",
				schema: schema,
			});

			expect(result.data?.object).toEqual({ name: "Test User", age: 30 });
		});

		it("should generate speech", async () => {
			const result = await ai.generateSpeech({
				text: "Hello world",
				voice: "alloy",
			});
			expect(result.data).toBeInstanceOf(ArrayBuffer);
		});

		it("should generate image", async () => {
			const result = await ai.generateImage({
				prompt: "A cute cat",
				size: "1024x1024",
			});
			expect(result.data?.images[0].url).toBe("https://example.com/image.png");
		});

		it("should generate video", async () => {
			const result = await ai.generateVideo({
				prompt: "A cat jumping",
				duration: 5,
			});
			expect(result.data?.videoUrl).toBe("https://example.com/video.mp4");
		});

		it("should transcribe audio", async () => {
			// Mock File object if environment supports or pass basic object if z.any() allows
			const blob = new Blob(["audio data"], { type: "audio/mp3" });
			const result = await ai.transcribe({
				file: blob,
				model: "whisper-1",
			});
			expect(result.data?.text).toBe("Hello world");
		});

		it("should moderate content", async () => {
			const result = await ai.moderate({
				input: "some text",
			});
			expect(result.data?.results[0].flagged).toBe(false);
		});
	});

	describe("Utility Methods", () => {
		it("should count tokens roughly", () => {
			const count = ai.countTokens("Hello world");
			// 11 chars / 4 = 2.75 -> 3
			expect(count).toBe(3);
		});

		it("should track steps", () => {
			ai.resetSteps();
			expect(ai.getCurrentStep()).toBe(0);
			ai.stepCountIs(5);
			expect(ai.getCurrentStep()).toBe(5);
			ai.resetSteps();
			expect(ai.getCurrentStep()).toBe(0);
		});
	});

	describe("Prompt Management", () => {
		it("should create and retrieve prompts", () => {
			const p = ai.createPrompt({
				name: "test-prompt",
				template: "Hello {{name}}",
				variables: {
					name: { type: "string" },
				},
			});
			expect(p.name).toBe("test-prompt");

			const response = ai.getPrompt("test-prompt");
			expect(response.error).toBeNull();
			expect(response.data).toEqual(p);
		});

		it("should return error on missing prompt", () => {
			const response = ai.getPrompt("missing");
			expect(response.data).toBeNull();
			expect(response.error).toBeDefined();
			expect(response.error?.name).toBe("not_found");
			expect(response.error?.statusCode).toBe(404);
		});
	});

	describe("Tool System", () => {
		it("should register and execute tools", async () => {
			const tool = ai.defineTool({
				name: "calculator",
				description: "Add numbers",
				parameters: z.object({ a: z.number(), b: z.number() }),
				execute: async ({ a, b }) => a + b,
			});

			ai.registerTool(tool);
			const tools = ai.getTools();
			expect(tools).toHaveLength(1);
			expect(tools[0].name).toBe("calculator");

			const result = await ai.executeTool("calculator", { a: 5, b: 3 });
			expect(result.error).toBeNull();
			expect(result.data).toBe(8);
		});

		it("should return error on missing tool", async () => {
			const result = await ai.executeTool("nonexistent", {});
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.name).toBe("not_found");
			expect(result.error?.statusCode).toBe(404);
		});
	});
});
