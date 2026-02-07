import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { Notifications } from "../src/client";
import { send, getStatus } from "../src/api";
import type { SendNotificationOptions } from "../src/types";

describe("Notifications Client", () => {
	it("should initialize correctly", () => {
		const client = new Notifications({ apiKey: "test" });
		expect(client).toBeDefined();
	});

	it("should validate send options", async () => {
		const client = new Notifications({ apiKey: "test" });

		// Invalid email
		const result1 = await client.send({
			recipient: { email: "not-an-email" },
			channels: ["email"],
			payload: { body: "test" },
		} as unknown as SendNotificationOptions);
		expect(result1.data).toBeNull();
		expect(result1.error).toBeDefined();
		expect(result1.error?.statusCode).toBe(400);

		// Empty channels
		const result2 = await client.send({
			recipient: { email: "test@example.com" },
			channels: [] as unknown as SendNotificationOptions["channels"],
			payload: { body: "test" },
		});
		expect(result2.data).toBeNull();
		expect(result2.error).toBeDefined();
		expect(result2.error?.statusCode).toBe(400);
	});

	describe("success paths with mocked fetch", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async (url: string | URL | Request) => {
				const urlStr = url.toString();

				if (urlStr.includes("/notifications/send")) {
					return new Response(
						JSON.stringify({
							id: "notif-1",
							status: "sent",
							channels: { email: "delivered" },
						}),
						{ headers: { "Content-Type": "application/json" } },
					);
				}

				if (urlStr.includes("/notifications/status/")) {
					return new Response(
						JSON.stringify({
							id: "notif-1",
							status: "delivered",
							channels: { email: "delivered" },
							createdAt: "2024-01-01T00:00:00.000Z",
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

		it("should return result on send", async () => {
			const client = new Notifications({ apiKey: "test" });
			const result = await client.send({
				recipient: { email: "user@example.com" },
				channels: ["email"],
				payload: { body: "Hello", subject: "Test" },
			});
			expect(result.error).toBeNull();
			expect(result.data?.id).toBe("notif-1");
			expect(result.data?.status).toBe("sent");
		});

		it("should return status on getStatus", async () => {
			const client = new Notifications({ apiKey: "test" });
			const result = await client.getStatus("notif-1");
			expect(result.error).toBeNull();
			expect(result.data?.id).toBe("notif-1");
			expect(result.data?.status).toBe("delivered");
		});
	});

	describe("error mapping", () => {
		const originalFetch = global.fetch;
		beforeAll(() => {
			global.fetch = mock(async () => {
				return new Response(
					JSON.stringify({
						message: "Notification not found",
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
			const client = new Notifications({ apiKey: "test" });
			const result = await client.getStatus("nonexistent");
			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.statusCode).toBe(404);
			expect(result.error?.message).toBe("Notification not found");
		});
	});
});

describe("Notifications Functional API", () => {
	it("should be defined", () => {
		expect(send).toBeDefined();
		expect(getStatus).toBeDefined();
	});
});
