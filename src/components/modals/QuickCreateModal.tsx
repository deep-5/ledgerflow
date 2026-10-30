import React, { useState } from 'react';
import {
  CheckSquare,
  Users,
  FileCheck,
  Receipt,
  MessageSquare,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ClientType, TaskPriority, TaskStatus } from '../../types';

export const QuickCreateModal: React.FC = () => {
  const {
    quickCreateOpen,
    setQuickCreateOpen,
    clients,
    allUsers,
    addTask,
    addClient,
    addDocumentRequest,
    addInvoice,
    createThread,
    setCurrentView,
    setSelectedClientId,
  } = useApp();

  type TabType = 'task' | 'client' | 'document' | 'invoice' | 'message';
  const [activeTab, setActiveTab] = useState<TabType>('task');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskClientId, setTaskClientId] = useState(clients[0]?.id || '');
  const [taskCategory, setTaskCategory] = useState('Monthly Bookkeeping');
  const [taskAssignee, setTaskAssignee] = useState(allUsers[2]?.id || allUsers[0]?.id || '');
  const [taskReviewer, setTaskReviewer] = useState(allUsers[4]?.id || allUsers[1]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState(3.0);
  const [taskDescription, setTaskDescription] = useState('');

  // Client Form State
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientType, setClientType] = useState<ClientType>('Corporate');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCountry, setClientCountry] = useState('United States');
  const [clientCurrency, setClientCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  const [clientAccountant, setClientAccountant] = useState(allUsers[2]?.id || '');

  // Document Request Form State
  const [docReqTitle, setDocReqTitle] = useState('');
  const [docReqClientId, setDocReqClientId] = useState(clients[0]?.id || '');
  const [docReqDueDate, setDocReqDueDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [docReqItems, setDocReqItems] = useState('Bank Statement PDF\nCredit Card Expense Receipts\nPayroll Summary');
  const [docReqInstructions, setDocReqInstructions] = useState('Please upload clear digital PDF copies for monthly compliance review.');

  // Invoice Form State
  const [invClientId, setInvClientId] = useState(clients[0]?.id || '');
  const [invNumber, setInvNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invDueDate, setInvDueDate] = useState(new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0]);
  const [invDescription, setInvDescription] = useState('Monthly Accounting & Controller Retainer');
  const [invAmount, setInvAmount] = useState(1500);

  // Message Form State
  const [msgClientId, setMsgClientId] = useState(clients[0]?.id || '');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgIsInternal, setMsgIsInternal] = useState(false);

  if (!quickCreateOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskClientId) return;

    addTask({
      title: taskTitle.trim(),
      clientId: taskClientId,
      serviceCategory: taskCategory,
      description: taskDescription || 'Created via Quick Action.',
      assignedStaffId: taskAssignee,
      reviewerId: taskReviewer,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'Not Started' as TaskStatus,
      estimatedHours: Number(taskEstimatedHours) || 1,
      actualHours: 0,
      tags: [taskCategory],
    });

    setQuickCreateOpen(false);
    setCurrentView('tasks');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany.trim() || !clientEmail.trim()) return;

    const newClient = addClient({
      name: clientName || clientCompany,
      company: clientCompany,
      clientType,
      email: clientEmail,
      phone: clientPhone || '+1 (555) 000-0000',
      address: 'Corporate Headquarters',
      country: clientCountry,
      currency: clientCurrency,
      timeZone: 'America/New_York',
      assignedAccountantId: clientAccountant,
      teamMemberIds: [clientAccountant],
      services: ['Monthly Bookkeeping', 'Advisory'],
      startDate: new Date().toISOString().split('T')[0],
      billingFrequency: 'Monthly Retainer',
      status: 'Active',
      notes: 'New practice client onboarding.',
      portalAccessEnabled: true,
    });

    setQuickCreateOpen(false);
    setSelectedClientId(newClient.id);
    setCurrentView('clients');
  };

  const handleCreateDocRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docReqTitle.trim() || !docReqClientId) return;

    const lines = docReqItems
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    addDocumentRequest({
      title: docReqTitle.trim(),
      clientId: docReqClientId,
      requestedByStaffId: allUsers[0]?.id || 'user-1',
      assignedReviewerId: allUsers[4]?.id || 'user-5',
      dateSent: new Date().toISOString().split('T')[0],
      dueDate: docReqDueDate,
      status: 'Sent',
      instructions: docReqInstructions,
      reminderSchedule: 'Every 3 Days',
      items: lines.map((name, i) => ({
        id: `doc-item-${Date.now()}-${i}`,
        name,
        required: true,
      })),
    });

    setQuickCreateOpen(false);
    setCurrentView('documents');
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientId || !invAmount) return;

    const client = clients.find(c => c.id === invClientId);
    const amount = Number(invAmount) || 0;

    addInvoice({
      invoiceNumber: invNumber,
      clientId: invClientId,
      clientName: client?.name || 'Client',
      clientCompany: client?.company || 'Company',
      clientAddress: client?.address || 'Client Address',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate,
      currency: client?.currency || 'USD',
      lines: [
        {
          id: `line-${Date.now()}`,
          description: invDescription,
          quantity: 1,
          unitPrice: amount,
          taxRatePercent: 0,
          total: amount,
        },
      ],
      subtotal: amount,
      taxTotal: 0,
      total: amount,
      status: 'Sent',
      notes: 'Standard firm fee invoice. Payment terms: Net 15.',
      paymentTerms: 'Net 15',
    });

    setQuickCreateOpen(false);
    setCurrentView('invoices');
  };

  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgClientId || !msgSubject.trim() || !msgContent.trim()) return;

    createThread(msgClientId, msgSubject.trim(), msgContent.trim(), msgIsInternal);
    setQuickCreateOpen(false);
    setCurrentView('messages');
  };

  return (
    <Modal
      isOpen={quickCreateOpen}
      onClose={() => setQuickCreateOpen(false)}
      title="Create New Practice Action"
      subtitle="Select the action type below to quickly record work, clients, or document requests."
      maxWidth="3xl"
    >
      {/* Tab selection */}
      <div className="flex border-b border-[#E5EBF0] -mt-2 pb-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('task')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'task'
              ? 'bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7] font-bold'
              : 'text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-[#087EDB]" />
          Task
        </button>
        <button
          onClick={() => setActiveTab('client')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'client'
              ? 'bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7] font-bold'
              : 'text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
          }`}
        >
          <Users className="w-4 h-4 text-[#2A6605]" />
          Client
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'document'
              ? 'bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7] font-bold'
              : 'text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
          }`}
        >
          <FileCheck className="w-4 h-4 text-amber-600" />
          Document Request
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'invoice'
              ? 'bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7] font-bold'
              : 'text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
          }`}
        >
          <Receipt className="w-4 h-4 text-indigo-600" />
          Service Invoice
        </button>
        <button
          onClick={() => setActiveTab('message')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'message'
              ? 'bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7] font-bold'
              : 'text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#087EDB]" />
          Message Thread
        </button>
      </div>

      {/* Task Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="e.g. October Accruals & Bank Reconciliation"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Client *</label>
              <select
                value={taskClientId}
                onChange={e => setTaskClientId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Service Category</label>
              <select
                value={taskCategory}
                onChange={e => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Monthly Bookkeeping">Monthly Bookkeeping</option>
                <option value="Payroll Operations">Payroll Operations</option>
                <option value="Corporate Tax Filing">Corporate Tax Filing</option>
                <option value="UK VAT Filing">UK VAT Filing</option>
                <option value="Sales Tax Prep">Sales Tax Prep</option>
                <option value="Advisory & Forecasts">Advisory & Forecasts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Assigned Staff</label>
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
              <label className="block text-xs font-semibold text-text-main mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={taskEstimatedHours}
                onChange={e => setTaskEstimatedHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">Description & Instructions</label>
              <textarea
                rows={2}
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                placeholder="Scope of work, checklist instructions, ledger references..."
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      )}

      {/* Client Form */}
      {activeTab === 'client' && (
        <form onSubmit={handleCreateClient} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Company / Entity Name *</label>
              <input
                type="text"
                required
                value={clientCompany}
                onChange={e => setClientCompany(e.target.value)}
                placeholder="e.g. Apex BioTech Solutions LLC"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="rachel@apexbiotech.com"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Phone Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Client Entity Type</label>
              <select
                value={clientType}
                onChange={e => setClientType(e.target.value as ClientType)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white"
              >
                <option value="Corporate">Corporate (C-Corp / Ltd)</option>
                <option value="LLC / Partnership">LLC / Partnership</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Non-Profit">Non-Profit (501c3 / Charity)</option>
                <option value="Individual">Individual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Country / Currency</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={clientCountry}
                  onChange={e => setClientCountry(e.target.value)}
                  className="px-2 py-2 border border-surface-border rounded-lg text-xs bg-white"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany / EU</option>
                </select>
                <select
                  value={clientCurrency}
                  onChange={e => setClientCurrency(e.target.value as any)}
                  className="px-2 py-2 border border-surface-border rounded-lg text-xs bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">Lead Assigned Accountant</label>
              <select
                value={clientAccountant}
                onChange={e => setClientAccountant(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white"
              >
                {allUsers
                  .filter(u => u.role !== 'Client')
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Client Record
            </Button>
          </div>
        </form>
      )}

      {/* Document Request Form */}
      {activeTab === 'document' && (
        <form onSubmit={handleCreateDocRequest} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">Request Title *</label>
              <input
                type="text"
                required
                value={docReqTitle}
                onChange={e => setDocReqTitle(e.target.value)}
                placeholder="e.g. October Bank Statements & Credit Card Receipts"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Target Client *</label>
              <select
                value={docReqClientId}
                onChange={e => setDocReqClientId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Submission Due Date *</label>
              <input
                type="date"
                required
                value={docReqDueDate}
                onChange={e => setDocReqDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">
                Required Document Items (One per line) *
              </label>
              <textarea
                rows={3}
                required
                value={docReqItems}
                onChange={e => setDocReqItems(e.target.value)}
                placeholder="Operating Bank Statement PDF&#10;Payroll Journal&#10;Loan Amortization Schedule"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm font-mono text-xs"
              />
              <span className="text-[11px] text-text-secondary">
                Each line will generate an upload slot in the client portal.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">Instructions for Client</label>
              <input
                type="text"
                value={docReqInstructions}
                onChange={e => setDocReqInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Document Request
            </Button>
          </div>
        </form>
      )}

      {/* Invoice Form */}
      {activeTab === 'invoice' && (
        <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Client *</label>
              <select
                value={invClientId}
                onChange={e => setInvClientId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={invNumber}
                onChange={e => setInvNumber(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1">Service Description *</label>
              <input
                type="text"
                required
                value={invDescription}
                onChange={e => setInvDescription(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Amount Due *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="50"
                  required
                  value={invAmount}
                  onChange={e => setInvAmount(parseFloat(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-surface-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={invDueDate}
                onChange={e => setInvDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate & Send Invoice
            </Button>
          </div>
        </form>
      )}

      {/* Message Form */}
      {activeTab === 'message' && (
        <form onSubmit={handleCreateMessage} className="space-y-4 pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Client Conversation *</label>
              <select
                value={msgClientId}
                onChange={e => setMsgClientId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Subject *</label>
              <input
                type="text"
                required
                value={msgSubject}
                onChange={e => setMsgSubject(e.target.value)}
                placeholder="e.g. Question on September Software Expense Invoices"
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Initial Message *</label>
              <textarea
                rows={3}
                required
                value={msgContent}
                onChange={e => setMsgContent(e.target.value)}
                placeholder="Type your message or internal staff memo..."
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="internalNoteCheck"
                checked={msgIsInternal}
                onChange={e => setMsgIsInternal(e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="internalNoteCheck" className="text-xs text-text-secondary">
                Record as <strong>Internal Team Memo</strong> (Hidden from client portal view)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Message
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
