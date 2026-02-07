import { describe, expect, it } from "bun:test";
import { Flags } from "../src/client";
import { getFlag, listFlags } from "../src/api";

describe("Flags Client", () => {
	it("should initialize correctly", () => {
		const client = new Flags({ apiKey: "test" });
		expect(client).toBeDefined();
	});

	it("should return default value on network failure when defaultValue is provided", async () => {
		const client = new Flags({ apiKey: "test", baseUrl: "http://invalid" });
		const result = await client.getFlag("test-flag", false);
		expect(result.error).toBeNull();
		expect(result.data).toEqual({
			key: "test-flag",
			value: false,
			variant: "default",
			reason: "fallback",
		});
	});
});

describe("Flags Functional API", () => {
	it("should be defined", () => {
		expect(getFlag).toBeDefined();
		expect(listFlags).toBeDefined();
	});
});
