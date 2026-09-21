declare const twBrand: unique symbol;

export type TwClass = string & { readonly [twBrand]: true };

export const tw = (
	strings: TemplateStringsArray,
	...values: never[]
): TwClass => strings.join("").replace(/\s+/g, " ").trim() as TwClass;
