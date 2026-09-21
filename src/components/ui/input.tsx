import * as React from "react";

import { cn } from "cn";

const Input = ({
	className,
	type,
	...props
}: React.ComponentProps<"input">) => {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-9 w-full min-w-0 rounded-md bg-input px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground md:text-sm",
				"border border-input-accent focus-visible:border-ring",
				"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
				"aria-invalid:border-destructive aria-invalid:placeholder:text-destructive/80",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
};

export { Input };
