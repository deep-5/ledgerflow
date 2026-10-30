import React, { useState } from 'react';
import {
  Clock,
  Play,
  StopCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Check,
  Trash2,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TimeEntry } from '../../types';

export const TimeTracking: React.FC = () => {
  const {
    timeEntries,
    clients,
    tasks,
    currentUser,
    allUsers,
    activeTimer,
    startTimer,
    stopTimer,
    addManualTimeEntry,
    approveTimeEntry,
    deleteTimeEntry,
    addInvoice,
    setCurrentView,
  } = useApp();

  // Manual Entry Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [taskId, setTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [billable, setBillable] = useState(true);
  const [rate, setRate] = useState(175);

  // Convert to Invoice Modal
  const [convertingEntry, setConvertingEntry] = useState<TimeEntry | null>(null);

  // Live timer active calculations
  const formatTimerClock = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Metrics
  const totalMinutes = timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const billableHours = (
    timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.durationMinutes, 0) / 60
  ).toFixed(1);
  const unbilledValue = timeEntries
    .filter(e => e.billable && !e.invoiced)
    .reduce((sum, e) => sum + (e.durationMinutes / 60) * e.billingRate, 0);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    const task = tasks.find(t => t.id === taskId);
    if (!client || !description.trim()) return;

    addManualTimeEntry({
      clientId: client.id,
      clientName: client.company,
      taskId: task?.id,
      taskTitle: task?.title,
      description: description.trim(),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + durationMinutes * 60000).toISOString(),
      durationMinutes: Number(durationMinutes),
      billable,
      billingRate: Number(rate),
      approved: false,
      invoiced: false,
    });

    setIsManualModalOpen(false);
    setDescription('');
  };

  const handleConvertToInvoice = (entry: TimeEntry) => {
    const client = clients.find(c => c.id === entry.clientId);
    if (!client) return;

    const hours = (entry.durationMinutes / 60).toFixed(1);
    const amount = Number(hours) * entry.billingRate;

    addInvoice({
      invoiceNumber: `INV-TIME-${Date.now().toString().slice(-4)}`,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientAddress: client.address,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      currency: client.currency,
      lines: [
        {
          id: `line-${Date.now()}`,
          description: `${entry.description} (${hours} hrs @ ${formatCurrency(entry.billingRate, client.currency)}/hr)`,
          quantity: Number(hours),
          unitPrice: entry.billingRate,
          taxRatePercent: 0,
          total: amount,
        },
      ],
      subtotal: amount,
      taxTotal: 0,
      total: amount,
      status: 'Sent',
      notes: 'Billed from approved practice timesheet.',
      paymentTerms: 'Net 15',
    });

    setConvertingEntry(null);
    setCurrentView('invoices');
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main">Time Tracking & Billing Records</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Log billable hours, reconcile staff timesheets, and convert approved time into client invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsManualModalOpen(true)}
          >
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Live Timer Card */}
      <div className="p-6 bg-white border border-[#E5EBF0] rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
              activeTimer
                ? 'bg-rose-50 border-rose-200 text-rose-600 ring-4 ring-rose-50'
                : 'bg-[#D9EFFA] border-[#BCE3F7] text-[#087EDB]'
            }`}
          >
            <Clock className={`w-7 h-7 ${activeTimer ? 'animate-spin' : ''}`} />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#788596] block">
              {activeTimer ? 'Current Work Session' : 'Ready to Track'}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#202938] tracking-tight">
              {activeTimer ? formatTimerClock(activeTimer.elapsedSeconds) : '00:00:00'}
            </div>
            {activeTimer && (
              <p className="text-xs text-[#788596] mt-0.5">
                Client: <strong className="text-[#202938]">{clients.find(c => c.id === activeTimer.clientId)?.company}</strong> •{' '}
                {activeTimer.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTimer ? (
            <Button
              variant="danger"
              size="md"
              icon={<StopCircle className="w-4 h-4" />}
              onClick={stopTimer}
            >
              Stop & Log Work
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                id="quickTimerClient"
                className="px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-xs bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                size="md"
                icon={<Play className="w-4 h-4 fill-current" />}
                onClick={() => {
                  const sel = (document.getElementById('quickTimerClient') as HTMLSelectElement)?.value || clients[0]?.id;
                  startTimer(sel, undefined, 'Active practice service session');
                }}
              >
                Start Live Timer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Total Hours Tracked</span>
          <div className="text-2xl font-black text-[#202938] tracking-tight mt-1">{totalHours} hrs</div>
          <span className="text-[11px] text-[#788596] mt-1 block">Across all engagements</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Billable Work</span>
          <div className="text-2xl font-black text-[#087EDB] tracking-tight mt-1">{billableHours} hrs</div>
          <span className="text-[11px] text-[#087EDB] font-medium mt-1 block">92% billable ratio</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#A7F477] transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Unbilled Time Value</span>
          <div className="text-2xl font-black text-[#2A6605] tracking-tight mt-1">
            {formatCurrency(unbilledValue, 'USD')}
          </div>
          <span className="text-[11px] text-[#2A6605] font-medium mt-1 block">
            Available to convert to invoices
          </span>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3F7FA] border-b border-[#E5EBF0] text-[#788596] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Staff Member</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Task & Scope</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4">Rate</th>
                <th className="py-3.5 px-4">Approval</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {timeEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#788596] font-medium">
                    No time entries recorded.
                  </td>
                </tr>
              ) : (
                timeEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-[#F3F7FA] transition-colors">
                    <td className="py-4 px-6 font-bold text-[#202938]">
                      {entry.staffName}
                    </td>

                    <td className="py-4 px-4 font-semibold text-[#202938]">
                      {entry.clientName}
                    </td>

                    <td className="py-4 px-4 max-w-[260px]">
                      <div className="truncate font-semibold text-[#202938]">{entry.description}</div>
                      {entry.taskTitle && (
                        <div className="text-[10px] text-[#788596] truncate mt-0.5">
                          Task: {entry.taskTitle}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-[#788596] whitespace-nowrap">
                      {formatDate(entry.startTime)}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#202938] whitespace-nowrap">
                      {(entry.durationMinutes / 60).toFixed(1)} hrs
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-[#788596] font-medium">
                      {entry.billable ? `${formatCurrency(entry.billingRate, 'USD')}/hr` : 'Non-billable'}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          entry.approved
                            ? 'bg-[#EBFDD8] text-[#2A6605] border-[#A7F477]'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {entry.approved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!entry.approved && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => approveTimeEntry(entry.id)}
                          >
                            Approve
                          </Button>
                        )}

                        {entry.approved && !entry.invoiced && entry.billable && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Receipt className="w-3.5 h-3.5 text-brand-600" />}
                            onClick={() => handleConvertToInvoice(entry)}
                          >
                            Create Invoice
                          </Button>
                        )}

                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="p-1.5 text-text-secondary hover:text-rose-600 rounded"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Time Entry Modal */}
      {isManualModalOpen && (
        <Modal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          title="Record Manual Practice Work Time"
          subtitle="Log billable advisory, phone consults, or offline audit work."
          maxWidth="md"
        >
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-text-main mb-1">Target Client *</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Associated Task</label>
              <select
                value={taskId}
                onChange={e => setTaskId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg bg-white"
              >
                <option value="">General Client Consultation</option>
                {tasks
                  .filter(t => t.clientId === clientId)
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">
                Work Scope & Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Reconciliation review with client CFO..."
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  step="15"
                  min="15"
                  required
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  step="25"
                  min="0"
                  value={rate}
                  onChange={e => setRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billableCheck"
                checked={billable}
                onChange={e => setBillable(e.target.checked)}
                className="rounded border-gray-300 text-brand-600"
              />
              <label htmlFor="billableCheck" className="text-text-main font-semibold">
                Billable Work Entry
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsManualModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Time Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
