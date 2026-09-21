"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getInitials } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/shared";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { DataTable, dataTableFeatures } from "~/ui/data-table";

type User = RouterOutputs["users"]["list"][number];

export const UsersTable = ({ users }: { users: User[] }) => {
	const columns: ColumnDef<typeof dataTableFeatures, User>[] = [
		{
			accessorKey: "image",
			header: "",
			cell: ({ row }) => (
				<Avatar>
					<AvatarImage src={row.original.image ?? ""} alt={row.original.name} />
					<AvatarFallback>
						{getInitials(row.original.firstName, row.original.lastName)}
					</AvatarFallback>
				</Avatar>
			),
			meta: {
				fitContent: true,
			},
		},
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
