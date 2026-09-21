"use client";

import {
	Cell,
	ColumnDef,
	RowData,
	tableFeatures,
	TableFeatures,
	useTable,
} from "@tanstack/react-table";
import Link from "next/link";
import React from "react";
import { cn } from "~/lib/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table";

declare module "@tanstack/react-table" {
	interface ColumnMeta<
		TFeatures extends TableFeatures,
		TData extends RowData,
		TValue,
	> {
		columnClassName?: string;
		primary?: boolean;
		getHref?: (
			cell: Cell<TFeatures, TData, TValue>,
		) => React.ComponentPropsWithoutRef<typeof Link>["href"];
	}
}

export const dataTableFeatures = tableFeatures({});

interface DataTableProps<TData extends RowData> {
	columns: ColumnDef<typeof dataTableFeatures, TData>[];
	data: TData[];
}

export const DataTable = <TData extends RowData,>({
	columns,
	data,
}: DataTableProps<TData>) => {
	const table = useTable({
		features: dataTableFeatures,
		data,
		columns,
	});

	return (
		<div className="rounded-md border">
			<Table className="[--cell-min-width:--spacing(32)]">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										className={cn(
											"min-w-(--cell-min-width)",
											header.column.columnDef.meta?.columnClassName,
										)}
										key={header.id}
									>
										{header.isPlaceholder ? null : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getAllCells().map((cell) => {
									return (
										<TableCell
											className={cn(
												"min-w-(--cell-min-width)",
												cell.column.columnDef.meta?.primary && "w-full",
												cell.column.columnDef.meta?.columnClassName,
											)}
											key={cell.id}
										>
											{cell.column.columnDef.meta?.getHref ? (
												<Link
													className="hover:underline"
													href={cell.column.columnDef.meta?.getHref(cell)}
												>
													<table.FlexRender cell={cell} />
												</Link>
											) : (
												<table.FlexRender cell={cell} />
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
