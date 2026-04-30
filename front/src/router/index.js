import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { scrollToTop } from '@/utils/scroll'

const getAdminBaseUrl = () => {
  const configured = import.meta.env.VITE_ADMIN_URL
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  const { protocol, hostname, port, origin } = window.location
  if (import.meta.env.DEV && port === '3000') {
    return `${protocol}//${hostname}:3001`
  }
  return `${origin}/admin`
}

const redirectToAdmin = (fullPath = '/admin') => {
  const base = getAdminBaseUrl()
  const suffix = fullPath.replace(/^\/admin/, '')
  window.location.href = `${base}${suffix}`
}

const routes = [
  {
    path: '/',
    component: () => import('@/views/user/layout.vue'),
    children: [
      { path: '', redirect: '/home' },

      // === 全宽模板 ===
      {
        path: 'home',
        name: 'UserHome',
        redirect: '/home/index',
        meta: { title: '首页', layout: 'full', icon: 'House', navGroup: 'explore' }
      },
      {
        path: 'home/index',
        name: 'HomePage',
        component: () => import('@/views/user/home.vue'),
        meta: { title: '首页', layout: 'full', icon: 'House', navGroup: 'explore', showBreadcrumb: false }
      },

      // === 列表模板 - 景点 ===
      {
        path: 'attractions',
        name: 'AttractionsPage',
        component: () => import('@/views/user/attractions.vue'),
        meta: {
          title: '景点导览', layout: 'list', icon: 'MapLocation', navGroup: 'explore',
          pageHeader: { title: '景点导览', subtitle: '探索美丽乡村风光', gradient: 'green' }
        }
      },
      {
        path: 'attractions/:id',
        name: 'AttractionDetail',
        component: () => import('@/views/user/attraction-detail.vue'),
        meta: { title: '景点详情', layout: 'detail', showBreadcrumb: true }
      },

      // === 列表模板 - 特产 ===
      {
        path: 'products',
        name: 'ProductsPage',
        component: () => import('@/views/user/products.vue'),
        meta: {
          title: '特产商城', layout: 'list', icon: 'ShoppingBag', navGroup: 'commerce',
          pageHeader: { title: '特产商城', subtitle: '甄选乡村地道风物', gradient: 'orange' }
        }
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: () => import('@/views/user/product-detail.vue'),
        meta: { title: '商品详情', layout: 'detail', showBreadcrumb: true }
      },

      // === 列表模板 - 资讯 ===
      {
        path: 'news',
        name: 'NewsPage',
        component: () => import('@/views/user/news.vue'),
        meta: {
          title: '动态资讯', layout: 'list', icon: 'ChatRound', navGroup: 'community',
          pageHeader: { title: '动态资讯', subtitle: '了解乡村振兴最新动态', gradient: 'blue' }
        }
      },
      {
        path: 'news/:id',
        name: 'NewsDetail',
        component: () => import('@/views/user/news-detail.vue'),
        meta: { title: '资讯详情', layout: 'detail', showBreadcrumb: true }
      },

      // === 列表模板 - 论坛 ===
      {
        path: 'forum',
        name: 'ForumPage',
        component: () => import('@/views/user/forum.vue'),
        meta: {
          title: '建言献策', layout: 'list', icon: 'ChatDotRound', navGroup: 'community',
          pageHeader: { title: '建言献策', subtitle: '共绘乡村振兴美好蓝图', gradient: 'blue' }
        }
      },
      {
        path: 'forum/detail/:id',
        name: 'ForumDetail',
        component: () => import('@/views/user/forum-detail.vue'),
        meta: { title: '帖子详情', layout: 'detail', showBreadcrumb: true }
      },

      // === 列表模板 - 路线 ===
      {
        path: 'routes',
        name: 'RoutesPage',
        component: () => import('@/views/user/routes.vue'),
        meta: {
          title: '旅游路线', layout: 'list', icon: 'Guide', navGroup: 'explore',
          pageHeader: { title: '旅游路线', subtitle: '定制你的乡村之旅', gradient: 'green' }
        }
      },
      {
        path: 'routes/:id',
        name: 'RouteDetail',
        component: () => import('@/views/user/route-detail.vue'),
        meta: { title: '路线详情', layout: 'detail', showBreadcrumb: true }
      },

      // === 列表模板 - 活动 ===
      {
        path: 'activities',
        name: 'ActivitiesPage',
        component: () => import('@/views/user/activities.vue'),
        meta: {
          title: '景点活动', layout: 'list', icon: 'Calendar', navGroup: 'explore',
          pageHeader: { title: '景点活动', subtitle: '参与丰富多彩的乡村体验', gradient: 'purple' }
        }
      },
      {
        path: 'activities/:id',
        name: 'ActivityDetail',
        component: () => import('@/views/user/activity-detail.vue'),
        meta: { title: '活动详情', layout: 'detail', showBreadcrumb: true }
      },

      // === 全宽模板 - 溯源 ===
      {
        path: 'trace/:batchNo',
        name: 'TraceByBatch',
        component: () => import('@/views/user/trace-view.vue'),
        meta: { title: '产品溯源', layout: 'full' }
      },

      // === 表单模板 - 需登录 ===
      {
        path: 'cart',
        name: 'ShoppingCart',
        component: () => import('@/views/user/cart.vue'),
        meta: { title: '购物车', requiresAuth: true, layout: 'form' }
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: () => import('@/views/user/person.vue'),
        meta: { title: '个人中心', requiresAuth: true, layout: 'form' }
      },
      {
        path: 'user/change-password',
        name: 'UserChangePassword',
        component: () => import('@/views/user/changepassword.vue'),
        meta: { title: '修改密码', requiresAuth: true, layout: 'form' }
      },
      {
        path: 'user/orders',
        name: 'UserOrders',
        component: () => import('@/views/user/orders.vue'),
        meta: { title: '我的订单', requiresAuth: true, layout: 'form' }
      },
      {
        path: 'user/addresses',
        name: 'UserAddresses',
        component: () => import('@/views/user/addresses.vue'),
        meta: { title: '我的地址', requiresAuth: true, layout: 'form' }
      },
      {
        path: 'order/confirm',
        name: 'OrderConfirm',
        component: () => import('@/views/user/order-confirm.vue'),
        meta: { title: '确认订单', requiresAuth: true, layout: 'form' }
      },
      {
        path: 'user/pay',
        name: 'UserPay',
        component: () => import('@/views/user/pay.vue'),
        meta: { title: '订单支付', requiresAuth: true, layout: 'form' }
      },
    ]
  },

  // === 独立页面 (不使用侧边栏layout) ===
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/order/login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/order/register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/order/403.vue'),
    meta: { title: '访问受限', requiresAuth: false }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/order/404.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  },

  // 管理后台重定向
  {
    path: '/admin',
    name: 'admin',
    beforeEnter: (to) => {
      redirectToAdmin(to.fullPath)
    },
    meta: { title: '后台管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/:pathMatch(.*)*',
    name: 'adminCatchAll',
    beforeEnter: (to) => {
      redirectToAdmin(to.fullPath)
    },
    meta: { title: '后台管理', requiresAuth: true, roles: ['ADMIN'] }
  },

  // 兜底
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title || '首页'} - 智兴乡村，数创未来`

  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  const token = sessionStorage.getItem('token')

  // 根路径重定向
  if (to.path === '/') {
    if (isLoggedIn && userStore.userRole === 'ADMIN') {
      redirectToAdmin('/admin')
      return
    }
    next('/home')
    return
  }

  // 不需要登录
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 需要登录但未登录
  if (!isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 有token但无用户信息，尝试获取
  if (token && (!userStore.userInfo || Object.keys(userStore.userInfo).length === 0)) {
    try {
      await userStore.getInfo()
    } catch (error) {
      console.error('路由守卫: 获取用户信息失败', error)
      userStore.resetState()
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

router.afterEach(async (to) => {
  const usesUserLayout = to.matched.some((record) => record.path === '/')

  if (usesUserLayout) {
    return
  }

  await nextTick()
  scrollToTop(window)
})

export default router
