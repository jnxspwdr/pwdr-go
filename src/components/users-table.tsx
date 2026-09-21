"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { RouterOutputs } from "~/trpc/shared";
import { DataTable, dataTableFeatures } from "~/ui/data-table";

type User = RouterOutputs["users"]["list"][number];

export const UsersTable = ({ users }: { users: User[] }) => {
	const columns: ColumnDef<typeof dataTableFeatures, User>[] = [
		{
			accessorKey: "name",
			header: "Name",
			meta: {
				primary: true,
				getHref: (cell) => `/users/${cell.row.original.id}`,
			},
		},
	];

	return <DataTable columns={columns} data={users} />;
};
