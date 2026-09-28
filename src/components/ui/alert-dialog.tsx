"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { cn } from "cn";
import { Button } from "~/components/ui/button";

const AlertDialog = ({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) => {
	return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
};

const AlertDialogTrigger = ({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) => {
	return (
		<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
	);
};

const AlertDialogPortal = ({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) => {
	return (
		<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
	);
};

const AlertDialogOverlay = ({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) => {
	return (
		<AlertDialogPrimitive.Overlay
			data-slot="alert-dialog-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
				className,
			)}
			{...props}
		/>
	);
};

const AlertDialogContent = ({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) => {
	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				data-slot="alert-dialog-content"
				className={cn(
					"fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
					className,
				)}
				{...props}
			/>
		</AlertDialogPortal>
	);
};

const AlertDialogHeader = ({
	className,
	...props
}: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="alert-dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
};

const AlertDialogFooter = ({
	className,
	...props
}: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="alert-dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
};

const AlertDialogTitle = ({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) => {
	return (
		<AlertDialogPrimitive.Title
			data-slot="alert-dialog-title"
			className={cn("text-lg font-semibold", className)}
			{...props}
		/>
	);
};

const AlertDialogDescription = ({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) => {
	return (
		<AlertDialogPrimitive.Description
			data-slot="alert-dialog-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
};

const AlertDialogAction = ({
	className,
	variant = "default",
	size = "default",
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
	Pick<React.ComponentProps<typeof Button>, "variant" | "size">) => {
	return (
		<Button variant={variant} size={size} asChild>
			<AlertDialogPrimitive.Action
				data-slot="alert-dialog-action"
				className={cn(className)}
				{...props}
			/>
		</Button>
	);
};

const AlertDialogCancel = ({
	className,
	variant = "outline",
	size = "default",
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
	Pick<React.ComponentProps<typeof Button>, "variant" | "size">) => {
	return (
		<Button variant={variant} size={size} asChild>
			<AlertDialogPrimitive.Cancel
				data-slot="alert-dialog-cancel"
				className={cn(className)}
				{...props}
			/>
		</Button>
	);
};

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
};
