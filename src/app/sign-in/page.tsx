import { SignInForm } from "~/components/sign-in-form";

export default async function SignInPage() {
	return (
		<main className="grid h-svh place-content-center overflow-x-clip">
			<SignInForm />
		</main>
	);
}
