import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { WelcomeCard } from "~/components/welcome-card";
import { auth } from "~/server/auth";

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");

	return (
		<>
			<ServerCrumbs crumbs={[{ title: "dashboard" }]} />
			<div className="grid grid-cols-1 gap-(--card-gap) [--card-gap:--spacing(4)] @2xl:grid-cols-2">
				<WelcomeCard user={session.user} />
			</div>
		</>
	);
}
