import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  HelpCircle,
  Building2,
  ChevronDown,
  UserCheck,
  RotateCcw,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Menu,
  Command,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useApp, ActiveView } from '../../context/AppContext';
import { formatTimeAgo } from '../../utils/formatters';
import { CommandPalette } from './CommandPalette';

const VIEW_TITLES: Record<ActiveView, { title: string; breadcrumb: string }> = {
  dashboard: { title: 'Practice Operations Dashboard', breadcrumb: 'Dashboard' },
  clients: { title: 'Client Directory & Services', breadcrumb: 'Clients' },
  tasks: { title: 'Workflows & Tasks', breadcrumb: 'Tasks' },
  calendar: { title: 'Deadlines & Compliance Calendar', breadcrumb: 'Calendar' },
  documents: { title: 'Client Document Requests', breadcrumb: 'Document Requests' },
  portal: { title: 'Client Secure Portal', breadcrumb: 'Client Portal' },
  messages: { title: 'Communication Inbox', breadcrumb: 'Messages' },
  invoices: { title: 'Firm-Service Invoices', breadcrumb: 'Invoices' },
  time: { title: 'Time Tracking & Timesheets', breadcrumb: 'Time Tracking' },
  team: { title: 'Team Directory & Workload', breadcrumb: 'Team' },
  reports: { title: 'Practice Operational Reports', breadcrumb: 'Reports' },
  notifications: { title: 'Notification Center & Automation', breadcrumb: 'Notifications' },
  settings: { title: 'Firm Settings & Configuration', breadcrumb: 'Settings' },
};

export const Header: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    setSidebarCollapsed,
    globalSearch,
    setGlobalSearch,
    setQuickCreateOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentUser,
    setCurrentUser,
    allUsers,
    workspaceSettings,
    resetDemoData,
    logout,
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to toggle sidebar (Cmd+[ or Ctrl+[)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const viewInfo = VIEW_TITLES[currentView] || { title: 'LedgerFlow', breadcrumb: 'Home' };

  return (
    <header className="h-16 bg-white border-b border-[#E5EBF0] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile hamburger + Desktop Sidebar Toggle + Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA] rounded-lg cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex p-1.5 text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA] rounded-lg transition-colors border border-transparent hover:border-[#E5EBF0] cursor-pointer"
          title={sidebarCollapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-[#788596]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[#788596]" />
          )}
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#788596] font-medium">
            <span>LedgerFlow</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#087EDB] font-bold">{viewInfo.breadcrumb}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-[#202938] truncate tracking-tight">
            {viewInfo.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="relative w-full text-left cursor-pointer group"
          title="Open Command Palette (Cmd/Ctrl + K)"
        >
          <Search className="w-4 h-4 text-[#788596] group-hover:text-[#202938] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <div className="w-full pl-9 pr-14 py-2 bg-[#F3F7FA] hover:bg-white border border-[#E5EBF0] rounded-xl text-xs text-[#788596] group-hover:text-[#202938] transition-all shadow-subtle flex items-center">
            <span>Search clients, tasks, requests, invoices...</span>
          </div>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 bg-white border border-[#E5EBF0] rounded-md text-[10px] font-mono text-[#788596] pointer-events-none shadow-xs group-hover:border-[#087EDB]/30">
            <span>⌘K</span>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Workspace Selector */}
        <div className="relative hidden xl:block" ref={workspaceRef}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E5EBF0] text-xs font-semibold text-[#202938] hover:bg-[#F3F7FA] transition-colors shadow-subtle"
          >
            <Building2 className="w-3.5 h-3.5 text-[#087EDB]" />
            <span className="max-w-[130px] truncate">{workspaceSettings.firmName}</span>
            <ChevronDown className="w-3 h-3 text-[#788596]" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-dropdown border border-[#E5EBF0] py-2 z-50 text-xs">
              <div className="px-3.5 py-1.5 text-[#788596] font-bold uppercase tracking-wider text-[10px]">
                Active Practice Workspace
              </div>
              <div className="px-3.5 py-2 bg-[#D9EFFA] text-[#087EDB] font-semibold flex items-center justify-between">
                <span className="truncate">{workspaceSettings.firmName}</span>
                <span className="w-2 h-2 rounded-full bg-[#087EDB]"></span>
              </div>
              <div className="px-3.5 py-1.5 text-[#788596]">
                Entity: {workspaceSettings.legalEntityName}
              </div>
              <div className="px-3.5 py-1.5 text-[#788596]">
                Tax Ref: {workspaceSettings.taxRegistrationNumber}
              </div>
              <div className="border-t border-[#E5EBF0] my-1" />
              <button
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  setCurrentView('settings');
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F3F7FA] text-[#202938] font-medium flex items-center justify-between"
              >
                <span>Edit Workspace Settings</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#788596]" />
              </button>
            </div>
          )}
        </div>

        {/* Quick-Create Button - Primary Bright Blue */}
        {currentUser.role !== 'Client' && (
          <button
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#087EDB] hover:bg-[#0668B6] text-white rounded-xl text-xs font-bold shadow-subtle border border-[#0668B6] transition-all active:scale-[0.98] cursor-pointer"
            title="Create Task, Client, Document Request, or Invoice"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Action</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-200/90 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-full border border-brand-200/50">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 6).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTo) {
                          setCurrentView(n.linkTo.view as ActiveView);
                          setNotifDropdownOpen(false);
                        }
                      }}
                      className={`p-3 text-xs flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 text-brand-600 flex-shrink-0">
                        {n.type === 'document' ? (
                          <FileText className="w-4 h-4" />
                        ) : n.type === 'task' ? (
                          <Clock className="w-4 h-4 text-amber-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900 truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {formatTimeAgo(n.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentView('notifications');
                    setNotifDropdownOpen(false);
                  }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View all alerts & rules →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help / Guide */}
        <button
          onClick={() => setHelpModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Practice Management Help & System Docs"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile & Persona Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              {currentUser.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
            <span className="text-xs font-semibold text-slate-900 hidden sm:inline truncate max-w-[100px] tracking-tight">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-modal border border-slate-200/90 py-2 z-50 text-xs">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-sm tracking-tight">{currentUser.name}</p>
                <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-700 font-semibold rounded-md text-[10px] border border-brand-200/50">
                  Role: {currentUser.role}
                </span>
              </div>

              {/* Persona Switcher Section */}
              <div className="px-3 pt-2.5 pb-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                  Switch Active Persona
                </div>
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">
                      <span>{u.name}</span>
                      <span className="text-slate-400 text-[10px] ml-1.5">({u.role})</span>
                    </div>
                    {u.id === currentUser.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setCurrentView('settings');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
              >
                <span>Firm Settings & Permissions</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  resetDemoData();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-amber-700 font-medium flex items-center gap-2"
                title="Reset all modified clients, tasks, and requests to default state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Records</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  const clientUser = allUsers.find(u => u.role === 'Client') || allUsers[allUsers.length - 1];
                  setCurrentUser(clientUser);
                  setCurrentView('portal');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
                <span>Switch to Client Portal View</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold text-xs flex items-center gap-2 border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-modal border border-slate-200/90 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <HelpCircle className="w-5 h-5 text-brand-600" />
                LedgerFlow Practice Guide
              </h3>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong className="text-slate-900">Purpose:</strong> LedgerFlow is an operations platform for accounting firms, bookkeeping agencies, and outsourced finance teams. It answers operational questions like task deadlines, missing documents, unbilled time, and staff capacity.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="font-semibold text-slate-900">Key Features Available:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Persona Switching:</strong> Switch between Firm Owner, Manager, Staff, and Client in the top-right menu to test tenant isolation.</li>
                  <li><strong>Document Requests:</strong> Track missing files, approve uploads, and request replacements.</li>
                  <li><strong>Live Time Tracking:</strong> Click Start Timer on any task or client to track billable work.</li>
                  <li><strong>Client Portal:</strong> Real client view for document submission and invoice review.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </header>
  );
};
