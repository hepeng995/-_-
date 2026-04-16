import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  ShoppingCart, 
  Newspaper, 
  MessageSquare, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { cn } from '../ui/Card';

const navItems = [
  { name: '首页', path: '/', icon: LayoutDashboard },
  { 
    name: '系统用户管理', 
    icon: Users,
    children: [
      { name: '用户列表', path: '/users' }
    ]
  },
  {
    name: '乡村风采管理',
    icon: Map,
    children: [
      { name: '景点管理', path: '/attractions' },
      { name: '商品管理', path: '/products' },
      { name: '分类管理', path: '/product-categories' },
    ]
  },
  {
    name: '订单管理',
    icon: ShoppingCart,
    children: [
      { name: '订单列表', path: '/orders' }
    ]
  },
  {
    name: '资讯管理',
    icon: Newspaper,
    children: [
      { name: '动态资讯', path: '/news' }
    ]
  },
  {
    name: '论坛管理',
    icon: MessageSquare,
    children: [
      { name: '帖子管理', path: '/forum-posts' },
      { name: '评论管理', path: '/forum-comments' },
      { name: '数据统计', path: '/forum-statistics' },
    ]
  },
  {
    name: '系统管理',
    icon: Settings,
    children: [
      { name: '个人中心', path: '/person' },
      { name: '系统配置', path: '/system-config' },
      { name: '操作日志', path: '/system-logs' },
    ]
  }
];

interface NavItemProps {
  item: any;
  location: any;
  isOpen?: boolean;
  onToggle?: () => void;
  key?: string;
}

function NavItem({ item, location, isOpen, onToggle }: NavItemProps) {
  const hasChildren = !!item.children;
  const isChildActive = hasChildren && item.children.some((child: any) => location.pathname === child.path);
  const isActive = !hasChildren && location.pathname === item.path;
  
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
            isChildActive 
              ? "bg-indigo-50 text-indigo-600" 
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} className={cn(
              "transition-colors",
              isChildActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
            )} />
            <span className="font-medium text-sm">{item.name}</span>
          </div>
          <ChevronDown size={16} className={cn(
            "transition-transform duration-200 text-gray-400",
            isOpen ? "rotate-180" : ""
          )} />
        </button>
        
        {isOpen && (
          <div className="pl-11 pr-4 py-1 space-y-1">
            {item.children.map((child: any) => {
              const isChildItemActive = location.pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    "block px-4 py-2 rounded-lg text-sm transition-all duration-200",
                    isChildItemActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-medium"
                      : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                  )}
                >
                  {child.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon size={20} className={cn(
        "transition-colors",
        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
      )} />
      <span className="font-medium text-sm">{item.name}</span>
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    const activeItem = navItems.find(item => 
      item.children?.some(child => location.pathname === child.path)
    );
    return activeItem ? activeItem.name : null;
  });

  useEffect(() => {
    const activeItem = navItems.find(item => 
      item.children?.some(child => location.pathname === child.path)
    );
    if (activeItem) {
      setOpenMenu(activeItem.name);
    }
  }, [location.pathname]);

  const handleToggle = (name: string) => {
    setOpenMenu(prev => prev === name ? null : name);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="h-20 flex items-center px-8 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-800 tracking-tight">后台管理</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        {navItems.map((item) => (
          <NavItem 
            key={item.name} 
            item={item} 
            location={location} 
            isOpen={openMenu === item.name}
            onToggle={() => handleToggle(item.name)}
          />
        ))}
      </div>
    </aside>
  );
}

