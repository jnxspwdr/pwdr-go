import { SignInForm } from "~/components/sign-in-form";
import { authStore } from "~/store.auth";

export default async function SignInPage() {
	console.log(authStore.getState().user);

	return (
		<main className="grid place-content-center h-svh overflow-x-clip">
			<SignInForm />
		</main>
	);
}
