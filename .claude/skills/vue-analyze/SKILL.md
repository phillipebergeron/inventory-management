---
name: vue-analyze
description: Analyze Vue 3 component structure and suggest performance and code-reuse optimizations. Use this skill when asked to audit, review, profile, or find duplication in Vue components, views, or composables, or to suggest what to extract or optimize.
---

# Vue Component Analysis (performance + reuse)

Analysis only. Produce a ranked report; do not edit files. Apply changes only after the user picks which findings to act on.

## Guardrails

- Read-only in Phase 1-3. No edits, no formatting passes.
- When the user approves fixes, delegate every `.vue` creation or significant edit to the `vue-expert` subagent (project rule), then run the `code-reviewer` subagent.
- Respect project conventions in CLAUDE.md: Composition API, unique `v-for` keys (never `index`), raw data in refs and derived data in computed, custom SVG charts, no emojis in UI.
- Every finding must cite `file:line` and be verified by reading the code. Do not report a pattern from grep alone.
- Do not suggest adding dependencies (state libraries, chart libraries, virtual-scroll packages) unless the user asks.
- Scope: default is `client/src/`. If the user names a file or directory, restrict to it.

## Phase 1: Inventory

Gather structure before judging. Use Glob/Grep/Read, or an `Explore` subagent for the whole tree.

1. List every `.vue` file with line count, sorted descending. Components over ~300 lines are split candidates.
2. For each: props, emits, composables used, `computed`/`watch`/`ref` counts, child components, and whether it fetches data itself.
3. Map the import graph: which views use which components, and which composables are shared.

## Phase 2: Performance checks

Look for these, in rough order of impact:

- **Work in templates**: `.filter()/.map()/.reduce()/.sort()` or function calls inside template expressions or `v-for`. Should be `computed`.
- **Computed doing too much**: one computed recomputed on any filter change when it only depends on a subset. Suggest splitting.
- **Deep watchers**: `watch(..., { deep: true })` on large arrays; watchers that could be computed.
- **Sorting/mutation of reactive source**: `.sort()` or `.reverse()` directly on a ref/computed value (mutates in place); needs a copy.
- **Large lists**: `v-for` over hundreds of rows without pagination or `v-memo`/`v-once` for static rows.
- **Reactive overhead**: big read-only datasets wrapped in `ref`/`reactive` (candidate for `shallowRef`).
- **Repeated fetches**: the same endpoint called from several components, or refetch on every filter change when the data has no filter dimension (see CLAUDE.md: inventory has no month filter).
- **Missing cleanup**: listeners, timers, or observers added in `onMounted` without `onUnmounted`.
- **Modals/heavy children always mounted**: should be `v-if` or `defineAsyncComponent`.
- **Unstable keys / inline objects**: new object or arrow function literals in props that force child re-render.
- **Date handling**: unvalidated dates before `.getMonth()` (correctness risk noted in CLAUDE.md).

## Phase 3: Reuse checks

- **Duplicated blocks**: near-identical template or script across views/modals (tables, stat cards, status badges, modal shells, empty/loading states). Compare candidates by reading both, not by name.
- **Duplicated logic**: same formatting (currency, dates, percentages), status-to-color mapping, or filtering code in several files. Candidate for a composable or `utils` module.
- **Prop drilling**: props passed through 2+ levels unchanged; suggest `provide/inject` or a composable only if 3+ consumers exist.
- **God components**: a view that owns fetching, derived data, chart SVG, and modals. Suggest the smallest extraction that removes the most lines.
- **Composable gaps**: fetch + loading + error state repeated; belongs in a composable next to `useFilters.js`.
- **Missing generics**: several detail modals with the same shell; suggest one base modal with slots.

Do not suggest abstraction for fewer than 3 occurrences, or where the copies have already diverged in behavior.

## Phase 4: Report

Output one report in this shape, ranked by impact divided by effort:

```
## Summary
<2-3 sentences: overall health, biggest win>

## Findings
### 1. <title> [perf|reuse] [high|med|low impact] [S|M|L effort]
- Where: file:line (and file:line for duplicates)
- Problem: <what is wrong and why it matters, with a concrete trigger>
- Suggestion: <specific change, e.g. "extract StatusBadge.vue with prop `status`">
- Risk: <behavior that could regress, or "none">

## Not worth changing
<patterns that look suspicious but are fine, so they are not re-raised>
```

Cap at 10 findings. End by asking which to apply. If the user approves, implement through `vue-expert`, verify with the app (Playwright MCP at `http://localhost:3000`), and review with `code-reviewer`.
