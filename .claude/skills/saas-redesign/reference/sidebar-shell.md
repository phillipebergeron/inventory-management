# Sidebar shell skeleton

Structure only. Adapt it to the app's routes, i18n, and existing components.

```vue
<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Mobile backdrop -->
    <div v-if="drawerOpen" class="fixed inset-0 z-40 bg-slate-900/40 md:hidden" @click="drawerOpen = false" />

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all md:static',
        collapsed ? 'md:w-16' : 'md:w-64',
        'w-64',
        drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Logo + collapse toggle -->
      <!-- Nav: one router-link per route, icon + label (label hidden when collapsed) -->
      <!-- Footer: language switcher + profile menu, dropdowns open upward -->
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Mobile top bar with hamburger (md:hidden) -->
      <!-- Filter bar, sticky top-0 within this column -->
      <main class="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
```

## Behavior checklist

- Collapsed state is read from and written to `localStorage` inside try/catch, with a default of expanded.
- Close the drawer on Esc and on route change (`watch` on `$route.path`).
- Hide labels when collapsed, and keep a `title` or `aria-label` on each icon link.
- Active link uses `aria-current="page"` plus a visible highlight.
- Dropdowns in the footer open upward (`bottom-full`) so they are not clipped.
