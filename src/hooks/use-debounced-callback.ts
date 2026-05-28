import React from "react";

export const useDebouncedCallback = (
	func: (...args: unknown[]) => void,
	delay: number
) => {
	const timeout = React.useRef<NodeJS.Timeout>(undefined);

	return React.useCallback(
		(...args: unknown[]) => {
			const later = () => {
				clearTimeout(timeout.current);
				func(...args);
			};

			clearTimeout(timeout.current);
			timeout.current = setTimeout(later, delay);
		},
		[func, delay]
	);
};
