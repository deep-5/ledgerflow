import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  FileCheck,
  Globe,
  MessageSquare,
  Receipt,
  Clock,
  Shield,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck,
  StopCircle,
  Sparkles,
} from 'lucide-react';
import { useApp, ActiveView } from '../../context/AppContext';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  clientOnly?: boolean;
  staffOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    setSidebarCollapsed,
    tasks,
    documentRequests,
    messages,
    invoices,
    notifications,
    currentUser,
    activeTimer,
    stopTimer,
  } = useApp();

  // Calculate live badge counts
  const overdueTasksCount = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;
  const missingDocsCount = documentRequests.filter(
    r => r.status === 'Sent' || r.status === 'Partially Received' || r.status === 'Changes Requested'
  ).length;
  const unreadMessagesCount = messages.reduce((sum, m) => sum + m.unreadCount, 0);
  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const isClient = currentUser.role === 'Client';

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <Users className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
    {
      id: 'tasks',
      label: 'Work & Tasks',
      icon: <CheckSquare className="w-[18px] h-[18px] flex-shrink-0" />,
      badge: overdueTasksCount > 0 ? overdueTasksCount : undefined,
      staffOnly: true,
    },
    {
      id: 'calendar',
      label: 'Deadlines Calendar',
      icon: <Calendar className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
    {
      id: 'documents',
      label: 'Document Requests',
      icon: <FileCheck className="w-[18px] h-[18px] flex-shrink-0" />,
      badge: missingDocsCount > 0 ? missingDocsCount : undefined,
      staffOnly: true,
    },
    {
      id: 'portal',
      label: 'Client Portal',
      icon: <Globe className="w-[18px] h-[18px] flex-shrink-0" />,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="w-[18px] h-[18px] flex-shrink-0" />,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <Receipt className="w-[18px] h-[18px] flex-shrink-0" />,
      badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} due` : undefined,
      staffOnly: true,
    },
    {
      id: 'time',
      label: 'Time Tracking',
      icon: <Clock className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
    {
      id: 'team',
      label: 'Team & Capacity',
      icon: <Shield className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-[18px] h-[18px] flex-shrink-0" />,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-[18px] h-[18px] flex-shrink-0" />,
      staffOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (isClient && item.staffOnly) return false;
    return true;
  });

  const formatTimerSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      className={`relative h-full flex flex-col bg-white border-r border-[#E5EBF0] transition-all duration-200 z-30 select-none flex-shrink-0 ${
        sidebarCollapsed ? 'w-[70px]' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center ${
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        } h-16 border-b border-[#E5EBF0] flex-shrink-0`}
      >
        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-10 h-10 rounded-xl bg-[#087EDB] hover:bg-[#0668B6] flex items-center justify-center text-white shadow-xs hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
            title="Expand sidebar"
          >
            <BookOpenCheck className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-[#E5EBF0] rounded-full flex items-center justify-center text-[#788596] shadow-xs group-hover:bg-[#D9EFFA] group-hover:text-[#087EDB]">
              <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#087EDB] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                <BookOpenCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[15px] tracking-tight text-[#202938] leading-none">
                    LedgerFlow
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#D9EFFA] text-[#087EDB] rounded-md border border-[#BCE3F7]">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-[#788596] font-medium truncate mt-0.5">
                  Practice Operations
                </span>
              </div>
            </div>

            {/* Toggle Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-7 h-7 rounded-lg text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA] transition-colors hidden lg:flex items-center justify-center border border-transparent hover:border-[#E5EBF0] cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Live Timer Banner (if active) */}
      {activeTimer && !sidebarCollapsed && (
        <div className="mx-3 mt-3 p-2.5 bg-[#D9EFFA] border border-[#BCE3F7] rounded-xl flex items-center justify-between shadow-subtle animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <div className="truncate">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-800">Tracking</div>
              <div className="text-xs font-mono font-bold text-brand-700">
                {formatTimerSeconds(activeTimer.elapsedSeconds)}
              </div>
            </div>
          </div>
          <button
            onClick={stopTimer}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-white px-2 py-0.5 rounded-lg border border-rose-200/80 shadow-xs flex items-center gap-1 transition-colors"
          >
            <StopCircle className="w-3 h-3 text-rose-600" />
            Stop
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
            Workspace
          </div>
        )}
        {visibleNavItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center rounded-xl text-xs font-medium transition-all duration-150 group relative cursor-pointer ${
                isActive
                  ? 'bg-[#D9EFFA] text-[#087EDB] font-bold shadow-xs'
                  : 'text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
              } ${
                sidebarCollapsed
                  ? 'w-10 h-10 mx-auto justify-center'
                  : 'w-full gap-2.5 px-3 py-2'
              }`}
              title={sidebarCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
            >
              <span className={`transition-colors ${isActive ? 'text-[#087EDB]' : 'text-[#788596] group-hover:text-[#202938]'}`}>
                {item.icon}
              </span>

              {!sidebarCollapsed && (
                <span className="truncate flex-1 text-left tracking-tight">{item.label}</span>
              )}

              {!sidebarCollapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-[#087EDB] text-white'
                      : 'bg-[#F3F7FA] text-[#788596]'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot indicator */}
              {sidebarCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#087EDB] ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Persona Info & Toggle */}
      <div className="p-2.5 border-t border-[#E5EBF0] bg-white flex flex-col gap-1 flex-shrink-0">
        <div
          className={`flex items-center p-1.5 rounded-xl hover:bg-[#F3F7FA] transition-colors cursor-pointer border border-transparent hover:border-[#E5EBF0] ${
            sidebarCollapsed ? 'justify-center' : 'gap-2.5'
          }`}
          onClick={() => setCurrentView(isClient ? 'portal' : 'settings')}
          title={sidebarCollapsed ? `${currentUser.name} (${currentUser.role})` : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-[#D9EFFA] text-[#087EDB] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#BCE3F7] shadow-xs">
            {currentUser.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#202938] truncate tracking-tight">{currentUser.name}</span>
              <span className="text-[10px] text-[#788596] font-medium truncate">{currentUser.role}</span>
            </div>
          )}
        </div>

        {/* Bottom Expand / Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`hidden lg:flex items-center text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA] rounded-lg p-1.5 transition-colors border border-transparent hover:border-[#E5EBF0] text-xs font-medium cursor-pointer ${
            sidebarCollapsed ? 'justify-center w-8 h-8 mx-auto' : 'w-full gap-2 px-2'
          }`}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#788596]" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-[#788596]" />
              <span className="text-[11px] text-[#788596]">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
