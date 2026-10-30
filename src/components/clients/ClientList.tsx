import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Building2,
  Mail,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  FileQuestion,
  AlertTriangle,
  ArrowUpDown,
  Building,
  Sparkles,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ClientDetailModal } from './ClientDetailModal';
import { ClientImportModal } from './ClientImportModal';
import { Client, ClientType, ClientStatus, BillingFrequency } from '../../types';

export const ClientList: React.FC = () => {
  const {
    clients,
    allUsers,
    tasks,
    documentRequests,
    addClient,
    updateClient,
    selectedClientId,
    setSelectedClientId,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [missingDocFilter, setMissingDocFilter] = useState<boolean>(false);
  const [overdueWorkFilter, setOverdueWorkFilter] = useState<boolean>(false);

  // Edit / Add Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    clientType: 'Corporate' as ClientType,
    email: '',
    phone: '',
    address: '',
    country: 'United States',
    currency: 'USD' as 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD',
    timeZone: 'America/New_York',
    assignedAccountantId: allUsers[2]?.id || '',
    services: ['Monthly Bookkeeping', 'Payroll Operations'],
    startDate: new Date().toISOString().split('T')[0],
    billingFrequency: 'Monthly Retainer' as BillingFrequency,
    status: 'Active' as ClientStatus,
    notes: '',
    portalAccessEnabled: true,
  });

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      company: '',
      name: '',
      clientType: 'Corporate',
      email: '',
      phone: '',
      address: '',
      country: 'United States',
      currency: 'USD',
      timeZone: 'America/New_York',
      assignedAccountantId: allUsers[2]?.id || '',
      services: ['Monthly Bookkeeping', 'Payroll Operations'],
      startDate: new Date().toISOString().split('T')[0],
      billingFrequency: 'Monthly Retainer',
      status: 'Active',
      notes: '',
      portalAccessEnabled: true,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      company: client.company,
      name: client.name,
      clientType: client.clientType,
      email: client.email,
      phone: client.phone,
      address: client.address,
      country: client.country,
      currency: client.currency,
      timeZone: client.timeZone,
      assignedAccountantId: client.assignedAccountantId,
      services: client.services,
      startDate: client.startDate,
      billingFrequency: client.billingFrequency,
      status: client.status,
      notes: client.notes,
      portalAccessEnabled: client.portalAccessEnabled,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.email.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient({
        ...formData,
        teamMemberIds: [formData.assignedAccountantId],
      });
    }
    setIsFormModalOpen(false);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch =
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.clientType !== typeFilter) return false;
      if (staffFilter !== 'all' && c.assignedAccountantId !== staffFilter) return false;

      if (missingDocFilter) {
        const hasMissing = documentRequests.some(
          r =>
            r.clientId === c.id &&
            (r.status === 'Sent' || r.status === 'Partially Received' || r.status === 'Changes Requested')
        );
        if (!hasMissing) return false;
      }

      if (overdueWorkFilter) {
        const hasOverdue = tasks.some(
          t => t.clientId === c.id && t.status !== 'Completed' && t.dueDate < '2024-10-17'
        );
        if (!hasOverdue) return false;
      }

      return true;
    });
  }, [clients, search, statusFilter, typeFilter, staffFilter, missingDocFilter, overdueWorkFilter, documentRequests, tasks]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportCSV = () => {
    const headers = ['Company', 'Contact Person', 'Email', 'Client Type', 'Country', 'Currency', 'Status', 'Services'];
    const rows = filteredClients.map(c => [
      `"${c.company.replace(/"/g, '""')}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.clientType}"`,
      `"${c.country}"`,
      `"${c.currency}"`,
      `"${c.status}"`,
      `"${c.services.join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LedgerFlow_Clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your firm’s business entities, service scopes, assigned accountants, and onboarding status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Add New Client
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company name, contact, or email address..."
              className="w-full pl-9 pr-4 py-2 bg-[#F3F7FA] hover:bg-white focus:bg-white border border-[#E5EBF0] rounded-xl text-xs sm:text-sm text-[#202938] placeholder-[#788596] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 focus:border-[#087EDB] transition-all shadow-subtle"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#E5EBF0] rounded-xl text-xs bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-[#E5EBF0] rounded-xl text-xs bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
            >
              <option value="all">All Entity Types</option>
              <option value="Corporate">Corporate</option>
              <option value="LLC / Partnership">LLC / Partnership</option>
              <option value="Sole Proprietor">Sole Proprietor</option>
              <option value="Non-Profit">Non-Profit</option>
            </select>

            <select
              value={staffFilter}
              onChange={e => setStaffFilter(e.target.value)}
              className="px-3 py-2 border border-[#E5EBF0] rounded-xl text-xs bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
            >
              <option value="all">All Staff</option>
              {allUsers
                .filter(u => u.role !== 'Client')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Quick toggles */}
        <div className="flex items-center gap-4 pt-2 text-xs text-[#788596] border-t border-[#E5EBF0] flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#202938] select-none">
            <input
              type="checkbox"
              checked={missingDocFilter}
              onChange={e => setMissingDocFilter(e.target.checked)}
              className="rounded border-[#E5EBF0] text-[#087EDB] focus:ring-[#087EDB]/20"
            />
            <span className="font-medium">Missing Documents</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-[#202938] select-none">
            <input
              type="checkbox"
              checked={overdueWorkFilter}
              onChange={e => setOverdueWorkFilter(e.target.checked)}
              className="rounded border-[#E5EBF0] text-[#087EDB] focus:ring-[#087EDB]/20"
            />
            <span className="font-medium">Has Overdue Tasks</span>
          </label>

          <span className="ml-auto text-xs font-semibold text-[#788596]">
            Showing <strong className="text-[#202938]">{filteredClients.length}</strong> of {clients.length} clients
          </span>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3F7FA] border-b border-[#E5EBF0] text-[#788596] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Client / Company</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Lead Accountant</th>
                <th className="py-3.5 px-4">Active Services</th>
                <th className="py-3.5 px-4 text-center">Open Tasks</th>
                <th className="py-3.5 px-4 text-center">Missing Docs</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#788596] font-medium">
                    No clients match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const staff = allUsers.find(u => u.id === client.assignedAccountantId);
                  const clientTasks = tasks.filter(t => t.clientId === client.id);
                  const openTasks = clientTasks.filter(t => t.status !== 'Completed');
                  const overdueCount = openTasks.filter(t => t.dueDate < '2024-10-17').length;

                  const clientDocs = documentRequests.filter(r => r.clientId === client.id);
                  const missingCount = clientDocs.filter(
                    r =>
                      r.status === 'Sent' ||
                      r.status === 'Partially Received' ||
                      r.status === 'Changes Requested'
                  ).length;

                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="hover:bg-[#F3F7FA] transition-colors cursor-pointer group"
                    >
                      {/* Name & Company */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                            {client.company.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#202938] truncate group-hover:text-[#087EDB] transition-colors tracking-tight">
                              {client.company}
                            </p>
                            <p className="text-[11px] text-[#788596] truncate mt-0.5">
                              {client.name} • {client.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type & Country */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#202938]">{client.clientType}</span>
                        <div className="text-[10px] text-[#788596] font-medium mt-0.5">{client.country}</div>
                      </td>

                      {/* Assigned Accountant */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#5DB321]" />
                          <span className="font-semibold text-[#202938]">
                            {staff?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Services */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {client.services.slice(0, 2).map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[#F3F7FA] text-[#202938] border border-[#E5EBF0] rounded-md text-[10px] font-medium truncate"
                            >
                              {srv}
                            </span>
                          ))}
                          {client.services.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-[#F3F7FA] text-[#788596] border border-[#E5EBF0] rounded-md text-[10px] font-semibold">
                              +{client.services.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pending Tasks */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-[#202938]">
                            {openTasks.length} open
                          </span>
                          {overdueCount > 0 && (
                            <span className="text-[10px] text-rose-600 font-bold mt-0.5">
                              {overdueCount} overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Missing Documents */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {missingCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200/80 shadow-xs">
                            <FileQuestion className="w-3 h-3 text-amber-600" />
                            {missingCount} missing
                          </span>
                        ) : (
                          <span className="text-[#2A6605] font-semibold text-[11px] flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5DB321]" />
                            All clear
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge status={client.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={e => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(client)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClientId(client.id)}
                          >
                            Details →
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

      {/* Client Detail Modal */}
      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onEditClient={client => {
            setSelectedClientId(null);
            openEditModal(client);
          }}
        />
      )}

      {/* Add / Edit Client Modal */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingClient ? `Edit ${editingClient.company}` : 'Onboard New Accounting Client'}
          subtitle="Record client corporate structure, primary contact, billing terms, and assigned staff."
          maxWidth="3xl"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Legal Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Acme Health Technologies Inc."
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe (Managing Director)"
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@acmehealth.com"
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2830"
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Suite 400, 100 Financial Way, City, State/Region, Postal Code"
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jurisdiction / Country
                </label>
                <select
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="European Union">European Union</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value as any })}
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Entity Type
                </label>
                <select
                  value={formData.clientType}
                  onChange={e => setFormData({ ...formData, clientType: e.target.value as ClientType })}
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="Corporate">Corporate</option>
                  <option value="LLC / Partnership">LLC / Partnership</option>
                  <option value="Sole Proprietor">Sole Proprietor</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Assigned Accountant
                </label>
                <select
                  value={formData.assignedAccountantId}
                  onChange={e => setFormData({ ...formData, assignedAccountantId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Frequency
                </label>
                <select
                  value={formData.billingFrequency}
                  onChange={e => setFormData({ ...formData, billingFrequency: e.target.value as BillingFrequency })}
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="Monthly Retainer">Monthly Retainer</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                  <option value="Hourly / Project">Hourly / Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Engagement Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Practice Notes & Engagement Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Banking portals used, tax deadlines, fiscal year end, specific partner instructions..."
                  className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingClient ? 'Save Changes' : 'Create Client'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CSV Client Migration & Import Wizard */}
      <ClientImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
