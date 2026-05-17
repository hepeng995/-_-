import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Map,
  ShoppingCart,
  Newspaper,
  MessageSquare,
  Settings,
  MapPin,
  Package,
} from 'lucide-react';

export interface NavigationChild {
  name: string;
  path: string;
}

export interface NavigationItem {
  name: string;
  path?: string;
  icon: LucideIcon;
  children?: NavigationChild[];
}

export const navItems: NavigationItem[] = [
  { name: '首页', path: '/', icon: LayoutDashboard },
  {
    name: '系统用户管理',
    icon: Users,
    children: [{ name: '用户列表', path: '/users' }],
  },
  {
    name: '乡村风采管理',
    icon: Map,
    children: [
      { name: '景点管理', path: '/attractions' },
      { name: '商品管理', path: '/products' },
      { name: '分类管理', path: '/product-categories' },
    ],
  },
  {
    name: '订单管理',
    icon: ShoppingCart,
    children: [
      { name: '订单列表', path: '/orders' },
      { name: '评价审核', path: '/reviews' },
    ],
  },
  {
    name: '资讯管理',
    icon: Newspaper,
    children: [{ name: '动态资讯', path: '/news' }],
  },
  {
    name: '路线与活动管理',
    icon: MapPin,
    children: [
      { name: '旅游路线管理', path: '/tour-routes' },
      { name: '活动管理', path: '/activities-admin' },
      { name: '报名管理', path: '/activity-registrations' },
    ],
  },
  {
    name: '溯源管理',
    icon: Package,
    children: [{ name: '溯源记录', path: '/trace-records' }],
  },
  {
    name: '论坛管理',
    icon: MessageSquare,
    children: [
      { name: '帖子管理', path: '/forum-posts' },
      { name: '评论管理', path: '/forum-comments' },
      { name: '数据统计', path: '/forum-statistics' },
    ],
  },
  {
    name: '系统管理',
    icon: Settings,
    children: [
      { name: '个人中心', path: '/person' },
      { name: '系统配置', path: '/system-config' },
      { name: '操作日志', path: '/system-logs' },
    ],
  },
];

export function findActiveNavLabel(pathname: string) {
  for (const item of navItems) {
    if (item.path === pathname) {
      return item.name;
    }

    const child = item.children?.find((entry) => entry.path === pathname);
    if (child) {
      return child.name;
    }
  }

  return '管理后台';
}
