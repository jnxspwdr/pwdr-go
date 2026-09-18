import React from "react";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { UsersTable } from "~/components/users-table";
import { api } from "~/trpc/server";

export default async function UsersPage() {
	const users = await api.users.list();

	return (
		<>
			<ServerCrumbs crumbs={[{ title: "users" }]} />
			<React.Suspense fallback={<div>Loading...</div>}>
				<UsersTable users={users} />
			</React.Suspense>
		</>
	);
}
