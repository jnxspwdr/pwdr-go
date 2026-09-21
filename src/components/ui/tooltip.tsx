"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "cn";

const TooltipProvider = ({
	delayDuration = 0,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	);
};

const Tooltip = ({
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
	return (
		<TooltipProvider>
			<TooltipPrimitive.Root data-slot="tooltip" {...props} />
		</TooltipProvider>
	);
};

const TooltipTrigger = ({
	className,
	type = "button",
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => {
	return (
		<TooltipPrimitive.Trigger
			className={cn(
				"shrink-0 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			data-slot="tooltip-trigger"
			type={type}
			{...props}
		/>
	);
};

const TooltipContent = ({
	className,
	sideOffset = 0,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					"z-50 mb-1 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md border bg-background px-3 py-1.5 text-xs text-balance text-primary-foreground fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					className,
				)}
				{...props}
			>
				{children}
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
