"use server";

import path from "path";
import { promises as fs } from "fs";

export const localFetch = async (filePath: string) => {
	return await fs.readFile(
		path.join(process.cwd(), "src/data", filePath),
		"utf-8"
	);
};
