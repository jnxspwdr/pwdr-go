## PROJECT.md

`PROJECT.md` (repo root) describes this app's stack, data model, and
architecture. Whenever a change makes a section of it wrong — new/removed
route, router, table, column, script, env var, etc. — update that section
in the same change. Don't let it drift into describing an old version of
the app.

Before treating `PROJECT.md` as complete, check it actually documents each
config file's non-default options (`next.config.ts`, `tsconfig.json` path
aliases, `eslint.config.mjs`, `drizzle.config.ts`, `postcss.config.mjs`,
`components.json`, etc.) and every `package.json` script. If a config option
or script is missing from `PROJECT.md`, add it — don't assume silence means
"nothing to document."
