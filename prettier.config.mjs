/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	plugins: ["prettier-plugin-tailwindcss"],
	tailwindStylesheet: "./src/app/globals.css",
	tailwindFunctions: ["tw"],
};

export default config;
