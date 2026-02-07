import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { Storage } from "../src/client";
import { upload, list } from "../src/api";
import type { SignedUrlOptions } from "../src/types";

describe("Storage Client", () => {
	it("should initialize correctly", () => {
		const storage = new Storage({ apiKey: "test" });
		expect(storage).toBeDefined();
	});

	it("should validate signed URL options", async () => {
		const storage = new Storage({ apiKey: "test" });

		// Invalid expiresIn (must be positive)
		const result = await storage.getSignedUrl("test", {
			key: "test",
			operation: "read",
			expiresIn: -100,
		} as unknown as SignedUrlOptions);
		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.statusCode).toBe(400);
	});

	describe("success paths with mocked fetch", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(
				async (url: string | URL | Request, init?: RequestInit) => {
					const urlStr = url.toString();
					const method = (init as RequestInit)?.method ?? "GET";

					// getSignedUrl: POST /storage/bucket/sign returns url (check first, before /bucket)
					if (
						method === "POST" &&
						urlStr.includes("/storage/") &&
						urlStr.includes("/sign")
					) {
						return new Response(
							JSON.stringify("https://signed.example.com/url"),
							{ headers: { "Content-Type": "application/json" } },
						);
					}

					// Upload: PUT /storage/bucket/key returns 204
					if (
						urlStr.includes("/storage/") &&
						urlStr.includes("/bucket/") &&
						urlStr.includes("/key")
					) {
						return new Response(null, { status: 204 });
					}

					// List: GET /storage/bucket returns objects
					if (urlStr.includes("/storage/bucket") && !urlStr.includes("/key")) {
						return new Response(
							JSON.stringify({
								objects: [
									{
										key: "file1.txt",
										size: 100,
										contentType: "text/plain",
										lastModified: "2024-01-01T00:00:00.000Z",
										etag: "abc123",
									},
								],
								prefix: undefined,
								continuationToken: undefined,
							}),
							{ headers: { "Content-Type": "application/json" } },
						);
					}

					return new Response(
						JSON.stringify({ message: "Not found", statusCode: 404 }),
						{ status: 404, headers: { "Content-Type": "application/json" } },
					);
				},
			);
		});

		afterAll(() => {
			global.fetch = originalFetch;
		});

		it("should return success on upload (204)", async () => {
			const storage = new Storage({ apiKey: "test" });
			const result = await storage.upload(
				"bucket",
				"key",
				new Blob(["data"]),
				"application/octet-stream",
			);
			expect(result.data).toBeNull();
			expect(result.error).toBeNull();
		});

		it("should return objects on list", async () => {
			const storage = new Storage({ apiKey: "test" });
			const result = await storage.list("bucket");
			expect(result.error).toBeNull();
			expect(result.data?.objects).toHaveLength(1);
			expect(result.data?.objects[0].key).toBe("file1.txt");
		});

		it("should return signed URL on getSignedUrl", async () => {
			const storage = new Storage({ apiKey: "test" });
			const result = await storage.getSignedUrl("bucket", {
				key: "file.txt",
				operation: "read",
			});
			expect(result.error).toBeNull();
			expect(result.data).toBe("https://signed.example.com/url");
		});
	});

	describe("error mapping", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async (url: string | URL | Request) => {
				const urlStr = url.toString();

				if (urlStr.includes("/storage/error-bucket")) {
					return new Response(
						JSON.stringify({
							message: "Bucket not found",
							statusCode: 404,
							name: "not_found",
						}),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				if (urlStr.includes("/storage/server-error")) {
					return new Response(
						JSON.stringify({
							message: "Internal server error",
							statusCode: 500,
							name: "server_error",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				return new Response(null, { status: 204 });
			});
		});

		afterAll(() => {
			global.fetch = originalFetch;
		});

		it("should map 4xx errors correctly", async () => {
			const storage = new Storage({ apiKey: "test" });
			const result = await storage.list("error-bucket");
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.statusCode).toBe(404);
			expect(result.error?.message).toBe("Bucket not found");
			expect(result.error?.name).toBe("not_found");
		});

		it("should map 5xx errors correctly", async () => {
			const storage = new Storage({ apiKey: "test" });
			const result = await storage.list("server-error");
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.message).toBe("Internal server error");
		});
	});
});

describe("Storage Functional API", () => {
	it("should be defined", () => {
		expect(upload).toBeDefined();
		expect(list).toBeDefined();
	});
});
