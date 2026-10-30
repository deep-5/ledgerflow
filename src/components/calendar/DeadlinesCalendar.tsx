import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Receipt,
  Users,
  Building2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatDate } from '../../utils/formatters';
import { CalendarEvent } from '../../types';

export const DeadlinesCalendar: React.FC = () => {
  const {
    calendarEvents,
    clients,
    allUsers,
    addCalendarEvent,
    setSelectedTaskId,
    setCurrentView,
  } = useApp();

  type CalendarView = 'month' | 'agenda';
  const [calendarView, setCalendarView] = useState<CalendarView>('month');

  // Year & Month: October 2024 to match seed data timeline
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  const [clientFilter, setClientFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Event Creation Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('Task Deadline');
  const [newEventDate, setNewEventDate] = useState('2024-10-20');
  const [newEventTime, setNewEventTime] = useState('14:00');
  const [newEventClientId, setNewEventClientId] = useState(clients[0]?.id || '');
  const [newEventStaffId, setNewEventStaffId] = useState(allUsers[2]?.id || '');

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(ev => {
      if (clientFilter !== 'all' && ev.clientId !== clientFilter) return false;
      if (staffFilter !== 'all' && ev.assignedStaffId !== staffFilter) return false;
      if (typeFilter !== 'all' && ev.type !== typeFilter) return false;
      return true;
    });
  }, [calendarEvents, clientFilter, staffFilter, typeFilter]);

  // Statistics
  const eventStats = useMemo(() => {
    const total = filteredEvents.length;
    const taskDeadlines = filteredEvents.filter(e => e.type === 'Task Deadline').length;
    const docRequests = filteredEvents.filter(e => e.type === 'Document Due').length;
    const clientReviews = filteredEvents.filter(e => e.type === 'Client Review' || e.type === 'Team Meeting').length;
    return { total, taskDeadlines, docRequests, clientReviews };
  }, [filteredEvents]);

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyPrefixSlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const client = clients.find(c => c.id === newEventClientId);
    addCalendarEvent({
      title: newEventTitle.trim(),
      type: newEventType,
      date: newEventDate,
      time: newEventTime,
      clientId: newEventClientId,
      clientName: client?.company || client?.name,
      assignedStaffId: newEventStaffId,
    });

    setIsEventModalOpen(false);
    setNewEventTitle('');
  };

  const getEventTypeStyles = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'Task Deadline':
        return 'bg-[#D9EFFA] text-[#0668B6] border-[#BCE3F7] hover:bg-[#cbe6f7]';
      case 'Document Due':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'Invoice Due':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      case 'Client Review':
        return 'bg-[#EBFDD8] text-[#2A6605] border-[#A7F477] hover:bg-[#dffac4]';
      case 'Team Meeting':
      default:
        return 'bg-[#F3F7FA] text-[#202938] border-[#E5EBF0] hover:bg-slate-100';
    }
  };

  const handleEventClick = (ev: CalendarEvent) => {
    if (ev.relatedId?.startsWith('task-')) {
      setSelectedTaskId(ev.relatedId);
      setCurrentView('tasks');
    } else if (ev.relatedId?.startsWith('req-')) {
      setCurrentView('documents');
    } else if (ev.relatedId?.startsWith('inv-')) {
      setCurrentView('invoices');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202938]">Deadlines & Compliance Calendar</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7]">
              {filteredEvents.length} Events
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#788596] mt-0.5">
            Monitor client statutory filing dates, document cutoff deadlines, and internal review checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsEventModalOpen(true)}
          >
            Add Deadline / Event
          </Button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-[#087EDB]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Scheduled Events</span>
            <div className="w-8 h-8 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#202938] tracking-tight">{eventStats.total}</div>
          <p className="text-[11px] text-[#788596] mt-1">Calendarized client commitments</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-[#087EDB]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Task Deadlines</span>
            <div className="w-8 h-8 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#087EDB] tracking-tight">{eventStats.taskDeadlines}</div>
          <p className="text-[11px] text-[#788596] mt-1">Filing and reconciliation cutoff</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Document Due Dates</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 tracking-tight">{eventStats.docRequests}</div>
          <p className="text-[11px] text-[#788596] mt-1">Requested statement submissions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-[#A7F477] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Client Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBFDD8] border border-[#A7F477] text-[#2A6605] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#2A6605] tracking-tight">{eventStats.clientReviews}</div>
          <p className="text-[11px] text-[#788596] mt-1">Scheduled advisory & approvals</p>
        </div>
      </div>

      {/* Filter and Month Navigation Bar */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#E5EBF0] shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-[#E5EBF0] hover:bg-[#F3F7FA] text-[#788596] hover:text-[#202938] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm sm:text-base text-[#202938] min-w-[160px] text-center tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-[#E5EBF0] hover:bg-[#F3F7FA] text-[#788596] hover:text-[#202938] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentYear(2024);
              setCurrentMonth(9);
            }}
            className="text-xs text-[#087EDB] font-bold hover:underline px-2.5 py-1 rounded-lg bg-[#D9EFFA] border border-[#BCE3F7]"
          >
            Today (Oct 17)
          </button>
        </div>

        {/* View Mode & Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* View toggle */}
          <div className="flex bg-[#F3F7FA] p-1 rounded-xl border border-[#E5EBF0]">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarView === 'month' ? 'bg-white text-[#087EDB] font-bold shadow-sm' : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setCalendarView('agenda')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarView === 'agenda' ? 'bg-white text-[#087EDB] font-bold shadow-sm' : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              Agenda View
            </button>
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
          >
            <option value="all">All Event Types</option>
            <option value="Task Deadline">Task Deadlines</option>
            <option value="Document Due">Document Requests</option>
            <option value="Invoice Due">Invoices Due</option>
            <option value="Client Review">Client Reviews</option>
            <option value="Team Meeting">Meetings</option>
          </select>

          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {calendarView === 'month' && (
        <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
          {/* Day of Week headers */}
          <div className="grid grid-cols-7 border-b border-[#E5EBF0] bg-[#F3F7FA] text-center text-xs font-bold text-[#788596] py-3 uppercase tracking-wider text-[10px]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E5EBF0] min-h-[640px]">
            {emptyPrefixSlots.map(slot => (
              <div key={`empty-${slot}`} className="bg-[#F3F7FA]/50 p-2 min-h-[110px]" />
            ))}

            {daysArray.map(dayNum => {
              const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const eventsForDay = filteredEvents.filter(e => e.date === dateString);
              const isToday = dateString === '2024-10-17';

              return (
                <div
                  key={dayNum}
                  className={`p-2 min-h-[110px] transition-colors hover:bg-[#F3F7FA] flex flex-col group ${
                    isToday ? 'bg-[#D9EFFA]/30' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold rounded-xl w-6 h-6 flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-[#087EDB] text-white font-extrabold shadow-sm'
                          : 'text-[#202938] group-hover:text-[#087EDB]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {eventsForDay.length > 0 && (
                      <span className="text-[10px] text-[#788596] font-semibold px-1 rounded">
                        {eventsForDay.length} due
                      </span>
                    )}
                  </div>

                  {/* Day Events List */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    {eventsForDay.map(ev => {
                      const colorClass = getEventTypeStyles(ev.type);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => handleEventClick(ev)}
                          className={`p-1.5 rounded-lg border text-[11px] leading-tight truncate cursor-pointer transition-all hover:scale-[1.02] shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${colorClass}`}
                          title={`${ev.title} (${ev.clientName || 'General'}) • Click to open related item`}
                        >
                          <div className="font-bold truncate">{ev.title}</div>
                          {ev.clientName && (
                            <div className="text-[9px] opacity-80 truncate mt-0.5">{ev.clientName}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {calendarView === 'agenda' && (
        <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#202938]">Chronological Compliance Agenda</h3>
            <span className="text-xs text-[#788596] font-medium">{filteredEvents.length} upcoming deadlines</span>
          </div>

          <div className="divide-y divide-[#E5EBF0] text-xs">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center text-[#788596]">
                <CalendarIcon className="w-8 h-8 text-[#788596]/40 mx-auto mb-2" />
                <p className="font-semibold text-[#202938] text-sm">No deadlines scheduled</p>
                <p className="text-xs text-[#788596] mt-1">Try adjusting your filters or add a new event.</p>
              </div>
            ) : (
              filteredEvents
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(ev => {
                  const staff = allUsers.find(u => u.id === ev.assignedStaffId);
                  const isOverdue = ev.date < '2024-10-17';
                  const styleClass = getEventTypeStyles(ev.type);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => handleEventClick(ev)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F3F7FA] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="text-center min-w-[54px] p-2 rounded-xl bg-[#F3F7FA] border border-[#E5EBF0] flex-shrink-0 group-hover:border-[#087EDB]/30">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#788596] block">
                            {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-extrabold text-[#202938] block leading-tight">
                            {new Date(ev.date).getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#202938] group-hover:text-[#087EDB] transition-colors text-sm">
                              {ev.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styleClass}`}>
                              {ev.type}
                            </span>
                            {isOverdue && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                                Overdue
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-[#788596] flex items-center gap-2 mt-1">
                            {ev.clientName && (
                              <span className="flex items-center gap-1 font-medium text-[#202938]">
                                <Building2 className="w-3.5 h-3.5 text-[#788596]" />
                                {ev.clientName}
                              </span>
                            )}
                            {ev.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#788596]" />
                                {ev.time}
                              </span>
                            )}
                            {staff && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#788596]" />
                                {staff.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Open Item
                        </Button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Event Creation Modal */}
      {isEventModalOpen && (
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          title="Schedule Practice Deadline / Event"
          subtitle="Add statutory filing deadlines, client document due dates, or team review checkpoints."
          maxWidth="md"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Event / Deadline Title *</label>
              <input
                type="text"
                required
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                placeholder="e.g. Q3 VAT Return Statutory Submission"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Event Type *</label>
                <select
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value as CalendarEvent['type'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Task Deadline">Task Deadline</option>
                  <option value="Document Due">Document Due</option>
                  <option value="Invoice Due">Invoice Due</option>
                  <option value="Client Review">Client Review</option>
                  <option value="Team Meeting">Team Meeting</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Client *</label>
                <select
                  value={newEventClientId}
                  onChange={e => setNewEventClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Filing / Due Date *</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Time (Optional)</label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={e => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Assigned Practice Staff</label>
              <select
                value={newEventStaffId}
                onChange={e => setNewEventStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {allUsers
                  .filter(u => u.role !== 'Client')
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsEventModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Schedule Deadline
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
