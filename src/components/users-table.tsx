"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getInitials } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/shared";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Badge } from "~/ui/badge";
import { DataTable, dataTableFeatures, useDataTable } from "~/ui/data-table";
import { DataTableToolbar } from "~/ui/data-table-toolbar";

type User = RouterOutputs["users"]["list"][number];

const agreementVariant: Record<
	User["agreement"],
	React.ComponentPropsWithoutRef<typeof Badge>["variant"]
> = {
	"full time": "success",
	"part time": "info",
	"ad hoc": "warn",
};

export const UsersTable = ({ users }: { users: User[] }) => {
	const columns: ColumnDef<typeof dataTableFeatures, User>[] = [
		{
			accessorKey: "image",
			header: "Avatar",
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
				hideHeader: true,
			},
			enableGlobalFilter: false,
		},
		{
			accessorKey: "name",
			header: "Name",
			meta: {
				primary: true,
				getHref: (cell) => `/users/${cell.row.original.id}`,
			},
		},
		{
			accessorKey: "pronouns",
			header: "Pronouns",
			cell: ({ row }) => (
				<div className="flex flex-wrap gap-1">
					{row.original.pronouns.map((pronoun) => (
						<Badge key={pronoun} variant="outline">
							{pronoun}
						</Badge>
					))}
				</div>
			),
			meta: { fitContent: true },
			enableGlobalFilter: false,
		},
		{
			id: "title",
			accessorFn: (user) => `${user.jobTitle} ${user.jobSite}`,
			header: "Title",
			cell: ({ row }) => (
				<Badge variant="secondary">
					{row.original.jobTitle} · {row.original.jobSite}
				</Badge>
			),
			meta: { fitContent: true },
		},
		{
			accessorKey: "agreement",
			header: "Agreement",
			cell: ({ row }) => (
				<Badge variant={agreementVariant[row.original.agreement]}>
					{row.original.agreement}
				</Badge>
			),
			meta: { fitContent: true },
		},
	];

	const table = useDataTable({
		columns,
		data: users,
		initialState: { columnVisibility: { agreement: false } },
	});

	return (
		<div className="space-y-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Search users..."
				exportFileName="users"
			/>
			<DataTable table={table} />
		</div>
	);
};
