import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  List,
  Kanban,
  Calendar as CalendarIcon,
  User,
  Users,
  Search,
  Plus,
  Play,
  StopCircle,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  MoreVertical,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TaskDetailModal } from './TaskDetailModal';
import { formatDate } from '../../utils/formatters';
import { Task, TaskPriority, TaskStatus } from '../../types';

export const TaskList: React.FC = () => {
  const {
    tasks,
    clients,
    allUsers,
    currentUser,
    addTask,
    updateTaskStatus,
    updateTask,
    selectedTaskId,
    setSelectedTaskId,
    setQuickCreateOpen,
    startTimer,
    stopTimer,
    activeTimer,
    setCurrentView,
  } = useApp();

  type ViewMode = 'table' | 'kanban' | 'mytasks' | 'teamtasks';
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');

  // Recurring Template Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateClientId, setTemplateClientId] = useState(clients[0]?.id || '');
  const [selectedTemplate, setSelectedTemplate] = useState('monthly_bookkeeping');

  const RECURRING_TEMPLATES = [
    {
      id: 'monthly_bookkeeping',
      title: 'Monthly Bookkeeping Close & Reconciliations',
      category: 'Monthly Bookkeeping',
      description: 'End of month bank reconciliation, credit card receipt matching, payroll journal entry, and accrual schedule.',
      estHours: 4.5,
      interval: 'monthly',
      checklist: [
        { id: '1', text: 'Import and clear operating bank transactions', completed: false },
        { id: '2', text: 'Reconcile credit card feeds and chase missing receipts', completed: false },
        { id: '3', text: 'Post accrued revenue and prepaid amortization', completed: false },
        { id: '4', text: 'Generate draft P&L and Balance Sheet for manager review', completed: false },
      ],
    },
    {
      id: 'quarterly_review',
      title: 'Quarterly Management Review & Variance Analysis',
      category: 'Advisory & Forecasts',
      description: 'Detailed analysis of budget vs actuals, gross margin fluctuations, and quarterly director briefing packet.',
      estHours: 6.0,
      interval: 'quarterly',
      checklist: [
        { id: '1', text: 'Calculate QoQ departmental spending variance', completed: false },
        { id: '2', text: 'Update rolling 13-week cash forecast', completed: false },
        { id: '3', text: 'Schedule quarterly client executive sync', completed: false },
      ],
    },
    {
      id: 'payroll_prep',
      title: 'Bi-Weekly Payroll Audit & Tax Remittance',
      category: 'Payroll Operations',
      description: 'Verify employee timesheets, benefits deduction schedules, and state unemployment insurance caps.',
      estHours: 2.0,
      interval: 'monthly',
      checklist: [
        { id: '1', text: 'Audit overtime and bonus additions', completed: false },
        { id: '2', text: 'Validate state tax withholdings per employee location', completed: false },
        { id: '3', text: 'Submit payroll batch for client authorization', completed: false },
      ],
    },
    {
      id: 'year_end',
      title: 'Year-End 1099 & Tax Preparation Package',
      category: 'Corporate Tax Filing',
      description: 'Review contractor vendor ledgers, verify W-9 forms on file, and assemble trial balance for tax return.',
      estHours: 8.0,
      interval: 'annually',
      checklist: [
        { id: '1', text: 'Filter vendor disbursements exceeding $600 threshold', completed: false },
        { id: '2', text: 'Reconcile fixed asset additions and depreciation', completed: false },
        { id: '3', text: 'Assemble year-end trial balance package', completed: false },
      ],
    },
  ];

  const handleApplyTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const tmpl = RECURRING_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!tmpl || !templateClientId) return;

    addTask({
      title: tmpl.title,
      clientId: templateClientId,
      serviceCategory: tmpl.category,
      description: tmpl.description,
      assignedStaffId: allUsers[2]?.id || currentUser.id,
      reviewerId: allUsers[4]?.id || 'user-5',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      priority: 'High',
      status: 'Not Started',
      estimatedHours: tmpl.estHours,
      actualHours: 0,
      tags: [tmpl.category, 'Template'],
      isRecurring: true,
      recurrenceInterval: tmpl.interval as any,
      checklist: tmpl.checklist,
    });

    setIsTemplateModalOpen(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const client = clients.find(c => c.id === t.clientId);
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.serviceCategory.toLowerCase().includes(search.toLowerCase()) ||
        (client && client.company.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (viewMode === 'mytasks' && t.assignedStaffId !== currentUser.id) return false;
      if (viewMode === 'teamtasks' && t.assignedStaffId === currentUser.id) return false;

      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (clientFilter !== 'all' && t.clientId !== clientFilter) return false;
      if (staffFilter !== 'all' && t.assignedStaffId !== staffFilter) return false;

      return true;
    });
  }, [tasks, search, viewMode, statusFilter, priorityFilter, clientFilter, staffFilter, clients, currentUser.id]);

  const kanbanColumns: TaskStatus[] = [
    'Not Started',
    'In Progress',
    'Waiting for Client',
    'In Review',
    'Completed',
  ];

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workflows & Tasks</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize practice work, deadlines, recurring bookkeeping templates, and review handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCw className="w-3.5 h-3.5 text-brand-600" />}
            onClick={() => setIsTemplateModalOpen(true)}
          >
            Apply Template
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setQuickCreateOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-[#F3F7FA] p-1 rounded-xl border border-[#E5EBF0] text-xs font-semibold w-full lg:w-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                viewMode === 'table' ? 'bg-white text-[#087EDB] shadow-sm font-bold' : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                viewMode === 'kanban' ? 'bg-white text-[#087EDB] shadow-sm font-bold' : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('mytasks')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                viewMode === 'mytasks' ? 'bg-white text-[#087EDB] shadow-sm font-bold' : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              My Tasks
            </button>
            <button
              onClick={() => setViewMode('teamtasks')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                viewMode === 'teamtasks' ? 'bg-white text-[#087EDB] shadow-sm font-bold' : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Team Tasks
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks, clients, or service scope..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F3F7FA] hover:bg-white focus:bg-white border border-[#E5EBF0] rounded-xl text-xs text-[#202938] placeholder-[#788596] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 shadow-subtle transition-all"
            />
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#E5EBF0] flex-wrap text-xs">
          <span className="text-[#788596] font-semibold text-[11px] uppercase tracking-wider">Filters:</span>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Client">Waiting for Client</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>

          <select
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
          >
            <option value="all">All Assignees</option>
            {allUsers
              .filter(u => u.role !== 'Client')
              .map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>

          <span className="ml-auto text-xs font-bold text-[#788596]">
            {filteredTasks.length} tasks
          </span>
        </div>
      </div>

      {/* TABLE VIEW */}
      {(viewMode === 'table' || viewMode === 'mytasks' || viewMode === 'teamtasks') && (
        <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3F7FA] border-b border-[#E5EBF0] text-[#788596] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Task Name</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      No tasks found matching current filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const client = clients.find(c => c.id === task.clientId);
                    const staff = allUsers.find(u => u.id === task.assignedStaffId);
                    const reviewer = allUsers.find(u => u.id === task.reviewerId);
                    const isOverdue = task.dueDate < '2024-10-17' && task.status !== 'Completed';
                    const isTimerRunning = activeTimer?.taskId === task.id;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors tracking-tight">
                              {task.title}
                            </span>
                            {task.isRecurring && (
                              <span className="px-1.5 py-0.2 bg-blue-50 text-brand-700 text-[10px] rounded-md font-semibold border border-blue-200/50">
                                {task.recurrenceInterval}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{client?.company}</span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-slate-500 font-medium">{task.serviceCategory}</span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {staff?.name || 'Unassigned'}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-slate-500">
                            {reviewer?.name || 'Unassigned'}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800 font-medium'}
                          >
                            {formatDate(task.dueDate)}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <Badge status={task.priority} size="sm" showDot={false} />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <select
                            value={task.status}
                            onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className="px-2.5 py-1 text-xs border border-slate-200/90 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none shadow-subtle cursor-pointer"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Waiting for Client">Waiting for Client</option>
                            <option value="In Review">In Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (isTimerRunning) stopTimer();
                                else startTimer(task.clientId, task.id, `Task: ${task.title}`);
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isTimerRunning
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-100'
                                  : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50 border-transparent hover:border-brand-200'
                              }`}
                              title={isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                            >
                              <Play className={`w-3.5 h-3.5 ${isTimerRunning ? 'fill-rose-600 text-rose-600' : 'fill-current'}`} />
                            </button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kanbanColumns.map(statusCol => {
            const tasksInCol = filteredTasks.filter(t => t.status === statusCol);

            return (
              <div
                key={statusCol}
                className="bg-[#F3F7FA] p-3.5 rounded-2xl border border-[#E5EBF0] flex flex-col min-h-[520px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5EBF0]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#202938] tracking-tight">{statusCol}</span>
                    <span className="px-1.5 py-0.2 bg-white text-[#788596] text-[10px] font-bold rounded-full border border-[#E5EBF0] shadow-xs">
                      {tasksInCol.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {tasksInCol.map(task => {
                    const client = clients.find(c => c.id === task.clientId);
                    const staff = allUsers.find(u => u.id === task.assignedStaffId);
                    const isOverdue = task.dueDate < '2024-10-17' && task.status !== 'Completed';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="p-4 bg-white rounded-xl border border-[#E5EBF0] shadow-card hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#788596] truncate max-w-[120px]">
                            {client?.company}
                          </span>
                          <Badge status={task.priority} size="sm" showDot={false} />
                        </div>

                        <h4 className="font-bold text-xs text-[#202938] line-clamp-2 group-hover:text-[#087EDB] transition-colors tracking-tight">
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-[#788596] mt-3 pt-2.5 border-t border-[#E5EBF0]">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                            {formatDate(task.dueDate)}
                          </span>
                          <span className="font-semibold text-[#202938]">{staff?.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Recurring Workflow Template Modal */}
      {isTemplateModalOpen && (
        <Modal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          title="Apply Practice Workflow Template"
          subtitle="Generate recurring monthly, quarterly, or annual accounting work packages."
          maxWidth="2xl"
        >
          <form onSubmit={handleApplyTemplate} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Client *
              </label>
              <select
                value={templateClientId}
                onChange={e => setTemplateClientId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white font-medium"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.clientType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Workflow Template
              </label>
              <div className="space-y-2.5">
                {RECURRING_TEMPLATES.map(tmpl => (
                  <label
                    key={tmpl.id}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                      selectedTemplate === tmpl.id
                        ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs'
                        : 'border-slate-200/90 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="templateSelect"
                          value={tmpl.id}
                          checked={selectedTemplate === tmpl.id}
                          onChange={() => setSelectedTemplate(tmpl.id)}
                          className="text-brand-600"
                        />
                        <span className="font-bold text-xs text-slate-900 tracking-tight">{tmpl.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-slate-500 font-semibold shadow-xs">
                        {tmpl.estHours} hrs • {tmpl.interval}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 pl-6 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Spawn Template Tasks
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
