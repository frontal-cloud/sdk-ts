import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		FRONTAL_API_KEY: z.string().optional(),
		FRONTAL_API_URL: z.string().url().optional(),
		NODE_ENV: z.enum(["development", "test", "production"]).optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
