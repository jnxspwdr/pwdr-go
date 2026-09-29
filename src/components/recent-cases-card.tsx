"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	type Ticket,
	ticketStatusColumn,
	ticketTitleColumn,
} from "~/components/tickets-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { DataTable, dataTableFeatures, useDataTable } from "~/ui/data-table";

const columns: ColumnDef<typeof dataTableFeatures, Ticket>[] = [
	ticketTitleColumn,
	ticketStatusColumn,
];

export const RecentCasesCard = ({ tickets }: { tickets: Ticket[] }) => {
	const table = useDataTable({ columns, data: tickets });

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent cases</CardTitle>
			</CardHeader>
			<CardContent>
				<DataTable table={table} />
			</CardContent>
		</Card>
	);
};
