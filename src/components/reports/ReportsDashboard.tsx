import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Receipt,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ReportsDashboard: React.FC = () => {
  const { clients, tasks, documentRequests, invoices, timeEntries, allUsers } = useApp();

  const [dateRange, setDateRange] = useState('Current Fiscal Quarter (Q4 2024)');
  const [selectedClientFilter, setSelectedClientFilter] = useState('all');

  // Calculations
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate < '2024-10-17').length;
  const totalBillableMinutes = timeEntries.filter(t => t.billable).reduce((s, t) => s + t.durationMinutes, 0);
  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalUnpaid = invoices.reduce((s, i) => s + i.balanceDue, 0);

  // Service Breakdown
  const serviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      counts[t.serviceCategory] = (counts[t.serviceCategory] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / (tasks.length || 1)) * 100),
    }));
  }, [tasks]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Task Title', 'Client', 'Service', 'Due Date', 'Status', 'Estimated Hours', 'Actual Hours'];
    const rows = tasks.map(t => {
      const client = clients.find(c => c.id === t.clientId);
      return [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(client?.company || '').replace(/"/g, '""')}"`,
        `"${t.serviceCategory}"`,
        t.dueDate,
        t.status,
        t.estimatedHours,
        t.actualHours,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LedgerFlow_Operations_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202938]">Practice Operational Reports</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7]">
              Operational Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#788596] mt-0.5">
            Operational turnaround velocity, client response bottlenecks, billable capacity, and fee realizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={handleExportCSV}
          >
            Export CSV Dataset
          </Button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#E5EBF0] shadow-card flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="w-8 h-8 rounded-xl bg-[#F3F7FA] border border-[#E5EBF0] text-[#788596] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-bold focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
          >
            <option value="Current Fiscal Quarter (Q4 2024)">Current Fiscal Quarter (Q4 2024)</option>
            <option value="Year to Date 2024">Year to Date 2024</option>
            <option value="Previous Month">Previous Month (September 2024)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[#788596] font-semibold">Filter Client Entity:</span>
          <select
            value={selectedClientFilter}
            onChange={e => setSelectedClientFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-medium focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
          >
            <option value="all">All Practice Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#A7F477] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Tasks Completed</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBFDD8] border border-[#A7F477] text-[#2A6605] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2A6605] mt-2 tracking-tight">{completedTasks}</div>
          <span className="text-[11px] text-[#788596] mt-1 block">Closed out in scope this quarter</span>
        </div>

        <div className="p-4 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Overdue Deadlines</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2 tracking-tight">{overdueTasks}</div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Immediate staff action needed</span>
        </div>

        <div className="p-4 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Billable Logged</span>
            <div className="w-8 h-8 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#087EDB] mt-2 tracking-tight">
            {(totalBillableMinutes / 60).toFixed(1)} hrs
          </div>
          <span className="text-[11px] text-[#788596] mt-1 block">Staff logged timesheet records</span>
        </div>

        <div className="p-4 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Practice Billing</span>
            <div className="w-8 h-8 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#202938] mt-2 tracking-tight">
            {formatCurrency(totalRevenue, 'USD')}
          </div>
          <span className="text-[11px] text-[#2A6605] font-bold mt-1 block">
            {formatCurrency(totalCollected, 'USD')} collected • {formatCurrency(totalUnpaid, 'USD')} open
          </span>
        </div>
      </div>

      {/* Reports Tables & Analytics breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work by Client Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#202938]">Operational Workload by Client</h3>
              <p className="text-xs text-[#788596]">Active tasks and document submissions</p>
            </div>
            <span className="text-xs font-semibold text-[#788596]">{clients.length} Accounts</span>
          </div>

          <div className="divide-y divide-[#E5EBF0] text-xs">
            {clients.map(client => {
              const clientTasks = tasks.filter(t => t.clientId === client.id);
              const clientDocs = documentRequests.filter(r => r.clientId === client.id);
              const openCount = clientTasks.filter(t => t.status !== 'Completed').length;
              const missingDocs = clientDocs.filter(r => r.status !== 'Completed').length;

              return (
                <div key={client.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#F3F7FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F3F7FA] border border-[#E5EBF0] text-[#202938] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {client.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#202938]">{client.company}</p>
                      <p className="text-[11px] text-[#788596]">
                        {client.clientType} • {client.billingFrequency} billing
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="font-bold text-[#202938] block">
                      {openCount} active tasks
                    </span>
                    <span
                      className={`text-[11px] font-bold block ${
                        missingDocs > 0 ? 'text-amber-600' : 'text-[#2A6605]'
                      }`}
                    >
                      {missingDocs > 0 ? `${missingDocs} missing doc sets` : 'Documents complete'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Utilization & Efficiency */}
        <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#202938]">Staff Billable Time & Weekly Capacity</h3>
              <p className="text-xs text-[#788596]">Hours logged vs contractual weekly target</p>
            </div>
            <span className="text-xs font-semibold text-[#788596]">Practice Team</span>
          </div>

          <div className="divide-y divide-[#E5EBF0] text-xs">
            {allUsers
              .filter(u => u.role !== 'Client')
              .map(staff => {
                const staffTime = timeEntries.filter(t => t.staffId === staff.id);
                const hours = (staffTime.reduce((s, t) => s + t.durationMinutes, 0) / 60).toFixed(1);
                const capacity = staff.weeklyCapacityHours || 40;
                const percent = Math.min(100, Math.round((Number(hours) / capacity) * 100));

                return (
                  <div key={staff.id} className="p-4 space-y-2 hover:bg-[#F3F7FA] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] font-bold text-xs flex items-center justify-center">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#202938]">{staff.name}</span>
                          <span className="text-[11px] text-[#788596] ml-1.5 font-medium">
                            ({staff.role})
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-[#202938]">
                        {hours} hrs <span className="text-[#788596] font-normal">/ {capacity}h target</span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#E5EBF0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent > 90 ? 'bg-amber-500' : 'bg-[#087EDB]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Service Category Distribution */}
      <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card p-5">
        <h3 className="font-bold text-sm text-[#202938] mb-1">Service Category Distribution</h3>
        <p className="text-xs text-[#788596] mb-4">Breakdown of active engagements by client service discipline</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {serviceBreakdown.map(service => (
            <div key={service.name} className="p-3.5 bg-[#F3F7FA] border border-[#E5EBF0] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#202938] truncate">{service.name}</span>
                <span className="font-extrabold text-[#087EDB]">{service.count} tasks</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5EBF0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#087EDB] rounded-full"
                  style={{ width: `${service.percent}%` }}
                />
              </div>
              <span className="text-[10px] text-[#788596] block pt-0.5">{service.percent}% of practice workload</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-[#F3F7FA] border border-[#E5EBF0] rounded-2xl text-xs text-[#788596] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#087EDB] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#202938]">Regulatory & Operational Note:</strong> LedgerFlow practice management reports are designed for firm capacity planning, client turnaround tracking, and operational invoicing. They provide practice workflow metrics and do not constitute certified statutory financial statements or tax audit opinions.
        </p>
      </div>
    </div>
  );
};
