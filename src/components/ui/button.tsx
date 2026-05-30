import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
	cn(
		"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring aria-invalid:border-destructive",
		"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
	),
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/80 focus-visible:ring-primary/80",
				primary:
					"bg-indigo-600 text-zinc-50 shadow-xs hover:bg-indigo-700 focus-visible:ring-indigo-700",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 focus-visible:ring-secondary/80",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/80 dark:bg-destructive/60 focus-visible:ring-destructive/80 dark:focus-visible:ring-destructive/60",
				outline:
					"border bg-background shadow-xs hover:text-accent-foreground hover:bg-background-accent focus-visible:ring-background-accent",
				ghost:
					"hover:bg-background-accent hover:text-accent-foreground focus-visible:ring-accent-foreground/80",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				"icon-sm": "size-8",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	type = "button",
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			type={type}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
