import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { RecentCasesCard } from "~/components/recent-cases-card";
import { WelcomeCard } from "~/components/welcome-card";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");

	const recentTickets = await api.tickets.list({ limit: 5 });

	return (
		<>
			<ServerCrumbs crumbs={[{ title: "dashboard" }]} />
			<div className="grid grid-cols-1 gap-(--card-gap) [--card-gap:--spacing(4)] @2xl:grid-cols-2">
				<div className="flex flex-col gap-(--card-gap)">
					<WelcomeCard user={session.user} />
				</div>
				<div className="flex flex-col gap-(--card-gap)">
					<RecentCasesCard tickets={recentTickets} />
				</div>
			</div>
		</>
	);
}
