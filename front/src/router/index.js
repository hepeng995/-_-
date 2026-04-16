import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  // 前台用户端路由
  {
    path: '/home',
    name: 'UserHome',
    component: () => import('@/views/user/layout.vue'),
    redirect: '/home/index',
    meta: {
      title: '首页',
      requiresAuth: false
    },
    children: [
      {
        path: 'index',
        name: 'HomePage',
        component: () => import('@/views/user/home.vue'),
        meta: {
          title: '首页',
          requiresAuth: false
        }
      }
    ]
  },
  
  // 景点相关路由
  {
    path: '/attractions',
    name: 'UserAttractions',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '景点导览',
      requiresAuth: false
    },
    children: [
      {
        path: '',
        name: 'AttractionsPage',
        component: () => import('@/views/user/attractions.vue'),
        meta: {
          title: '景点导览',
          requiresAuth: false
        }
      },
      {
        path: ':id',
        name: 'AttractionDetail',
        component: () => import('@/views/user/attraction-detail.vue'),
        meta: {
          title: '景点详情',
          requiresAuth: false
        }
      }
    ]
  },
  
  // 商品相关路由
  {
    path: '/products',
    name: 'UserProducts',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '特产商城',
      requiresAuth: false
    },
    children: [
      {
        path: '',
        name: 'ProductsPage',
        component: () => import('@/views/user/products.vue'),
        meta: {
          title: '特产商城',
          requiresAuth: false
        }
      },
      {
        path: ':id',
        name: 'ProductDetail',
        component: () => import('@/views/user/product-detail.vue'),
        meta: {
          title: '商品详情',
          requiresAuth: false
        }
      }
    ]
  },
  
  // 资讯相关路由
  {
    path: '/news',
    name: 'UserNews',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '动态资讯',
      requiresAuth: false
    },
    children: [
      {
        path: '',
        name: 'NewsPage',
        component: () => import('@/views/user/news.vue'),
        meta: {
          title: '动态资讯',
          requiresAuth: false
        }
      },
      {
        path: ':id',
        name: 'NewsDetail',
        component: () => import('@/views/user/news-detail.vue'),
        meta: {
          title: '资讯详情',
          requiresAuth: false
        }
      }
    ]
  },
  
  // 论坛相关路由
  {
    path: '/forum',
    name: 'UserForum',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '建言献策',
      requiresAuth: false
    },
    children: [
      {
        path: '',
        name: 'ForumPage',
        component: () => import('@/views/user/forum.vue'),
        meta: {
          title: '建言献策',
          requiresAuth: false
        }
      },
      {
        path: 'detail/:id',
        name: 'ForumDetail',
        component: () => import('@/views/user/forum-detail.vue'),
        meta: {
          title: '建议详情',
          requiresAuth: false
        }
      }
    ]
  },
  
  // 用户个人中心路由
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true
    },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/person.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true
        }
      },
      {
        path: 'change-password',
        name: 'UserChangePassword',
        component: () => import('@/views/user/changepassword.vue'),
        meta: {
          title: '修改密码',
          requiresAuth: true
        }
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('@/views/user/orders.vue'),
        meta: {
          title: '我的订单',
          requiresAuth: true
        }
      },
      {
        path: 'addresses',
        name: 'UserAddresses',
        component: () => import('@/views/user/addresses.vue'),
        meta: {
          title: '我的地址',
          requiresAuth: true
        }
      }
    ]
  },
  
  // 购物车路由
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '购物车',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'CartPage',
        component: () => import('@/views/user/cart.vue'),
        meta: {
          title: '购物车',
          requiresAuth: true
        }
      }
    ]
  },
  
  // 订单相关路由
  {
    path: '/order',
    name: 'UserOrder',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '订单',
      requiresAuth: true
    },
    children: [
      {
        path: 'confirm',
        name: 'OrderConfirm',
        component: () => import('@/views/user/order-confirm.vue'),
        meta: {
          title: '确认订单',
          requiresAuth: true
        }
      }
    ]
  },
  // 支付路由
  {
    path: '/user/pay',
    name: 'UserPay',
    component: () => import('@/views/user/layout.vue'),
    meta: {
      title: '订单支付',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'PayPage',
        component: () => import('@/views/user/pay.vue'),
        meta: {
          title: '订单支付',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/order/login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/order/register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  // 管理后台已迁移至 React 版 (froont-admin)，所有 /admin 路径重定向到 3001 端口
  {
    path: '/admin',
    name: 'admin',
    beforeEnter: (to, from, next) => {
      window.location.href = 'http://localhost:3001' + to.fullPath
    },
    meta: {
      title: '后台管理',
      requiresAuth: true,
      roles: ['ADMIN']
    }
  },
  {
    path: '/admin/:pathMatch(.*)*',
    name: 'adminCatchAll',
    beforeEnter: (to, from, next) => {
      window.location.href = 'http://localhost:3001' + to.fullPath
    },
    meta: {
      title: '后台管理',
      requiresAuth: true,
      roles: ['ADMIN']
    }
  },
  
  // 错误页面路由
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/order/403.vue'),
    meta: {
      title: '访问受限',
      requiresAuth: false
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/order/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false
    }
  },
  
  // 捕获所有未匹配路由，重定向到404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '首页'} - 乡村振兴·新桃源智界`
  
  // 获取用户状态管理
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  const token = sessionStorage.getItem('token')

  // 处理根路径的重定向
  if (to.path === '/') {
    console.log('路由守卫: 处理根路径重定向')
    console.log('路由守卫: 登录状态:', isLoggedIn)
    console.log('路由守卫: 用户角色:', userStore.userRole)
    
    if (isLoggedIn && userStore.userRole === 'ADMIN') {
      console.log('路由守卫: 管理员用户，跳转到 React 管理后台')
      window.location.href = 'http://localhost:3001'
      return
    } else {
      console.log('路由守卫: 跳转到首页 /home')
      next('/home')
    }
    return
  }

  // 不需要登录的页面，直接访问
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 需要登录但未登录，重定向到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 如果有token但没有用户信息，获取用户信息
  if (token && (!userStore.userInfo || Object.keys(userStore.userInfo).length === 0)) {
    console.log('路由守卫: 有token但没有用户信息，开始获取用户信息')
    try {
      await userStore.getInfo()
      console.log('路由守卫: 用户信息获取成功:', userStore.userInfo)
      console.log('路由守卫: 用户角色:', userStore.userRole)
    } catch (error) {
      console.error('路由守卫: 获取用户信息失败', error)
      // 获取用户信息失败，清空token并跳转到登录页
      userStore.resetState()
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 检查角色权限
  if (to.meta.roles && to.meta.roles.length > 0) {
    const hasRole = to.meta.roles.includes(userStore.userRole)
    if (!hasRole) {
      console.log('路由守卫: 权限不足，用户角色:', userStore.userRole, '需要角色:', to.meta.roles)
      // 重定向到403页面而不是首页
      next({ name: 'Forbidden' })
      return
    }
  }

  // 特殊处理：如果管理员访问前台页面，允许访问（管理员也可以浏览前台）
  // 但如果是需要登录的用户功能页面，则重定向到管理后台
  if (userStore.userRole === 'ADMIN' && (to.path.startsWith('/user') || to.path.startsWith('/cart') || to.path.startsWith('/order'))) {
    console.log('路由守卫: 管理员试图访问用户功能页面，重定向到 React 管理后台')
    window.location.href = 'http://localhost:3001'
    return
  }

  console.log('路由守卫: 权限检查通过，允许访问:', to.path)
  next()
})

export default router 