"use client";

import { useElementSize } from "@mantine/hooks";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { cn } from "cn";

const FieldSet = ({
	className,
	...props
}: React.ComponentProps<"fieldset">) => {
	return (
		<fieldset
			data-slot="field-set"
			className={cn(
				"flex flex-col gap-6",
				"has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
				className,
			)}
			{...props}
		/>
	);
};

const FieldLegend = ({
	className,
	variant = "legend",
	...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) => {
	return (
		<legend
			data-slot="field-legend"
			data-variant={variant}
			className={cn(
				"mb-3 font-medium",
				"data-[variant=legend]:text-base",
				"data-[variant=label]:text-sm",
				className,
			)}
			{...props}
		/>
	);
};

const FieldGroup = ({ className, ...props }: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="field-group"
			className={cn(
				"group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
				className,
			)}
			{...props}
		/>
	);
};

const fieldVariants = cva(
	cn(
		"group/field flex w-full gap-1 data-[invalid=true]:text-destructive relative has-[label[data-fancy='true']]:mt-(--label-height) [--label-height:24px]",
		"has-[input:focus-visible,textarea:focus-visible]:[&_[data-slot='field-label-wrapper']]:border-ring has-[input[aria-invalid='true'],textarea[aria-invalid='true']]:[&_[data-slot='field-label-wrapper']]:border-destructive",
		"has-[input:focus-visible]:[&_input,&_textarea,&_[data-slot='input-group']]:rounded-tl-none! has-[input[value]:not([value=''])]:[&,&_[data-slot='input-group']]:rounded-tl-none!",
	),
	{
		variants: {
			orientation: {
				vertical: ["flex-col [&>.sr-only]:w-auto"],
				horizontal: [
					"flex-row items-center",
					"[&>[data-slot=field-label]]:flex-auto",
					"has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
				],
				responsive: [
					"flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto",
					"@md/field-group:[&>[data-slot=field-label]]:flex-auto",
					"@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
				],
			},
		},
		defaultVariants: {
			orientation: "vertical",
		},
	},
);

const Field = ({
	className,
	orientation = "vertical",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) => {
	return (
		<div
			role="group"
			data-slot="field"
			data-orientation={orientation}
			className={cn(fieldVariants({ orientation }), className)}
			{...props}
		/>
	);
};

const FieldContent = ({ className, ...props }: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="field-content"
			className={cn(
				"group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
				className,
			)}
			{...props}
		/>
	);
};

const FieldLabel = ({
	className,
	disableFancy = false,
	children,
	...props
}: React.ComponentProps<typeof Label> & { disableFancy?: boolean }) => {
	const { ref, width: labelWidth } = useElementSize();

	const labelComponent = (
		<Label
			data-slot="field-label"
			data-fancy={!disableFancy}
			className={cn(
				"group/field-label peer/field-label z-20 px-3 flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
				!disableFancy &&
					"text-xs absolute top-1/2 -translate-y-1/2 group-has-[input:focus-visible]/field:-top-[10px] transition-[top] group-has-[input[value]:not([value=''])]/field:-top-[10px]",
				"has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
				"has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10",
				className,
			)}
			ref={ref}
			{...props}
		>
			{children}
		</Label>
	);

	return disableFancy ? (
		labelComponent
	) : (
		<>
			<div
				className={cn(
					"z-10 rounded-t-md left-0 bg-input w-fit border-input-accent border-b-0!",
					"absolute py-0 border-0 h-0 transition-[height] bottom-[calc(100%-1px)]",
					"group-has-[input:focus-visible]/field:h-(--label-height) group-has-[input:focus-visible]/field:border group-has-[input:focus-visible]/field:py-1",
					"group-has-[input[value]:not([value=''])]/field:h-(--label-height) group-has-[input[value]:not([value=''])]/field:border group-has-[input[value]:not([value=''])]/field:py-1",
				)}
				data-slot="field-label-wrapper"
				style={{
					width: `${labelWidth}px`,
				}}
			/>
			{labelComponent}
		</>
	);
};

const FieldTitle = ({ className, ...props }: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="field-label"
			className={cn(
				"flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
				className,
			)}
			{...props}
		/>
	);
};

const FieldDescription = ({
	className,
	...props
}: React.ComponentProps<"p">) => {
	return (
		<p
			data-slot="field-description"
			className={cn(
				"text-sm leading-normal font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance",
				"last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
				"[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
				className,
			)}
			{...props}
		/>
	);
};

const FieldSeparator = ({
	children,
	className,
	...props
}: React.ComponentProps<"div"> & {
	children?: React.ReactNode;
}) => {
	return (
		<div
			data-slot="field-separator"
			data-content={!!children}
			className={cn(
				"relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
				className,
			)}
			{...props}
		>
			<Separator className="absolute inset-0 top-1/2" />
			{children && (
				<span
					className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
					data-slot="field-separator-content"
				>
					{children}
				</span>
			)}
		</div>
	);
};

const FieldError = ({
	className,
	children,
	errors,
	...props
}: React.ComponentProps<"div"> & {
	errors?: Array<{ message?: string } | undefined>;
}) => {
	const content = React.useMemo(() => {
		if (children) {
			return children;
		}

		if (!errors?.length) {
			return null;
		}

		const uniqueErrors = [
			...new Map(errors.map((error) => [error?.message, error])).values(),
		];

		if (uniqueErrors?.length == 1) {
			return uniqueErrors[0]?.message;
		}

		return (
			<ul className="ml-4 flex list-disc flex-col gap-1">
				{uniqueErrors.map(
					(error, index) =>
						error?.message && <li key={index}>{error.message}</li>,
				)}
			</ul>
		);
	}, [children, errors]);

	if (!content) {
		return null;
	}

	return (
		<div
			role="alert"
			data-slot="field-error"
			className={cn("text-sm px-3 font-normal text-destructive", className)}
			{...props}
		>
			{content}
		</div>
	);
};

export {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
};
