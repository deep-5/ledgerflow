import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  RotateCw,
  Zap,
  Sliders,
  Filter,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { formatTimeAgo } from '../../utils/formatters';

export const NotificationsCenter: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    automationRules,
    toggleAutomationRule,
    setCurrentView,
  } = useApp();

  type TabType = 'notifications' | 'automation';
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const filteredNotifs = notifications.filter(n => (filterUnreadOnly ? !n.read : true));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202938]">Notifications & Practice Automation</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7]">
              {unreadCount} Unread Alerts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#788596] mt-0.5">
            Real-time event feed, client submission alerts, and automated follow-up reminder rules.
          </p>
        </div>

        {unreadCount > 0 && activeTab === 'notifications' && (
          <Button variant="outline" size="sm" icon={<Check className="w-4 h-4" />} onClick={markAllNotificationsAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5EBF0] gap-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
            activeTab === 'notifications'
              ? 'border-[#087EDB] text-[#087EDB] font-bold'
              : 'border-transparent text-[#788596] hover:text-[#202938]'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alert Feed
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#D9EFFA] text-[#087EDB] text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
            activeTab === 'automation'
              ? 'border-[#087EDB] text-[#087EDB] font-bold'
              : 'border-transparent text-[#788596] hover:text-[#202938]'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          Practice Automation Rules ({automationRules.filter(r => r.enabled).length} Active)
        </button>
      </div>

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#788596] bg-white p-3 rounded-2xl border border-[#E5EBF0] shadow-card">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterUnreadOnly}
                onChange={e => setFilterUnreadOnly(e.target.checked)}
                className="rounded border-[#E5EBF0] text-[#087EDB] focus:ring-[#087EDB]/20"
              />
              <span className="font-semibold text-[#202938]">Show unread alerts only</span>
            </label>

            <span className="text-[11px] text-[#788596] font-medium">Showing {filteredNotifs.length} items</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden divide-y divide-[#E5EBF0] text-xs">
            {filteredNotifs.length === 0 ? (
              <div className="p-12 text-center text-[#788596]">
                <Bell className="w-8 h-8 text-[#788596]/40 mx-auto mb-2" />
                <p className="font-semibold text-[#202938] text-sm">No notifications to display</p>
                <p className="text-xs text-[#788596] mt-1">You are all caught up on practice alerts!</p>
              </div>
            ) : (
              filteredNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.linkTo) setCurrentView(n.linkTo.view as any);
                  }}
                  className={`p-4 flex items-start gap-3.5 hover:bg-[#F3F7FA] transition-colors cursor-pointer group ${
                    !n.read ? 'bg-[#D9EFFA]/25' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#F3F7FA] border border-[#E5EBF0] text-[#087EDB] mt-0.5 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {n.type === 'document' ? (
                      <FileText className="w-4 h-4 text-[#087EDB]" />
                    ) : n.type === 'task' ? (
                      <Clock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#202938] group-hover:text-[#087EDB] transition-colors text-sm">
                        {n.title}
                      </p>
                      <span className="text-[11px] text-[#788596] font-medium flex-shrink-0">
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-[#202938]/80 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>

                  {!n.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#087EDB] mt-2 flex-shrink-0 shadow-sm" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AUTOMATION RULES TAB */}
      {activeTab === 'automation' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-[#202938] flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Background Practice Automation Engine</p>
              <p className="mt-0.5 text-[#788596] leading-relaxed">
                Rules execute autonomously in the background to dispatch reminders, notify reviewers, and alert accountants of overdue client responses without manual overhead.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationRules.map(rule => (
              <div
                key={rule.id}
                className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#087EDB] bg-[#D9EFFA] px-2 py-0.5 rounded-full border border-[#BCE3F7] uppercase tracking-wider">
                      {rule.trigger}
                    </span>

                    <button
                      onClick={() => toggleAutomationRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.enabled ? 'bg-[#087EDB]' : 'bg-[#E5EBF0]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          rule.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-[#202938] tracking-tight">{rule.name}</h4>
                  <p className="text-xs text-[#788596] mt-1.5 leading-relaxed">{rule.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5EBF0] flex items-center justify-between text-[11px]">
                  <span className={`font-bold ${rule.enabled ? 'text-[#2A6605]' : 'text-[#788596]'}`}>
                    {rule.enabled ? '• Active & Running' : '• Paused'}
                  </span>
                  <span className="text-[#788596] font-medium">Action: {rule.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
