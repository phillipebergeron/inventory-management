# Design tokens

Define these in the Tailwind `@theme` block. Adjust to the app's existing palette.

## Color

- Text: slate-900 `#0f172a`, secondary slate-500 `#64748b`.
- Surfaces: page `#f8fafc`, card `#ffffff`, sidebar `#ffffff` or slate-900 for a dark rail.
- Borders: slate-200 `#e2e8f0`.
- Accent: blue-600 `#2563eb`, with blue-50 `#eff6ff` for active backgrounds.
- Status: green `#10b981`, blue `#3b82f6`, yellow `#f59e0b`, red `#ef4444`.

## Spacing

Use a 4px base. Allowed steps: 4, 8, 12, 16, 24, 32, 48. Card padding is 20 or 24, and the gap between cards is 16 or 24. Do not introduce one-off values.

## Shape and depth

- Radius: 6px for controls, 12px for cards.
- Shadow: one subtle card shadow and one stronger popover shadow. Prefer a border over a heavy shadow.

## Layout

- Sidebar: 256px expanded, 64px collapsed.
- Content: max width 1600px, horizontal padding 24px on desktop and 16px on mobile.
- Breakpoints: Tailwind defaults. The drawer takes over below `md`.

## Type

Inter (or the system stack). Page title 24px semibold, section title 16px semibold, body 14px, caption 12px.
