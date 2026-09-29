import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInForm } from "~/components/sign-in-form";
import { auth } from "~/server/auth";

export default async function SignInPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (session) redirect("/dashboard");

	return (
		<main className="grid h-svh place-content-center overflow-x-clip">
			<SignInForm />
		</main>
	);
}
