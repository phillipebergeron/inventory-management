---
name: saas-redesign
description: Redesign a Vue 3 application's UI into a modern SaaS-style interface with a collapsible left sidebar instead of a top nav, a consistent spacing scale, and a polished look using Tailwind. Use this skill when asked to redesign, modernize, or restyle a Vue 3 app, add sidebar navigation, or give the UI a SaaS look.
---

# SaaS UI Redesign (Vue 3 + Tailwind)

Redesign in phases: audit, propose, apply, verify. Never edit before the user approves the proposal in Phase 1.

Visual changes only. Behavior must be preserved.

## Guardrails

- Do not change routes, API calls, filter/composable logic, i18n keys (`t()` calls), or chart SVG logic.
- No emojis in the UI. Use inline SVG icons; do not add an icon library.
- Delegate every `.vue` creation or significant edit to the `vue-expert` subagent.
- Do not modify `client/.npmrc`. Keep `client/package-lock.json` gitignored. Before finishing, run `git diff` and confirm no registry URLs or lockfile changes are included. The repo is public.
- Keep the existing palette (slate/gray base, green/blue/yellow/red status colors) unless the user asks otherwise.
- Run the `code-reviewer` subagent at the end.

## Phase 0: Audit (read-only)

Locate and report:

- Router setup (`main.js` or `router/`): the routes that become sidebar items.
- Root layout (`App.vue`): the current top nav, global styles, and layout wrapper.
- Global versus scoped CSS: where styles live and which hard-coded colors repeat.
- Shared components rendered outside routes (filter bars, language switchers, profile menus, modals).
- Sticky or fixed offsets tied to the old nav height (for example `top: 70px`).
- Dropdowns that open downward from the header and need to move.
- Whether a UI or CSS library already exists, and whether any `@media` rules exist.
- The Vite version, to check Tailwind compatibility.

Finish with a short list of the files that will change.

## Phase 1: Propose (wait for approval)

Present a short plan covering:

- Design tokens: palette, spacing scale (4/8-based), radii, shadows. See `reference/tokens.md`.
- Sidebar items, taken from the router, with an icon for each.
- Where header-level controls go (language switcher, profile menu), and where a global filter bar goes.
- A per-view polish checklist.
- Risks: Tailwind preflight resetting existing global styles, and conflicts between scoped CSS and utilities.

Do not continue until the user approves.

## Phase 2: Foundation (Tailwind)

1. Check that the Tailwind v4 Vite plugin supports the project's Vite version. If not, tell the user and pick a compatible version.
2. `npm install tailwindcss @tailwindcss/vite` in the client directory. Use plain `npm install` only.
3. Register the plugin in `vite.config.js`.
4. Add one CSS entry (for example `src/assets/main.css`) with `@import "tailwindcss";` and an `@theme` block for the tokens. Import it in `main.js`.
5. Remove the old global reset only after confirming that preflight covers it.
6. Run `npm run build` and verify before moving on.

## Phase 3: Layout shell (delegate to vue-expert)

See `reference/sidebar-shell.md` for the skeleton.

- Root layout becomes a flex row: `<aside>` sidebar plus a content column holding the filter bar and `<router-view>`.
- Sidebar items come from the router. Highlight the active route and set `aria-current="page"`. Add visible focus styles.
- Logo and title sit at the top. Language switcher and profile menu go in the sidebar footer, with dropdowns opening upward or sideways.
- Collapse: a toggle shrinks the sidebar to an icon rail. Persist the state in `localStorage`, wrapped in try/catch, and render correctly if storage is unavailable.
- Mobile: below the `md` breakpoint the sidebar becomes an off-canvas drawer opened by a hamburger button. Include a backdrop, close on Esc, and close on route change.
- Update every sticky offset that referenced the old nav height. A filter bar becomes `top: 0` inside the content column.

## Phase 4: Per-view polish

Work one view at a time, converting each fully before starting the next:

- Standardize page header, card, stat card, table, and badge patterns on the shared tokens.
- Use a consistent spacing scale, a max content width, and responsive grids.
- Extract a shared component only when several views repeat the same pattern.

## Phase 5: Verify (after every phase)

- Run `npm run build`.
- With the Playwright MCP tools at `http://localhost:3000`, screenshot every route at about 1440px, 1024px, and 390px.
- Check the sidebar collapse and expand, the mobile drawer, dropdowns, and modals.
- Check the browser console for errors.
- Switch the language, if the app has i18n, and confirm the labels still fit.

Report any problems found and fix them before starting the next phase.
