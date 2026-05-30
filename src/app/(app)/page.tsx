import { redirect } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";

export default async function RootPage() {
	if (localStorage.getItem("remember_me") === "true") {
		redirect("/dashboard");
	} else {
		redirect("/sign-in");
	}

	return null;
}
