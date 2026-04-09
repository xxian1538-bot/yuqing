import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { 
  Home, 
  AlertCircle, 
  Send, 
  ClipboardList, 
  MessageSquare, 
  BarChart3,
  Bell,
  User,
  Settings,
  Search,
  ChevronDown,
  ChevronRight
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/disposal', '/report', '/comment-tasks', '/settings']);

  const navItems: NavItem[] = [
    { path: '/', label: '舆情展示', icon: Home },
    { 
      path: '/disposal', 
      label: '舆情处置', 
      icon: ClipboardList,
      subItems: [
        { path: '/disposal/tasks', label: '处置任务' },
        { path: '/disposal/rules', label: '预警规则' },
      ]
    },
    { 
      path: '/comment-tasks', 
      label: '网评任务', 
      icon: MessageSquare,
      subItems: [
        { path: '/comment-tasks/list', label: '任务列表' },
        { path: '/comment-tasks/performance', label: '绩效管理' },
        { path: '/comment-tasks/statistics', label: '任务统计' },
      ]
    },
    {
      path: '/analytics',
      label: '数据看板',
      icon: BarChart3
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
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src="/images/logo.png" alt="数智全媒产品平台" className="h-8 object-contain" />
          </div>
        </div>


        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
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
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* 子菜单项 */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems!.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isSubItemActive(subItem.path)
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  3
                </Badge>
              </button>
              <div className="text-sm text-gray-600">
                CCBN2025年4月22日至25日在北京...
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm leading-tight">舆情管理员</span>
                <span className="text-xs text-gray-500">admin@system.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}