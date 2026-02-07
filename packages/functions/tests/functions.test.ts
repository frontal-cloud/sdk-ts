import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { Functions } from "../src/client";
import { deployFunction, invoke, listFunctions } from "../src/api";

describe("Functions Client", () => {
	it("should initialize correctly", () => {
		const client = new Functions({ apiKey: "test" });
		expect(client).toBeDefined();
	});

	it("should validate function configuration", async () => {
		const client = new Functions({ apiKey: "test" });

		// Invalid memory (min 128)
		const result = await client.deployFunction({
			name: "test",
			runtime: "nodejs20",
			handler: "index.handler",
			memory: 64,
			timeout: 10,
		});
		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.statusCode).toBe(400);
	});

	describe("success paths with mocked fetch", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async (url: string | URL | Request) => {
				const urlStr = url.toString();

				if (urlStr.includes("/functions/list")) {
					return new Response(
						JSON.stringify([
							{
								id: "fn-1",
								name: "test-fn",
								runtime: "nodejs20",
								handler: "index.handler",
								memory: 256,
								timeout: 10,
								createdAt: "2024-01-01T00:00:00.000Z",
								updatedAt: "2024-01-01T00:00:00.000Z",
							},
						]),
						{ headers: { "Content-Type": "application/json" } },
					);
				}

				if (urlStr.includes("/functions/deploy")) {
					return new Response(
						JSON.stringify({
							id: "fn-1",
							name: "test-fn",
							runtime: "nodejs20",
							handler: "index.handler",
							memory: 256,
							timeout: 10,
							url: "https://fn.example.com/invoke",
							createdAt: "2024-01-01T00:00:00.000Z",
							updatedAt: "2024-01-01T00:00:00.000Z",
						}),
						{ headers: { "Content-Type": "application/json" } },
					);
				}

				return new Response(
					JSON.stringify({ message: "Not found", statusCode: 404 }),
					{ status: 404, headers: { "Content-Type": "application/json" } },
				);
			});
		});

		afterAll(() => {
			global.fetch = originalFetch;
		});

		it("should return function on deployFunction", async () => {
			const client = new Functions({ apiKey: "test" });
			const result = await client.deployFunction({
				name: "test-fn",
				runtime: "nodejs20",
				handler: "index.handler",
				memory: 256,
				timeout: 10,
			});
			expect(result.error).toBeNull();
			expect(result.data?.id).toBe("fn-1");
			expect(result.data?.name).toBe("test-fn");
		});

		it("should return functions on listFunctions", async () => {
			const client = new Functions({ apiKey: "test" });
			const result = await client.listFunctions();
			expect(result.error).toBeNull();
			expect(result.data).toHaveLength(1);
			expect(result.data?.[0].id).toBe("fn-1");
		});
	});

	describe("error mapping", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async () => {
				return new Response(
					JSON.stringify({
						message: "Function not found",
						statusCode: 404,
						name: "not_found",
					}),
					{
						status: 404,
						headers: { "Content-Type": "application/json" },
					},
				);
			});
		});

		afterAll(() => {
			global.fetch = originalFetch;
		});

		it("should map 4xx errors correctly", async () => {
			const client = new Functions({ apiKey: "test" });
			const result = await client.getFunction("nonexistent");
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.statusCode).toBe(404);
			expect(result.error?.message).toBe("Function not found");
		});
	});
});

describe("Functions Functional API", () => {
	it("should be defined", () => {
		expect(deployFunction).toBeDefined();
		expect(invoke).toBeDefined();
		expect(listFunctions).toBeDefined();
	});
});
