import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Receipt,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Play,
  Check,
  Calendar,
  Send,
  Building,
  UploadCloud,
  MessageSquare,
  ShieldCheck,
  Filter,
  Sparkles,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatTimeAgo } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TaskStatus } from '../../types';

export const DashboardHome: React.FC = () => {
  const {
    currentUser,
    clients,
    tasks,
    documentRequests,
    invoices,
    allUsers,
    auditLogs,
    setCurrentView,
    setSelectedClientId,
    setSelectedTaskId,
    setQuickCreateOpen,
    updateTaskStatus,
    startTimer,
    activeTimer,
    stopTimer,
  } = useApp();

  const [dateRange, setDateRange] = useState('This Month (Oct 2024)');

  // Derived real KPI metrics
  const activeClientsCount = clients.filter(c => c.status === 'Active').length;
  
  // Real tasks due today or overdue
  const todayStr = '2024-10-17';
  const tasksDueToday = tasks.filter(t => t.dueDate === todayStr && t.status !== 'Completed');
  const overdueTasks = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed');

  // Missing documents
  const missingDocRequests = documentRequests.filter(
    r => r.status === 'Sent' || r.status === 'Partially Received' || r.status === 'Changes Requested'
  );

  // Outstanding invoices
  const outstandingInvoices = invoices.filter(i => i.balanceDue > 0);
  const totalOutstandingBalance = outstandingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // My tasks
  const myTasks = tasks.filter(
    t => (t.assignedStaffId === currentUser.id || currentUser.role === 'Firm Owner') && t.status !== 'Completed'
  );

  // Team capacity and workload breakdown
  const staffMembers = allUsers.filter(u => u.role !== 'Client');
  const workloadByStaff = staffMembers.map(staff => {
    const assignedTasks = tasks.filter(t => t.assignedStaffId === staff.id);
    const openTasks = assignedTasks.filter(t => t.status !== 'Completed');
    const overdueCount = openTasks.filter(t => t.dueDate < todayStr).length;
    const estimatedHours = openTasks.reduce((sum, t) => sum + (t.estimatedHours || 2), 0);
    const capacityHours = staff.weeklyCapacityHours || 40;
    const utilizationPercent = Math.min(100, Math.round((estimatedHours / capacityHours) * 100));

    return {
      staff,
      openCount: openTasks.length,
      overdueCount,
      estimatedHours,
      capacityHours,
      utilizationPercent,
    };
  });

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Modern Greeting & Action Hero Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E5EBF0] shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#5DB321] ring-4 ring-[#EBFDD8]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#202938] tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7]">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#788596] mt-1 max-w-2xl leading-relaxed">
              Apex Advisory operations overview: <strong className="text-[#202938]">{tasksDueToday.length} task due today</strong>, <strong className="text-rose-600">{overdueTasks.length} overdue item</strong>, and <strong className="text-amber-600">{missingDocRequests.length} client document packages</strong> awaiting submission.
            </p>
          </div>

          {/* Date filter & Quick Action */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F7FA] hover:bg-white border border-[#E5EBF0] rounded-xl text-xs font-semibold text-[#202938] shadow-subtle transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#788596]" />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="bg-transparent text-[#202938] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="This Month (Oct 2024)">This Month (Oct 2024)</option>
                <option value="This Quarter (Q4)">This Quarter (Q4)</option>
                <option value="Year to Date">Year to Date (2024)</option>
              </select>
            </div>

            <button
              onClick={() => setQuickCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#087EDB] hover:bg-[#0668B6] active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-subtle border border-[#0668B6] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Active Clients */}
        <div
          onClick={() => setCurrentView('clients')}
          className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#788596]">Clients</span>
              <div className="w-7 h-7 rounded-lg bg-[#D9EFFA] border border-[#BCE3F7] flex items-center justify-center text-[#087EDB] shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#202938] tracking-tight">{activeClientsCount}</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#788596] mt-2 pt-2 border-t border-[#E5EBF0] font-medium">
            <span className="px-1.5 py-0.2 font-bold bg-[#A7F477] text-[#1E5405] rounded text-[10px]">+100%</span>
            <span className="truncate">Active retainers</span>
          </div>
        </div>

        {/* Tasks Due Today - Light Blue Secondary Card */}
        <div
          onClick={() => setCurrentView('tasks')}
          className="p-4 bg-[#D9EFFA] rounded-2xl border border-[#BCE3F7] shadow-card hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0668B6]">Due Today</span>
              <div className="w-7 h-7 rounded-lg bg-[#087EDB] border border-[#0668B6] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#202938] tracking-tight">{tasksDueToday.length}</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#0668B6] font-semibold mt-2 pt-2 border-t border-[#BCE3F7]/80 truncate">
            <span>Mid-Month Payroll</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => setCurrentView('tasks')}
          className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card hover:shadow-card-hover hover:border-rose-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#788596]">Overdue</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-xs group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">{overdueTasks.length}</div>
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-2 pt-2 border-t border-[#E5EBF0] truncate">
            Needs sign-off
          </div>
        </div>

        {/* Missing Documents */}
        <div
          onClick={() => setCurrentView('documents')}
          className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#788596]">Missing Docs</span>
              <div className="w-7 h-7 rounded-lg bg-[#F3F7FA] border border-[#E5EBF0] flex items-center justify-center text-[#087EDB] shadow-xs group-hover:scale-105 transition-transform">
                <FileQuestion className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#202938] tracking-tight">{missingDocRequests.length}</div>
          </div>
          <div className="text-[11px] text-[#788596] font-medium mt-2 pt-2 border-t border-[#E5EBF0] truncate">
            3 clients awaiting
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div
          onClick={() => setCurrentView('invoices')}
          className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#788596]">Unpaid Fees</span>
              <div className="w-7 h-7 rounded-lg bg-[#F3F7FA] border border-[#E5EBF0] flex items-center justify-center text-[#087EDB] shadow-xs group-hover:scale-105 transition-transform">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#202938] tracking-tight truncate">
              {formatCurrency(totalOutstandingBalance, 'USD')}
            </div>
          </div>
          <div className="text-[11px] text-[#788596] font-medium mt-2 pt-2 border-t border-[#E5EBF0] truncate">
            {outstandingInvoices.length} invoices due
          </div>
        </div>

        {/* Team Workload */}
        <div
          onClick={() => setCurrentView('team')}
          className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#788596]">Capacity</span>
              <div className="w-7 h-7 rounded-lg bg-[#EBFDD8] border border-[#A7F477] flex items-center justify-center text-[#2A6605] shadow-xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#202938] tracking-tight">68%</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#788596] mt-2 pt-2 border-t border-[#E5EBF0] font-medium truncate">
            <span className="px-1.5 py-0.2 font-bold bg-[#A7F477] text-[#1E5405] rounded text-[10px]">Balanced</span>
            <span className="truncate">optimal load</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-6">
        {/* Left Column (8 cols wide on xl): Deadlines, Missing Docs, My Tasks */}
        <div className="lg:col-span-2 xl:col-span-8 space-y-6">
          {/* Section: Upcoming Deadlines */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202938] tracking-tight">Approaching Deadlines</h3>
                <p className="text-xs text-[#788596]">Statutory and client compliance due within 7 days</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#087EDB] hover:text-[#0668B6] text-xs font-bold"
                onClick={() => setCurrentView('calendar')}
              >
                Calendar View →
              </Button>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              {tasks.slice(0, 5).map(task => {
                const client = clients.find(c => c.id === task.clientId);
                const staff = allUsers.find(u => u.id === task.assignedStaffId);
                const isOverdue = task.dueDate < todayStr && task.status !== 'Completed';

                return (
                  <div
                    key={task.id}
                    className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-[#F3F7FA] transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setCurrentView('tasks');
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#202938] truncate group-hover:text-[#087EDB] transition-colors">
                          {task.title}
                        </span>
                        <Badge status={task.priority} size="sm" showDot={false} />
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#788596] mt-1">
                        <span className="font-medium text-[#202938]">{client?.company}</span>
                        <span className="text-[#E5EBF0]">•</span>
                        <span>{staff?.name}</span>
                        <span className="text-[#E5EBF0]">•</span>
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          Due {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <Badge status={task.status} size="sm" />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (task.status !== 'Completed') {
                            updateTaskStatus(task.id, 'Completed');
                          }
                        }}
                        className="w-7 h-7 rounded-lg text-[#788596] hover:text-[#1E5405] hover:bg-[#EBFDD8] border border-transparent hover:border-[#A7F477] flex items-center justify-center transition-all shadow-xs"
                        title="Mark Completed"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Missing Documents */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202938] tracking-tight">Missing Client Documents</h3>
                <p className="text-xs text-[#788596]">Upload checklists awaiting bank feeds, receipts, or client approval</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#087EDB] hover:text-[#0668B6] text-xs font-bold"
                onClick={() => setCurrentView('documents')}
              >
                All Requests →
              </Button>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              {missingDocRequests.map(req => {
                const client = clients.find(c => c.id === req.clientId);
                const receivedCount = req.items.filter(i => !!i.uploadedFile).length;
                const totalCount = req.items.length;
                const percent = Math.round((receivedCount / totalCount) * 100);
                const isOverdue = req.dueDate < todayStr;

                return (
                  <div
                    key={req.id}
                    className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-[#F3F7FA] transition-colors cursor-pointer group"
                    onClick={() => setCurrentView('documents')}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#202938] truncate group-hover:text-[#087EDB] transition-colors">
                          {req.title}
                        </span>
                        <Badge status={req.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#788596] mt-1">
                        <span className="font-medium text-[#202938]">{client?.company}</span>
                        <span className="text-[#E5EBF0]">•</span>
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          Due {formatDate(req.dueDate)}
                        </span>
                        <span className="text-[#E5EBF0]">•</span>
                        <span>Remind: {req.reminderSchedule}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Modern Progress bar */}
                      <div className="hidden sm:flex flex-col items-end w-28">
                        <span className="text-[10px] font-bold text-[#788596] uppercase tracking-tight">
                          {receivedCount}/{totalCount} files ({percent}%)
                        </span>
                        <div className="w-full h-1.5 bg-[#E5EBF0] rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent === 100
                                ? 'bg-[#A7F477]'
                                : percent > 0
                                ? 'bg-[#087EDB]'
                                : 'bg-[#E5EBF0]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          setCurrentView('documents');
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: My Tasks */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202938] tracking-tight">My Active Work</h3>
                <p className="text-xs text-[#788596]">Assigned workflow items on your desk</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#087EDB] hover:text-[#0668B6] text-xs font-bold"
                onClick={() => setCurrentView('tasks')}
              >
                Task Board →
              </Button>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              {myTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#788596]">
                  No pending tasks currently assigned to you.
                </div>
              ) : (
                myTasks.slice(0, 4).map(task => {
                  const client = clients.find(c => c.id === task.clientId);
                  const isTimerForThis = activeTimer?.taskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-[#F3F7FA] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-[#202938] truncate">
                            {task.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#F3F7FA] text-[#788596] font-medium rounded-md border border-[#E5EBF0]">
                            {task.serviceCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-[#788596] mt-1">
                          <span className="font-medium text-[#202938]">{client?.company}</span>
                          <span className="text-[#E5EBF0]">•</span>
                          <span>Est: {task.estimatedHours} hrs</span>
                          <span className="text-[#E5EBF0]">•</span>
                          <span className="font-medium">Due {formatDate(task.dueDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Quick Start Timer button */}
                        <button
                          onClick={() => {
                            if (isTimerForThis) {
                              stopTimer();
                            } else {
                              startTimer(task.clientId, task.id, `Working on: ${task.title}`);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                            isTimerForThis
                              ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-100'
                              : 'bg-white text-[#202938] hover:text-[#087EDB] border-[#E5EBF0] hover:bg-[#F3F7FA] hover:border-[#BCE3F7]'
                          }`}
                          title={isTimerForThis ? 'Stop timer' : 'Start live timer'}
                        >
                          <Play className={`w-3 h-3 ${isTimerForThis ? 'text-rose-600 fill-rose-600' : 'fill-current'}`} />
                          <span className="hidden sm:inline">
                            {isTimerForThis ? 'Running' : 'Timer'}
                          </span>
                        </button>

                        {/* Status Select dropdown */}
                        <select
                          value={task.status}
                          onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="px-2.5 py-1.5 text-xs border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 shadow-subtle cursor-pointer"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Waiting for Client">Waiting for Client</option>
                          <option value="In Review">In Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols wide on xl): Team Workload, Unpaid Invoices, Audit Activity */}
        <div className="lg:col-span-1 xl:col-span-4 space-y-6">
          {/* Section: Team Workload (Capacity) */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202938] tracking-tight">Team Capacity</h3>
                <p className="text-xs text-[#788596]">Weekly allocated workload</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#087EDB] hover:text-[#0668B6] text-xs font-bold"
                onClick={() => setCurrentView('team')}
              >
                Team →
              </Button>
            </div>

            <div className="p-5 space-y-4">
              {workloadByStaff.map(({ staff, openCount, overdueCount, utilizationPercent, estimatedHours }) => (
                <div key={staff.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-[#202938] flex items-center gap-1.5 truncate">
                      <span>{staff.name}</span>
                      <span className="text-[10px] text-[#788596] font-normal">
                        ({staff.role})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#788596]">
                      <span className="font-bold text-[#202938]">{openCount} tasks</span>
                      {overdueCount > 0 && (
                        <span className="text-rose-600 font-bold ml-1">
                          ({overdueCount} overdue)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[#E5EBF0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        utilizationPercent > 85
                          ? 'bg-rose-500'
                          : utilizationPercent > 65
                          ? 'bg-[#087EDB]'
                          : 'bg-[#A7F477]'
                      }`}
                      style={{ width: `${utilizationPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#788596] font-medium">
                    <span>{estimatedHours} est. hrs queued</span>
                    <span>{utilizationPercent}% capacity</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Outstanding Invoices */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202938] tracking-tight">Pending Invoices</h3>
                <p className="text-xs text-[#788596]">Firm service fees awaiting payment</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#087EDB] hover:text-[#0668B6] text-xs font-bold"
                onClick={() => setCurrentView('invoices')}
              >
                Invoices →
              </Button>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              {outstandingInvoices.slice(0, 3).map(inv => (
                <div
                  key={inv.id}
                  className="p-4 hover:bg-[#F3F7FA] transition-colors cursor-pointer"
                  onClick={() => setCurrentView('invoices')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#202938]">
                      {inv.invoiceNumber}
                    </span>
                    <span className="font-bold text-xs text-[#202938]">
                      {formatCurrency(inv.balanceDue, inv.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#788596] mt-1">
                    <span className="truncate max-w-[150px]">{inv.clientCompany}</span>
                    <Badge status={inv.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recent Activity / Live Stream */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202938] tracking-tight">Audit Stream</h3>
                <p className="text-xs text-[#788596]">Live operational ledger logs</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#087EDB] hover:text-[#0668B6] text-xs font-bold"
                onClick={() => setCurrentView('settings')}
              >
                Audit →
              </Button>
            </div>

            <div className="p-4 space-y-3.5">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#087EDB] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#202938] leading-tight truncate">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-[#788596] line-clamp-1 mt-0.5">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#788596] mt-0.5">
                      <span>{log.performedBy.split(' ')[0]}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
