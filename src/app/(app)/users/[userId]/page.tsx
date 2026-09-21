import { notFound } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { api } from "~/trpc/server";

export default async function UserDetailsPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;

	const user = await api.users.byId({ id: userId }).catch(() => null);

	if (!user) notFound();

	return (
		<>
			<ServerCrumbs
				crumbs={[{ title: "users", href: "/users" }, { title: user.name }]}
			/>
			<div>{user.name}</div>
		</>
	);
}
