import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { Logger } from "../src/logger";

describe("Logger", () => {
	it("should initialize with default config", () => {
		const logger = new Logger();
		expect(logger).toBeDefined();
	});

	it("should validate metadata schemas", () => {
		const logger = new Logger({ apiKey: "test" });

		// Valid log with metadata
		expect(() => {
			logger.info("test", { valid: true });
		}).not.toThrow();
	});

	it("should return result object for raw log", async () => {
		const logger = new Logger({ apiKey: "test" });
		const result = await logger.log({
			level: "info",
			message: "test",
			timestamp: new Date().toISOString(),
		});
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("error");
	});

	it("should not call fetch when localOnly is true", async () => {
		const logger = new Logger({ apiKey: "test", localOnly: true });
		const result = await logger.log({
			level: "info",
			message: "local-only test",
			timestamp: new Date().toISOString(),
		});
		expect(result.error).toBeNull();
		expect(result.data).toBeNull();
		expect(result.headers).toBeNull();
	});

	describe("success paths with mocked fetch", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async (url: string | URL | Request) => {
				const urlStr = url.toString();

				if (urlStr.includes("/logging/entries")) {
					return new Response(null, { status: 204 });
				}

				if (urlStr.includes("/logging/query")) {
					return new Response(
						JSON.stringify([
							{
								level: "info",
								message: "test log",
								timestamp: "2024-01-01T00:00:00.000Z",
								metadata: { environment: "test" },
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

		it("should return success on log", async () => {
			const logger = new Logger({ apiKey: "test" });
			const result = await logger.log({
				level: "info",
				message: "test",
				timestamp: new Date().toISOString(),
			});
			expect(result.error).toBeNull();
		});

		it("should return entries on query", async () => {
			const logger = new Logger({ apiKey: "test" });
			const result = await logger.query({ limit: 10 });
			expect(result.error).toBeNull();
			expect(result.data).toHaveLength(1);
			expect(result.data?.[0].message).toBe("test log");
		});
	});

	describe("error mapping", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async () => {
				return new Response(
					JSON.stringify({
						message: "Unauthorized",
						statusCode: 401,
						name: "unauthorized",
					}),
					{
						status: 401,
						headers: { "Content-Type": "application/json" },
					},
				);
			});
		});

		afterAll(() => {
			global.fetch = originalFetch;
		});

		it("should map 4xx errors correctly", async () => {
			const logger = new Logger({ apiKey: "invalid" });
			const result = await logger.query({ limit: 10 });
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.statusCode).toBe(401);
			expect(result.error?.message).toBe("Unauthorized");
		});
	});
});
