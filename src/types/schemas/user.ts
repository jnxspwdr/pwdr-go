import { z } from "zod";

export const userSchema = z.object({
	id: z.ulid(),
	avatar: z.url(),
	firstName: z.string(),
	lastName: z.string(),
	fullName: z.string(),
	email: z.email(),
	phoneNumber: z.e164(),
});

export type User = z.infer<typeof userSchema>;
