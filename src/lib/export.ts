const downloadFile = (filename: string, content: string, type: string) => {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

const escapeCsvCell = (value: unknown) => {
	const stringValue = value == null ? "" : String(value);

	return /[",\n]/.test(stringValue)
		? `"${stringValue.replace(/"/g, '""')}"`
		: stringValue;
};

export const downloadCsv = (
	filename: string,
	headers: string[],
	rows: unknown[][],
) => {
	const csv = [headers, ...rows]
		.map((row) => row.map(escapeCsvCell).join(","))
		.join("\n");

	downloadFile(filename, csv, "text/csv;charset=utf-8;");
};

export const downloadJson = (filename: string, records: object[]) => {
	downloadFile(filename, JSON.stringify(records, null, 2), "application/json");
};
