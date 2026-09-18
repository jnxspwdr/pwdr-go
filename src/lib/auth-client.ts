import {
	emailOTPClient,
	inferAdditionalFields,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "~/server/auth";

export const authClient = createAuthClient({
	plugins: [
		emailOTPClient(),
		organizationClient(),
		inferAdditionalFields<typeof auth>(),
	],
});

export const { useSession, signOut } = authClient;
