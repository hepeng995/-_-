import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../ui/Card';
import { navItems } from './navigation';

interface NavItemProps {
  item: any;
  location: any;
  isOpen?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  key?: string;
}

function NavItem({ item, location, isOpen, onToggle, onNavigate }: NavItemProps) {
  const hasChildren = !!item.children;
  const isChildActive = hasChildren && item.children.some((child: any) => location.pathname === child.path);
  const isActive = !hasChildren && location.pathname === item.path;
  
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
            isChildActive
              ? "bg-bamboo-50 text-bamboo-500"
              : "text-gray-700 hover:bg-bamboo-50 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} className={cn(
              "transition-colors",
              isChildActive ? "text-bamboo-500" : "text-gray-500 group-hover:text-gray-700"
            )} />
            <span className="font-medium text-sm">{item.name}</span>
          </div>
          <ChevronDown size={16} className={cn(
            "transition-transform duration-200 text-gray-500",
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
                  onClick={onNavigate}
                  className={cn(
                    "block px-4 py-2 rounded-lg text-sm transition-all duration-200",
                    isChildItemActive
                      ? "bg-bamboo-500 text-white shadow-md shadow-bamboo-200 font-medium"
                      : "text-gray-600 hover:bg-bamboo-50 hover:text-bamboo-500"
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
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive
          ? "bg-bamboo-500 text-white shadow-md shadow-bamboo-200"
          : "text-gray-700 hover:bg-bamboo-50 hover:text-gray-900"
      )}
    >
      <Icon size={20} className={cn(
        "transition-colors",
        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
      )} />
      <span className="font-medium text-sm">{item.name}</span>
    </Link>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({
  location,
  openMenu,
  handleToggle,
  onNavigate,
  mobile,
  onClose,
}: {
  location: ReturnType<typeof useLocation>;
  openMenu: string | null;
  handleToggle: (name: string) => void;
  onNavigate?: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-gray-50 px-5 sm:h-20 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-gray-800 sm:text-xl">后台管理</span>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-gray-500 transition-colors hover:border-bamboo-200 hover:text-bamboo-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-5 sm:py-6 space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            location={location}
            isOpen={openMenu === item.name}
            onToggle={() => handleToggle(item.name)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
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
    <>
      <aside className="hidden w-64 flex-col border-r border-gray-100 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:flex">
        <SidebarContent
          location={location}
          openMenu={openMenu}
          handleToggle={handleToggle}
        />
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-ink-950/40 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-[12px_0_40px_rgba(0,0,0,0.18)] transition-transform',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarContent
            location={location}
            openMenu={openMenu}
            handleToggle={handleToggle}
            onNavigate={onClose}
            mobile
            onClose={onClose}
          />
        </aside>
      </div>
    </>
  );
}

