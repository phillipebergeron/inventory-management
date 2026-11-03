<template>
  <div class="app flex min-h-screen bg-(--page-bg)">
    <!-- Backdrop is mobile-only; z-index sits above FilterBar (90) and below the drawer. -->
    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-[105] bg-slate-900/40 md:hidden"
      aria-hidden="true"
      @click="drawerOpen = false"
    />

    <!-- Drawer z-index (110) must beat the sticky FilterBar (90); modals (1000/2000) stay above it. -->
    <aside
      id="app-sidebar"
      :class="[
        'app-sidebar fixed inset-y-0 left-0 z-[110] flex w-64 flex-col border-r border-(--border) bg-(--surface)',
        'transition-[width,transform] duration-200 md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0',
        collapsed ? 'sidebar-collapsed md:w-(--spacing-sidebar-collapsed)' : 'md:w-(--spacing-sidebar)',
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      :aria-label="t('nav.companyName')"
      :inert="!drawerOpen && !isDesktop"
    >
      <div class="flex h-16 shrink-0 items-center gap-2 border-b border-(--border) px-4">
        <div class="sidebar-label min-w-0 flex-1">
          <h1 class="truncate text-base font-bold leading-tight tracking-tight text-(--text)">{{ t('nav.companyName') }}</h1>
          <span class="block truncate text-xs text-(--text-muted)">{{ t('nav.subtitle') }}</span>
        </div>
        <button
          type="button"
          class="sidebar-toggle hidden h-8 w-8 shrink-0 items-center justify-center rounded-control text-(--text-muted) hover:bg-(--surface-hover) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex"
          :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          :aria-expanded="!collapsed"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggleCollapsed"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path v-if="!collapsed" d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            <path v-else d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </svg>
        </button>
        <button
          ref="closeButton"
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-(--text-muted) hover:bg-(--surface-hover) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
          aria-label="Close menu"
          @click="drawerOpen = false"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto p-3" aria-label="Main">
        <ul class="flex flex-col gap-1">
          <li v-for="item in navItems" :key="item.to">
            <router-link
              :to="item.to"
              :title="item.label"
              :aria-label="item.label"
              class="sidebar-link flex h-10 items-center gap-3 rounded-control px-3 text-sm font-medium text-(--text-secondary) no-underline hover:bg-(--surface-hover) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="item.icon" />
              <span class="sidebar-label truncate">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Footer dropdowns open upward (bottom-anchored) so the viewport bottom/aside edge never clips them. -->
      <div class="sidebar-footer flex shrink-0 flex-col gap-2 border-t border-(--border) p-3">
        <!-- Theme toggle: icon-only in the collapsed rail (label hidden by .sidebar-label rule). -->
        <button
          type="button"
          class="theme-toggle flex h-10 w-full items-center gap-3 rounded-control border border-(--border) bg-(--surface) px-3 text-sm font-medium text-(--text-body) hover:border-(--border-strong) hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          :aria-label="isDark ? 'Light mode' : 'Dark mode'"
          :title="isDark ? 'Light mode' : 'Dark mode'"
          :aria-pressed="isDark"
          @click="toggleTheme"
        >
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path v-if="isDark" d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <path v-else d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span class="sidebar-label truncate">{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
        </button>
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="openProfileDetails"
          @show-tasks="openTasks"
        />
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-[80] flex h-14 items-center gap-3 border-b border-(--border) bg-(--surface) px-4 md:hidden">
        <button
          ref="menuButton"
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-control text-(--text-secondary) hover:bg-(--surface-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Open menu"
          aria-controls="app-sidebar"
          :aria-expanded="drawerOpen"
          @click="drawerOpen = true"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span class="truncate text-base font-bold tracking-tight text-(--text)">{{ t('nav.companyName') }}</span>
      </header>
      <FilterBar />
      <main class="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 md:px-6 md:py-6">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, nextTick, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

const SIDEBAR_KEY = 'inventory.sidebarCollapsed'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const { isDark, toggleTheme } = useTheme()
    const route = useRoute()

    // localStorage can throw (privacy mode, blocked storage, quota); treat as "no saved choice".
    // Returns true/false for an explicit saved choice, or null when nothing is saved.
    const readSavedChoice = () => {
      try {
        const v = localStorage.getItem(SIDEBAR_KEY)
        return v === '1' ? true : v === '0' ? false : null
      } catch (e) {
        return null
      }
    }
    // Precedence: an explicit user choice (saved value or toggle click) > width-based default.
    // The default is icon rail below 1280px (Tailwind xl) and expanded at 1280px+; it is never
    // written to localStorage and follows the viewport live only while no choice exists.
    // Both refs are initialised synchronously in setup, so the first render is already correct.
    const userChoice = ref(readSavedChoice())
    const wideMql = window.matchMedia('(min-width: 1280px)')
    const isWide = ref(wideMql.matches)
    const onWideChange = (e) => { isWide.value = e.matches }
    wideMql.addEventListener('change', onWideChange)
    onBeforeUnmount(() => wideMql.removeEventListener('change', onWideChange))
    const collapsed = computed(() => (userChoice.value !== null ? userChoice.value : !isWide.value))
    const drawerOpen = ref(false)
    const closeButton = ref(null)
    const menuButton = ref(null)

    // Tracks the md breakpoint (matches Tailwind's 768px). Below md the closed drawer is made
    // inert (out of tab order / a11y tree); at md+ the sidebar is always a normal, interactive sidebar.
    const mql = window.matchMedia('(min-width: 768px)')
    const isDesktop = ref(mql.matches)
    // When the drawer closes because the viewport grew (or a modal opened), don't pull focus to the hamburger.
    let restoreFocus = true
    const onBreakpointChange = (e) => {
      isDesktop.value = e.matches
      if (e.matches && drawerOpen.value) {
        restoreFocus = false
        drawerOpen.value = false
      }
    }
    mql.addEventListener('change', onBreakpointChange)
    onBeforeUnmount(() => {
      mql.removeEventListener('change', onBreakpointChange)
      document.body.style.overflow = ''
    })

    // Focus management + body scroll lock while the mobile drawer is open.
    // flush:'post' so the drawer is no longer inert when we focus into it.
    watch(drawerOpen, async (open) => {
      document.body.style.overflow = open ? 'hidden' : ''
      await nextTick()
      if (open) {
        closeButton.value?.focus()
      } else if (restoreFocus) {
        menuButton.value?.focus()
      }
      restoreFocus = true
    }, { flush: 'post' })

    // Close the drawer (without grabbing focus) so it doesn't stay open behind the modal on mobile.
    const openProfileDetails = () => {
      restoreFocus = false
      drawerOpen.value = false
      showProfileDetails.value = true
    }
    const openTasks = () => {
      restoreFocus = false
      drawerOpen.value = false
      showTasks.value = true
    }

    const toggleCollapsed = () => {
      userChoice.value = !collapsed.value
      try {
        localStorage.setItem(SIDEBAR_KEY, userChoice.value ? '1' : '0')
      } catch (e) {
        // Ignore: state simply won't persist.
      }
    }

    const navItems = computed(() => [
      { to: '/', label: t('nav.overview'), icon: '<path d="M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5"/>' },
      { to: '/inventory', label: t('nav.inventory'), icon: '<path d="M21 8 12 3 3 8m18 0-9 5m9-5v8l-9 5m0-8L3 8m9 5v8M3 8v8l9 5"/>' },
      { to: '/orders', label: t('nav.orders'), icon: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 12h6M9 16h4"/>' },
      { to: '/spending', label: t('nav.finance'), icon: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>' },
      { to: '/demand', label: t('nav.demandForecast'), icon: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>' },
      { to: '/reports', label: 'Reports', icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6"/>' }
    ])

    watch(() => route.path, () => { drawerOpen.value = false })

    const onKeydown = (e) => {
      if (e.key === 'Escape' && drawerOpen.value) drawerOpen.value = false
    }
    window.addEventListener('keydown', onKeydown)
    onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      isDark,
      toggleTheme,
      collapsed,
      drawerOpen,
      isDesktop,
      closeButton,
      menuButton,
      openProfileDetails,
      openTasks,
      toggleCollapsed,
      navItems,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
/* The old `* { margin:0; padding:0; box-sizing:border-box }` reset was removed:
   Tailwind's preflight provides it, and an unlayered `*` rule would override
   layered Tailwind utilities like p-4 or m-2. */

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--page-bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Active sidebar link (router-link sets aria-current="page" on exact-active). */
.sidebar-link[aria-current="page"] {
  background: var(--color-accent-soft);
  color: var(--accent-text);
}

/* Footer controls (LanguageSwitcher / ProfileMenu) fill the sidebar width. Selectors are
   deliberately specific so they beat the children's scoped styles. */
.app-sidebar .language-switcher .language-button,
.app-sidebar .profile-menu .profile-button {
  width: 100%;
}

.app-sidebar .profile-menu .profile-name,
.app-sidebar .language-switcher .language-label {
  flex: 1;
  text-align: left;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Icon rail: only applies at md+, the mobile drawer is always full width. */
@media (min-width: 768px) {
  .app-sidebar.sidebar-collapsed .sidebar-label,
  .app-sidebar.sidebar-collapsed .language-switcher .language-label,
  .app-sidebar.sidebar-collapsed .profile-menu .profile-name,
  .app-sidebar.sidebar-collapsed .language-switcher .chevron,
  .app-sidebar.sidebar-collapsed .profile-menu .chevron {
    display: none;
  }

  .app-sidebar.sidebar-collapsed .sidebar-link,
  .app-sidebar.sidebar-collapsed .theme-toggle,
  .app-sidebar.sidebar-collapsed .language-switcher .language-button,
  .app-sidebar.sidebar-collapsed .profile-menu .profile-button {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  }

  .app-sidebar.sidebar-collapsed .sidebar-toggle {
    margin: 0 auto;
  }
}

/* ---- Shared view patterns (page header, cards, tables, badges). Views reuse these. ---- */
.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface);
  padding: 20px;
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  min-width: 0;
}

.stat-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 30px;
  line-height: 36px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: var(--warning-text);
}

.stat-card.success .stat-value {
  color: var(--success-text);
}

.stat-card.danger .stat-value {
  color: var(--danger-text);
}

.stat-card.info .stat-value {
  color: var(--accent-text);
}

.card {
  background: var(--surface);
  border-radius: var(--radius-card);
  padding: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
  margin: 0;
}

.table-container {
  overflow-x: auto;
  max-width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--surface-muted);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

th {
  text-align: left;
  padding: 8px 12px;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

td {
  padding: 12px;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-body);
  font-size: 14px;
}

/* Numeric columns: add class="num" (or text-align:right) to th/td for right alignment. */
th.num,
td.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* td.nowrap: keep codes (SKU, order id, location) on one line; the container scrolls instead. */
td.nowrap {
  white-space: nowrap;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--surface-muted);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-control);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
}

.badge.success,
.badge.increasing {
  background: var(--success-bg);
  color: var(--success-fg);
}

.badge.warning,
.badge.medium {
  background: var(--warning-bg);
  color: var(--warning-fg);
}

.badge.danger,
.badge.decreasing,
.badge.high {
  background: var(--danger-bg);
  color: var(--danger-fg);
}

.badge.info,
.badge.low {
  background: var(--info-bg);
  color: var(--info-fg);
}

.badge.stable {
  background: var(--indigo-bg);
  color: var(--indigo-fg);
}

/* Shared form controls and buttons. */
.input,
.select {
  padding: 8px 12px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-control);
  font-size: 14px;
  color: var(--text);
  background: var(--surface);
}

.input:focus,
.select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15);
}

.loading {
  text-align: center;
  padding: 48px;
  color: var(--text-muted);
  font-size: 14px;
}

.error {
  background: var(--danger-soft);
  border: 1px solid var(--danger-border);
  color: var(--danger-fg);
  padding: 16px;
  border-radius: var(--radius-control);
  margin: 16px 0;
  font-size: 14px;
}
</style>
