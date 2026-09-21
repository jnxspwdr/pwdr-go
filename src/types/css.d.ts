// Next only ships ambient declarations for `*.module.css` (see
// node_modules/next/types/global.d.ts). Plain stylesheet side-effect
// imports (e.g. `import "~/app/globals.css"`) have no such declaration,
// and TypeScript 6's stricter side-effect-import check (TS2882) now
// requires one even though nothing actually imports a named binding.
declare module "*.css";
