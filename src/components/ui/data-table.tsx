"use client";

import {
	Column,
	ColumnDef,
	flexRender,
	getCoreRowModel,
	RowData,
	Table as TSTable,
	TableFeature,
	useReactTable,
	Cell,
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
	interface ColumnMeta<TData extends RowData, TValue> {
		columnClassName?: string;
		primary?: boolean;
		getHref?: (
			cell: Cell<TData, TValue>,
		) => React.ComponentPropsWithoutRef<typeof Link>["href"];
	}
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export const DataTable = <TData, TValue,>({
	columns,
	data,
}: DataTableProps<TData, TValue>) => {
	"use no memo";
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
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
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
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
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => {
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
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</Link>
											) : (
												flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)
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
