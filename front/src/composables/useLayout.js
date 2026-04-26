import { ref, computed, onMounted, onUnmounted } from 'vue'

const collapsed = ref(false)
const isMobile = ref(false)
const isTablet = ref(false)
const drawerVisible = ref(false)

const STORAGE_KEY = 'sidebar_collapsed'

function checkBreakpoint() {
  const width = window.innerWidth
  isMobile.value = width < 768
  isTablet.value = width >= 768 && width < 1024
}

function initCollapsed() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) {
    collapsed.value = saved === 'true'
  }
  checkBreakpoint()
}

export function useLayout() {
  onMounted(() => {
    initCollapsed()
    window.addEventListener('resize', checkBreakpoint)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkBreakpoint)
  })

  const sidebarWidth = computed(() => {
    if (isMobile.value) return 0
    if (collapsed.value) return 64
    return 240
  })

  const showSidebar = computed(() => !isMobile.value)

  function toggleCollapse() {
    collapsed.value = !collapsed.value
    localStorage.setItem(STORAGE_KEY, String(collapsed.value))
  }

  function toggleDrawer() {
    drawerVisible.value = !drawerVisible.value
  }

  function closeDrawer() {
    drawerVisible.value = false
  }

  return {
    collapsed,
    isMobile,
    isTablet,
    drawerVisible,
    sidebarWidth,
    showSidebar,
    toggleCollapse,
    toggleDrawer,
    closeDrawer
  }
}
