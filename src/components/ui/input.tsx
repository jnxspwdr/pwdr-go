import * as React from "react";

import { cn } from "~/lib/utils";

const Input = ({ className, type, ...props }: React.ComponentProps<"input">) => {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md bg-input px-3 py-1 text-base shadow-xs transition-[color,box-shadow] md:text-sm outline-none",
				"border-input-accent border focus-visible:border-ring",
				"file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
				"aria-invalid:border-destructive aria-invalid:placeholder:text-destructive/80",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
};

export { Input };
