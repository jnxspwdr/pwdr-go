"use client";

import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "cn";

// Set by CommandDialog so CommandItem can auto-close the dialog on select.
// Plain Command usage (no dialog) leaves this null and skips auto-close.
const CommandDialogCloseContext = React.createContext<(() => void) | null>(
	null,
);

const Command = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) => {
	return (
		<CommandPrimitive
			data-slot="command"
			className={cn(
				"flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
				className,
			)}
			{...props}
		/>
	);
};

const CommandDialog = ({
	title = "Command Palette",
	description = "Type a dommand or search...",
	children,
	className,
	hideCloseButton = true,
	onOpenChange,
	...props
}: React.ComponentProps<typeof Dialog> & {
	title?: string;
	description?: string;
	className?: string;
	hideCloseButton?: boolean;
}) => {
	const close = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);

	return (
		<Dialog onOpenChange={onOpenChange} {...props}>
			<DialogHeader className="sr-only">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn("overflow-hidden border-0 bg-border p-1", className)}
				hideCloseButton={hideCloseButton}
			>
				<CommandDialogCloseContext.Provider value={close}>
					<Command>{children}</Command>
				</CommandDialogCloseContext.Provider>
			</DialogContent>
		</Dialog>
	);
};

const CommandInput = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) => {
	return (
		<div
			data-slot="command-input-wrapper"
			className="flex h-10 items-center gap-2 border-b px-3"
		>
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				data-slot="command-input"
				className={cn(
					"flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</div>
	);
};

const CommandList = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn(
				"max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto",
				className,
			)}
			{...props}
		/>
	);
};

const CommandEmpty = ({
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className="py-6 text-center text-sm"
			{...props}
		/>
	);
};

const CommandGroup = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) => {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				"overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
};

const CommandSeparator = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) => {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cn("-mx-1 h-px bg-border", className)}
			{...props}
		/>
	);
};

const CommandItem = ({
	className,
	onSelect,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => {
	// Auto-close the enclosing CommandDialog (if any) on select, after the
	// item's own onSelect runs.
	const closeDialog = React.useContext(CommandDialogCloseContext);

	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				"group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
				className,
			)}
			onSelect={
				closeDialog
					? (value) => {
							onSelect?.(value);
							closeDialog();
						}
					: onSelect
			}
			{...props}
		/>
	);
};

const CommandShortcut = ({
	className,
	...props
}: React.ComponentProps<"kbd">) => {
	return (
		<kbd
			className={cn(
				"pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-xs font-medium text-muted-foreground select-none group-data-[slot='command-item']/command-item:ml-auto [&_svg:not([class*='size-'])]:size-3",
				className,
			)}
			{...props}
		/>
	);
};

export const CommandFooter = ({
	className,
	...props
}: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="command-footer"
			className={cn("border-t p-2 text-xs text-muted-foreground", className)}
			{...props}
		/>
	);
};

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
