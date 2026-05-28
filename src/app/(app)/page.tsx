import { redirect } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";

export default async function RootPage() {
	redirect("/dashboard");

	return <ServerCrumbs crumbs={null} />;
}
