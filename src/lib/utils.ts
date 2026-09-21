import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export const shuffle = <T>(array: Array<T>) => {
	const newArray = array;

	let currentIndex = newArray.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[newArray[currentIndex], newArray[randomIndex]] = [
			newArray[randomIndex],
			newArray[currentIndex],
		];
	}

	return newArray;
};

export const randInt = (opts?: { min?: number; max?: number }) => {
	const min = opts?.min ?? 0;
	const max = opts?.max ?? 10;

	return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getInitials = (firstName: string, lastName?: string | null) => {
	const first = firstName.trim().at(0) ?? "";
	const last = lastName?.trim().at(0) ?? "";

	return `${first}${last}`.toUpperCase();
};
