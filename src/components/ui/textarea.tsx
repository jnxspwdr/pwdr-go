import * as React from "react";

import { cn } from "~/lib/utils";

const Textarea = ({ className, ...props }: React.ComponentProps<"textarea">) => {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content resize-none min-h-32 w-full rounded-md border border-input-accent bg-input px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring",
				"aria-invalid:border-destructive aria-invalid:placeholder:text-destructive/80",
				className,
			)}
			{...props}
		/>
	);
};

export { Textarea };
