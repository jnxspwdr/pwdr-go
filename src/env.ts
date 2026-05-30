import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
	server: {
		ENV_FAKER_SEED: z.coerce.number().optional(),
	},
	runtimeEnv: {
		ENV_FAKER_SEED: process.env.ENV_FAKER_SEED,
	},
});
