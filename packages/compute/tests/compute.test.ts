import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { Compute } from "../src/client";
import { createService, listServices } from "../src/api";

describe("Compute Client", () => {
	it("should initialize correctly", () => {
		const compute = new Compute({ apiKey: "test" });
		expect(compute).toBeDefined();
	});

	it("should validate service configuration", async () => {
		const compute = new Compute({ apiKey: "test" });

		// Invalid CPU (must be positive)
		const result = await compute.createService({
			name: "test",
			image: "test",
			cpu: -1,
			memory: 128,
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

				if (urlStr.includes("/compute/services")) {
					// listServices: GET /compute/services
					return new Response(
						JSON.stringify([
							{
								id: "svc-1",
								name: "test-service",
								image: "nginx",
								cpu: 1,
								memory: 256,
								status: "running",
								createdAt: "2024-01-01T00:00:00.000Z",
								updatedAt: "2024-01-01T00:00:00.000Z",
							},
						]),
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

		it("should return services on listServices", async () => {
			const compute = new Compute({ apiKey: "test" });
			const result = await compute.listServices();
			expect(result.error).toBeNull();
			expect(result.data).toHaveLength(1);
			expect(result.data?.[0].id).toBe("svc-1");
			expect(result.data?.[0].name).toBe("test-service");
		});
	});

	describe("error mapping", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(
				async (url: string | URL | Request, init?: RequestInit) => {
					const urlStr = url.toString();
					const method = (init as RequestInit)?.method ?? "GET";

					if (urlStr.includes("/compute/services") && method === "POST") {
						return new Response(
							JSON.stringify({
								message: "Image not found",
								statusCode: 404,
								name: "not_found",
							}),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					return new Response(
						JSON.stringify([
							{
								id: "svc-1",
								name: "test",
								image: "test",
								cpu: 1,
								memory: 128,
								status: "running",
								createdAt: "2024-01-01T00:00:00.000Z",
								updatedAt: "2024-01-01T00:00:00.000Z",
							},
						]),
						{ headers: { "Content-Type": "application/json" } },
					);
				},
			);
		});

		afterAll(() => {
			global.fetch = originalFetch;
		});

		it("should map 4xx errors on createService", async () => {
			const compute = new Compute({ apiKey: "test" });
			const result = await compute.createService({
				name: "test",
				image: "nonexistent",
				cpu: 1,
				memory: 128,
			});
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.statusCode).toBe(404);
			expect(result.error?.message).toBe("Image not found");
		});
	});
});

describe("Compute Functional API", () => {
	it("should be defined", () => {
		expect(createService).toBeDefined();
		expect(listServices).toBeDefined();
	});
});
