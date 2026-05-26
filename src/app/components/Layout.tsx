import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import {
  Home,
  ClipboardList,
  Bell,
  User,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface SubMenuItem {
  path: string;
  label: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  subItems?: SubMenuItem[];
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/sentiment-mgmt', '/task-mgmt', '/settings']);

  const navItems: NavItem[] = [
    {
      path: '/sentiment-mgmt',
      label: '舆情管理',
      icon: Home,
      subItems: [
        { path: '/', label: '舆情展示' },
        { path: '/disposal/rules', label: '预警规则' },
      ]
    },
    {
      path: '/task-mgmt',
      label: '任务管理',
      icon: ClipboardList,
      subItems: [
        { path: '/disposal/tasks', label: '处置任务' },
        { path: '/comment-tasks/list', label: '网评任务' },
        { path: '/comment-tasks/notifications', label: '通知任务' },
      ]
    },
    {
      path: '/audit',
      label: '审核管理',
      icon: ShieldCheck,
      subItems: [
        { path: '/audit/workflow', label: '工作流配置' },
        { path: '/audit/pending', label: '待审核' },
        { path: '/audit/my-requests', label: '我发起的' },
      ]
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: Settings,
      subItems: [
        { path: '/settings/system', label: '系统配置' },
      ]
    },
  ];

  const toggleMenu = (path: string, firstSubItemPath?: string) => {
    const isCurrentlyExpanded = expandedMenus.includes(path);
    
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
    
    // 如果菜单当前是折叠的，展开后导航到第一个子项
    if (!isCurrentlyExpanded && firstSubItemPath) {
      // 使用 setTimeout 确保状态更新后再导航
      setTimeout(() => {
        navigate(firstSubItemPath);
      }, 0);
    }
  };

  const isMenuActive = (item: NavItem) => {
    if (item.path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(item.path);
  };

  const isSubItemActive = (subItemPath: string) => {
    return currentPath === subItemPath;
  };

  return (
    <div className="ai-workspace flex h-screen overflow-hidden bg-gray-50 text-slate-800">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-18rem] h-[34rem] w-[34rem] rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute right-[18%] top-[-14rem] h-[30rem] w-[30rem] rounded-full bg-blue-300/35 blur-3xl" />
        <div className="absolute bottom-[-18rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-sky-100/80 blur-3xl" />
      </div>

      {/* 左侧导航栏 */}
      <aside className="relative z-10 flex h-screen w-56 flex-col border-r border-white/60 bg-white/45 shadow-[18px_0_55px_rgba(32,97,165,0.08)] backdrop-blur-2xl">
        {/* Logo */}
        <div className="h-[86px] flex items-center px-4 border-b border-white/60">
          <div className="flex min-w-0 items-center">
            <img src="/images/logo.png" alt="数智全媒产品平台" className="h-8 max-w-[188px] object-contain" />
          </div>
        </div>


        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isMenuActive(item);
              const isExpanded = expandedMenus.includes(item.path);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              
              return (
                <div key={item.path}>
                  {/* 主菜单项 */}
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleMenu(item.path, item.subItems![0].path)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-white/80 text-blue-700 shadow-[0_10px_26px_rgba(37,99,235,0.10)] ring-1 ring-blue-100'
                          : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-white/80 text-blue-700 shadow-[0_10px_26px_rgba(37,99,235,0.10)] ring-1 ring-blue-100'
                          : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                  )}

                  {/* 子菜单项 */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-3 mt-2 space-y-1 border-l border-blue-100/80 pl-3">
                      {item.subItems!.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-xl text-sm transition-all ${
                            isSubItemActive(subItem.path)
                              ? 'bg-blue-600 text-white font-medium shadow-[0_10px_18px_rgba(37,99,235,0.18)]'
                              : 'text-slate-500 hover:bg-white/55 hover:text-slate-900'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-[86px] border-b border-white/60 bg-white/35 backdrop-blur-2xl flex items-center justify-end px-8">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4">
              <button className="relative rounded-2xl border border-white/70 bg-white/65 p-2.5 shadow-sm transition-all hover:bg-white/90">
                <Bell className="w-5 h-5 text-slate-600" />
                <Badge className="absolute -top-1.5 -right-1.5 w-5 h-5 p-0 flex items-center justify-center border-0 bg-rose-500 text-white text-xs before:hidden">
                  3
                </Badge>
              </button>
              <div className="hidden max-w-[260px] truncate rounded-full border border-white/65 bg-white/55 px-3 py-2 text-sm text-slate-600 2xl:block">
                CCBN2025年4月22日至25日在北京...
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-blue-600 rounded-2xl flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm leading-tight text-slate-900">舆情管理员</span>
                <span className="text-xs text-slate-500">admin@system.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
